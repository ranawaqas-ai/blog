---
title: "A Sliding Window on Entropy"
category: research
tag: [metacognition, ai, llm, evaluation]
---


*Updated 2026-07-01: batched inference, the scaled 16-item sweep, and a fourth defective MMLU item (r80). The updates are marked inline.*

**Setup.** Gemma-4-E2B (small) vs Qwen3-32B (reasoning model), on MMLU-physics items Gemma gets wrong. First I gold-cleaned the wrong set: of 59 Gemma-wrong items, **3 had wrong answer keys in MMLU itself** (~5%, verified against MMLU-Redux-2.0 + independent re-derivation), so those are excluded. We study real reasoning errors, not label noise. Then, on clean errors, I do two things the accuracy score can't: read the per-token reasoning path, and sweep temperature. **Scope:** this proves the *method* on two contrasting models (a small model vs a reasoning model); expanding to more models is the planned next step, not a claim made here.

## The 4 questions (all gold-clean; Gemma wrong at greedy, Qwen correct)

| # | question | gold | Gemma (greedy) | the trap |
|---|---|---|---|---|
| **r18** | which force lets the horse-cart system accelerate? | **A**, ground's friction on the horse | B | horse↔cart forces are *equal* (Newton's 3rd) |
| **r42** | object dropped through a hole in the Earth? | **C**, oscillates forever | B (flies into space) | it's SHM, not escape |
| **r159** | Moon shows same face → it rotates once per? | **B**, month | D (doesn't rotate) | tidal locking = 1 spin per orbit |
| **r47** | decay distance of a particle moving at 0.6c? | **D**, 450 m | C (360 m) | forgot time dilation |

Full text of all four is at the end.

## Method: sliding-window entropy

This is the sliding-window-entropy detector Shiqiang suggested (average the per-token entropy over a ~50-token window, flag where it exceeds a threshold, and dump those tokens with their surrounding text and top-5 alternatives). Here is how I understood and implemented it.

At every generated token the model emits a probability distribution over the whole vocabulary; its Shannon entropy (in bits) measures how torn the model is at that step: near 0 when one token dominates, higher when several compete. Raw per-token entropy is too spiky to read, so I smooth it: a centred sliding window of w ≈ 50 tokens, averaging the entropy inside it (W(i) = the mean entropy over tokens i-25 to i+25). I then flag any span where W(i) exceeds a threshold τ and surface those tokens with their surrounding sentences and the top-5 alternative tokens at the peak, turning a 700-1300-token reasoning trace into a short list of "where did the model *sustainedly* waver" regions instead of isolated single-token noise. Entropy is always computed on the model's raw (temperature-unscaled) distribution, so the same number means the same thing across the temperature sweep.

```python
# Sliding-window entropy detector
w, tau = 50, 1.0                          # window size (tokens), threshold (bits)

# 1. raw per-token entropy (temperature-unscaled), in bits
H = [entropy(p_i) for p_i in token_distributions]

# 2. centred moving average over the window
W = [mean(H[i - w//2 : i + w//2 + 1]) for i in range(len(H))]

# 3. flag contiguous spans where the windowed entropy is hot
spans = contiguous_runs(i for i in range(len(W)) if W[i] > tau)

# 4. report each flagged span
for span in spans:
    peak = argmax(W[span])
    report(text=decode(tokens[span]),
           windowed_entropy=W[peak],
           alternatives=top5(token_distributions[peak]))
```

![Animation: the 50-token window slides across Gemma's r18 reasoning; the smoothed entropy curve draws itself, the window flashes red and reveals the text when it crosses τ, and it ends on the p=1.000 commit.](/assets/img/reading-the-path/r18-sliding-window.gif)

## Finding 1: the path shows the error the answer hides (r18)

![Windowed per-token entropy on r18 for both models. Gemma's curve humps to ~1.45 bits at the 'frame' token where it confuses internal vs external forces and picks B; Qwen stays lower and peaks only on confident-correct reasoning. Both commit their final answer at p=1.0.](/assets/img/reading-the-path/fig-r18-entropy.png)

Gemma **states the correct fact** ("the horse and cart forces are equal and opposite") and then contradicts itself and picks B. The raw per-token entropy **spikes to 3 bits at the word "frame"** (the 50-token windowed mean, red, humps to ~1.4 there), the point where it confuses internal vs external forces and derails. Qwen (blue, bottom) has no such spike. The key point: **Gemma commits its wrong answer at p = 1.000.** The answer's confidence is totally blind to the error; only the *path* entropy flags it. So on this item the error is present in the path but not in the answer's confidence.

Here is the exact passage from the trace where the entropy humps, inside its evaluation of option B:

> ... the net force causing the system to accelerate is the external force applied by the horse to the ground (or the ground to the horse, depending on how you **frame** the system). This option correctly identifies the **necessary imbalance** of forces between the components ...

A clause earlier it wrote that these forces are "equal and opposite (action-reaction)", so calling option B a "necessary imbalance" is a direct self-contradiction. The windowed peak (w=50) lands on `frame` (1.45 bits) and the single hottest raw token is `necessary` (3.73 bits), the word that opens the contradiction. The top-5 alternatives at `frame` are frame, define, isolate, analyze, choose, all about how to set the problem up, which is the internal-versus-external fork the model never resolves.

## Finding 2: temperature separates two kinds of error (4 items)

> **Update (2026-07-01): the two-kinds split did not survive scale; it is a continuum.** How we got there: batching made the full sweep affordable, so the fix promised in next-step 2 was actually run (16 gold-clean items, 20 samples per temperature instead of 5). At n=20, "locked" r18 turned out to recover 6/20 at T=0.7, only r42 stayed at 0/20 at every temperature, and the 16 items' recovery rates spread continuously from 0/20 to 19/20 rather than splitting into two groups (see the fan of faint lines in the update section's figure). So the clean binary below was a small-sample artifact: with 5 samples, an item recovering at a true ~30% rate looks "locked" roughly one time in six. The text below is kept as the n=5 record; the defensible claim is now a *gradient of greedy-fragility*, with true lock-in rare (1 of 16).

![Temperature sweep, 4 items, both models. Top: accuracy vs temperature, Qwen flat at 1.0, Gemma splits into two locked-at-0 items and two that recover. Bottom: mean entropy vs temperature, Qwen rises on every item, Gemma stays flat.](/assets/img/reading-the-path/fig-temperature.png)

Sweeping temperature 0→1.0 (5 samples each):

- **Qwen is robust:** correct at every temperature, on every item (top-right).
- **Gemma splits into two error types** (top-left): **locked** (r18, r42: wrong at all temperatures, a genuine misconception) vs **greedy-fragile** (r159, r47: greedy picks wrong, but sampling recovers the correct answer 60-100% of the time). **Half of these "errors" dissolve under sampling.**
- **Entropy slope** (bottom): Qwen's entropy **rises** monotonically with temperature on all 4 items; Gemma's shows **no upward trend** on any (it wanders non-monotonically, netting ~zero). Qwen's token distributions are wide (it deliberates → temperature explores); Gemma's are peaked (it marches → temperature barely moves it).

## Does the entropy peak find the error on other items?

Shiqiang asked the sharp question here: on r18 the entropy peak sat right on the derailment, but does that hold on the other items, or is r18 just one nice example?

Answering it honestly means not fooling myself. I had already seen the entropy on r18, so any "yes, it lines up" from me is suspect. So I ran it blind: an independent grader that never saw any entropy marked the single decisive-error sentence in each of the four genuine-error traces, verbatim. Then I measured the entropy against those spans, with the correct (Qwen) traces as controls.

The honest result is that the entropy is a highlighter of the error region, not a pinpointer of the sentence.

![Four genuine-error traces: windowed entropy over token position, with the blind-annotated error span shaded and the global entropy peak dashed. Every error span sits above the trace median, but the peak lands on it only for r18 and r47.](/assets/img/reading-the-path/entropy-localization.png)

Every blind-marked error span sits well above the trace's median entropy (72nd to 99th percentile, mean 89th), so the reasoning does run hot where it goes wrong. But the single global peak lands on the decisive sentence in only 2 of 4 (r18 and r47, where it is adjacent). For r42 and r159 the peak is a different hump, the misconception as it is first expressed rather than the final commitment. So the method reliably flags the neighbourhood of the error, but you cannot read the exact error off the single highest point.

This is the version I trust, because it corrects the cleaner-looking claim r18 alone would have suggested.

## What the path and the sweep add beyond accuracy

The accuracy score reports only whether the final answer matches the key. On these items, the per-token path additionally locates where in the reasoning the model's uncertainty peaks, and the temperature sweep additionally separates errors that persist under sampling from those that do not. Both are properties the scalar score does not expose.

## Honest limits

~~4 items, n=5 per temperature: qualitative, not powered.~~ **[Fixed 2026-07-01: the sweep is now 16 items × 20 samples per temperature; that is what corrected Finding 2.]** Still true: same absolute temperature for both models (Shiqiang's fairness point stands: per-model-default sweeps are needed before any cross-model temperature claim); pure temperature only, no top-p pass; two models. The entropy localizes the error neighbourhood, not the exact sentence, and that blind check is still n=4. One new limit the r80 episode exposed: answers are read from traces capped at 3072 tokens, and a cap-hit can disguise a long correct deliberation (in r80's case, a refusal) as a wrong answer, so cap-hit "errors" need re-checking at a larger budget before they count.

## What to do next

**What this batch did.** A fixed-temperature sweep (the approach Shiqiang suggested): both models run at the *same* temperatures (0, 0.3, 0.7, 1.0) with 5 samples each, on 4 items. This is good for one specific thing: watching how *one* model behaves as *its own* temperature is turned up.

**Three limits of that setup, each with its fix:**

1. **It can't fairly compare the two models.** The same temperature can be a normal setting for one model and "too hot" for the other, so "Qwen beats Gemma at T=0.7" isn't a fair statement; it might just be Qwen's better operating point. *Fix:* also sweep each model around *its own* recommended temperature (e.g. 0.5× and 2× its default). That is the only setup in which a model-vs-model comparison is fair.
2. **It's too small to be a real number.** 4 items × 5 samples means a figure like "Gemma 1/5" is an illustration, not a measured rate. *Fix:* run all 15 gold-clean items with ≥20 samples per temperature, so the locked-vs-greedy-fragile split comes with error bars instead of anecdotes. **[Done 2026-07-01 with the batched runner; see the update section below.]**
3. **Only 2 models, and idealised decoding.** One small + one reasoning model, pure temperature only (no top-p/top-k), and just 4 temperature points. *Fix:* add more models, a finer temperature grid, and one realistic (top-p) decoding pass, to test whether "small model marches, reasoning model deliberates" generalises, and to locate where the locked→greedy-fragile switch happens.

**Defective MMLU items: now 4, not 3 (updated 2026-07-01).** The original count was 3 confirmed wrong answer keys (MMLU-Redux-2.0 already flags r67 and r152; r98 we caught independently via re-derivation). Since then the count grew, and the fourth is a different defect type. The trail: in the scaled sweep Qwen "failed" college r80 on 51 of 61 draws, which contradicted its ~0.99 accuracy everywhere else; checking those misses showed most had hit the 3072-token cap mid-reasoning, so the failure was re-run with a 16k budget; Qwen then finished naturally (4,041 tokens), derived the answer (10 µm by Wien's law), wrote that option A, "10:00 PM", *is a time, not a wavelength*, and answered UNKNOWN; reading the stored dataset row confirmed option A's text is literally `'10:00 PM'`, a corruption of "10 µm". So r80's gold *letter* is right but its option *text* is broken, which is why both MMLU-Redux's check and our gold-cleaning missed it: each validates the key, not the text. The catch itself is a small argument for reading traces: the model narrated the dataset bug that every letter-level check passed over.

![Animation: the sliding window crosses Qwen's 4,041-token r80 trace; 42 spans flag as the doubt phrases surface ("none of the options match... unless there's a mistake"), and it ends on "A. 10:00 PM: this is a time, not a wavelength" and Answer: UNKNOWN, with the corrupted dataset row shown.](/assets/img/reading-the-path/r80-doubt-loop-2026-07-02.gif)

Watching the detector cross the r80 trace shows the whole episode in one pass: 42 flagged spans, the doubt surfacing verbatim at the hot spots, and an ending that never commits.

![Animation: side-by-side sliding windows over Gemma's r18 trace and Qwen's r80 trace. r18 draws a single hot derail region and ends "commits B at p = 1.000"; r80 draws a sawtooth of 42 flagged spans and ends "Answer: UNKNOWN".](/assets/img/reading-the-path/failure-fingerprints-r18-vs-r80-2026-07-02.gif)

Side by side with r18, the same detector draws two different failure shapes: r18 is one derail ending in a confident wrong commit (p = 1.000), r80 is a sawtooth of recurring doubt ending in a refusal. An observation from two traces, not a finding, but it suggests the entropy profile's *shape*, not just its peaks, carries diagnostic information.

## Update (2026-07-01): batched inference, the sweep now runs ~4x faster

Shiqiang asked whether batched inference could be implemented in the current HuggingFace codebase. It could, with no new dependency: instead of generating a temperature group's samples one at a time, the runner replicates the prompt into a batch of n rows and generates them in a single `generate()` call, so the n sequences share each decode step's weight load. Measured A/B on the same item, same GPU, same framework:

![Bar chart, sequential vs batched wall-clock on the same sweep config. Gemma: 216 s sequential vs 46 s batched (4.7x). Qwen3-32B: 729 s vs 186 s (3.9x).](/assets/img/reading-the-path/batched-ab-timing-2026-07-01.png)

The grey bars are the existing per-sample loop; the blue bars are the same sweep as one batched call per temperature. The gain lands near the ideal 5x because the 5 samples of one item finish at similar lengths, so little compute is wasted padding the batch to its longest row; on runs with more length variance the gain shrinks (HF pads every row to the longest and keeps decoding finished rows, which is the known ceiling a continuous-batching engine like vLLM would lift).

| model (1 item, 3 temps × 5 samples) | sequential | batched | speedup |
|---|---|---|---|
| Gemma-4-E2B | 215.8 s | 46.3 s | **4.7x** |
| Qwen3-32B | 728.6 s | 186.4 s | **3.9x** |

Correctness was gated before use. On the deterministic (greedy) case all batched rows are bit-identical to each other under the same per-token entropy machinery as the single-sample probe; on the sampled case, accuracy and mean entropy match the sequential runner (Qwen 15/15 correct both ways, entropy within 0.05 bits). One honest caveat: bf16 GPU kernels are not batch-invariant, so a batched and a single-sequence greedy run drift apart after a few tokens (a documented numerical effect, not a bug). Batched entropy is therefore only compared within batched runs, and every number in this post stays from the sequential path. Batching also does not speed up a single trace (Finding 1 is one sequence); the win is throughput on multi-sample runs.

The speedup was immediately spent on next-step 2 above: the full sweep, 16 gold-clean items × 20 samples × 4 temperatures, both models, ran in ~5.3 h on one GPU (roughly a day, sequentially).

![Scaled sweep, 16 items, 20 samples per temperature. Left: accuracy vs temperature, Gemma pinned at 0 for greedy and ~0.34 sampled with wide per-item spread, Qwen high and flat ~0.94. Right: mean raw entropy vs temperature, Gemma flat ~0.54, Qwen rising 0.68 to 0.94.](/assets/img/reading-the-path/tempsweep-scaled-16items-2026-07-01.png)

Thick lines are the across-item means, faint lines the 16 individual items. The left panel is the correction: Gemma's faint lines fan out across the whole range instead of splitting into two clean groups, so Finding 2's locked-vs-greedy-fragile split softens into a *continuum* (only 1 of 16 items is truly locked at n=20; r18 itself recovers 6/20 at T=0.7). The right panel is the confirmation: the entropy-slope signature (Qwen rises with temperature, Gemma stays flat) replicates at scale and remains the sweep's most robust finding. The run also exposed the **fourth defective MMLU item** described above (college r80: the gold letter is right but its option text is corrupted to "10:00 PM" where the physics answer is 10 µm; Qwen, given room, derives 10 µm and correctly refuses to pick).

<details markdown="1">
<summary><strong>Wall-clock time and compute</strong> (click to expand)</summary>

Everything ran on a single GPU of a shared workstation: one NVIDIA RTX PRO 6000 (96 GB), bf16, HuggingFace transformers. Qwen3-32B sat around 64 GB resident; Gemma-4-E2B around 12 GB.

| run | what | wall-clock |
|---|---|---|
| answer pass | Qwen3-32B over the 20 wrong items | ~26 min |
| per-token probe | entropy traces for both models, 3 items | ~5 min |
| deep probe | full per-token probe on the horse-cart item | ~2 min |
| temperature sweep | 4 temperatures, 5 samples each, 1 item, both models | ~14 min |
| temperature sweep | 4 temperatures, 5 samples each, 3 items, both models | ~74 min |
| batched A/B (07-01) | sweep on 1 item, sequential vs batched, both models | 216→46 s / 729→186 s |
| scaled sweep (07-01) | 16 items, 4 temperatures, 20 samples, both models, batched | ~5.3 h (Gemma 44 min + Qwen 4.6 h) |

**Total: about two hours on one GPU** for the original batch; the 07-01 batched runs add ~5.5 h. The answer-key cleaning ran separately as a language-model workflow, not on the GPU.

**The runs are generation-bound, not probe-bound.** Measured on one item (766-token greedy trace, same framework, 3 repeats): plain generation 14.3 s; generation while capturing every token's full distribution 14.1 s (within noise); computing entropy from those distributions 0.06 s (0.1 ms/token). So capturing all the probabilities costs about 0%, because `output_logits` just keeps the logits the model already computes to pick each token. The time is essentially all chain-of-thought generation (766 tokens at ~54 tokens/s here), and slower again on the 32B model.

</details>

---

### Appendix: full questions

**r18 (gold A).** A horse is attached to a cart at rest behind it. Which force, or combination of forces, explains how the horse-cart system can accelerate from rest?
A. Forward static friction of the ground on the horse exceeds friction backward on the cart. **(correct)**　B. The horse's forward force on the cart exceeds the cart's backward force on the horse.　C. The horse's muscles on the rest of the system provide the acceleration.　D. The upward normal force exceeds the horse's weight.

**r42 (gold C).** An object is dropped down a hole straight through the Earth's center (ideal conditions). Its motion?
A. Falls to the center and stops.　B. Falls through, past the far opening, into space.　C. Oscillates between the openings indefinitely. **(correct)**　D. Falls to the other side and stops.

**r159 (gold B).** The Moon always shows the same face to Earth, evidence that it rotates about its axis about once per:
A. day　B. month **(correct)**　C. year　D. it does not rotate.

**r47 (gold D).** A particle decays in 2.0 µs in its rest frame. Moving at v = 0.60c, how far does it travel in the lab before decaying?
A. 150 m　B. 288 m　C. 360 m (no dilation)　D. 450 m **(correct)**
