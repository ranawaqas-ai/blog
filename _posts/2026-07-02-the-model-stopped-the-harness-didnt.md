---
title: "The Model Stopped. The Harness Didn't."
category: research
tag: [ai, llm, evaluation, tooling]
---

**Setup.** Same project as [the broken MMLU questions](/posts/the-answer-key-is-wrong/): before trusting any benchmark number, check what it is actually measuring. That post was about the *data* layer. This one is about the *harness* layer: a one-line bug in [lighteval](https://github.com/huggingface/lighteval), HuggingFace's evaluation framework, that made every chain-of-thought generation run to the token cap, wasted up to 95% of the GPU time, and silently corrupted generation-length as a measurement. Reported as [lighteval#1278](https://github.com/huggingface/lighteval/issues/1278), fix submitted as [PR #1279](https://github.com/huggingface/lighteval/pull/1279).

## The symptom

Running Gemma-4-E2B on MMLU physics with chain-of-thought, every single generation came back "truncated": `tokens_generated` exactly equal to the cap, ~145 seconds per item. The obvious diagnosis is a verbose model that needs a bigger budget. So the cap went from 2,048 to 7,168, and the result was... every generation now used exactly 7,168 tokens. A cap you can never out-run is not a capacity problem.

## The tell

Decoding one raw trace showed what the aggregate hid: the model finished its reasoning in a few hundred to ~2,700 tokens, wrote its answer, emitted its end-of-turn token, and then **63 to 95% of the generation was that same token repeated to the cap**. The model had stopped. The harness kept sampling.

![Stacked bar chart of one generation before and after the fix. Before: 394 real reasoning tokens then 6,774 tokens of repeated turn-end padding (95%), running to the 7,168 cap. After: 2,653 real tokens plus 1 stop token, stopping on its own.](/assets/img/reading-the-path/lighteval-eos-anatomy-2026-07-02.png)

## The trap: two "fixes" that silently did nothing

The natural repair is a stop sequence. Two attempts, both plausible, both silently ignored:

1. `stop_sequence=["<end_of_turn>"]` on the task, because that is what Gemma's turn terminator is called everywhere in tutorials. In this tokenizer the turn-end token (id 106) does not decode to that string.
2. The corrected string for token 106. Still padded to the cap.

Both failed for the same reason, visible only in lighteval's source: for chat models the harness assumes "generation stops with EOS token", drops task stop sequences, and passes `eos_token_id = tokenizer.eos_token_id` to `generate()`, **overriding the terminators the model itself declares**. Gemma's tokenizer EOS is token 1; its chat turns end with token 106; its `generation_config.eos_token_id` correctly declares `[1, 106, 50]`. The override throws that away, so nothing in the stopping criteria ever matches token 106.

This is a genuinely easy bug to write. The same footgun family (a chat turn terminator that is not the tokenizer's EOS) has bitten [transformers#38182](https://github.com/huggingface/transformers/issues/38182) and [unsloth#5386](https://github.com/unslothai/unsloth/issues/5386).

## The fix: one line

Prefer the model's declared terminators, fall back to the tokenizer's:

```python
eos_token_id=(
    self.model.generation_config.eos_token_id
    if self.model.generation_config.eos_token_id is not None
    else self.tokenizer.eos_token_id
),
```

Validated on the same item, same GPU:

| | before | after |
|---|---|---|
| tokens_generated | 7,168 (= cap) | 2,654 (stops on its own) |
| padding tokens | 6,774 | 1 |
| latency per item | 145 s | 55 s |
| extracted answer | correct | correct (unchanged) |

At the scale of the planned 488-item run, the before side is pinned by the cap: 488 x 145 s is about 20 hours of GPU time. The after side depends on average trace length; with most items finishing in a few hundred to ~2,700 tokens, the estimate is roughly 3 hours. (Estimate, not yet a measured run: the 55 s item above is one of the longest traces, not the average.)

## Why this is worse than wasted GPU time

The wall-clock is the visible cost. The quiet one: **`tokens_generated` stops being a measurement.** It tracks the cap, not the model, so any analysis that uses generation length as a signal of reasoning effort is analyzing a constant. And the cap-hits masquerade as model failures: one item in our error pool was "wrong" only because its answer got mangled by the never-stopping decode, and answered correctly the moment the stop worked. If your error analysis includes items a broken harness graded, you are partly studying the harness.

Three lessons, all cheap:

1. **A config knob that "should" fix it can be silently ignored.** Prove a fix with a one-item run; don't assert it.
2. **Special tokens are model-specific.** Read them from the tokenizer and `generation_config`; never hard-code the string you saw in a tutorial.
3. **Read one raw trace before trusting aggregates.** Every diagnosis in this story came from looking at actual tokens, not metrics.

A benchmark score is a measurement of a system: model, data, and harness. [The data can be broken](/posts/the-answer-key-is-wrong/). The harness can be broken. The number does not tell you which.

---

*The bug report is [lighteval#1278](https://github.com/huggingface/lighteval/issues/1278); the fix is [PR #1279](https://github.com/huggingface/lighteval/pull/1279).*
