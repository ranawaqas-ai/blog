---
title: "A Sliding Window on Entropy"
category: research
tag: [metacognition, ai, llm, evaluation]
---


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

![Temperature sweep, 4 items, both models. Top: accuracy vs temperature, Qwen flat at 1.0, Gemma splits into two locked-at-0 items and two that recover. Bottom: mean entropy vs temperature, Qwen rises on every item, Gemma stays flat.](/assets/img/reading-the-path/fig-temperature.png)

Sweeping temperature 0→1.0 (5 samples each):

- **Qwen is robust:** correct at every temperature, on every item (top-right).
- **Gemma splits into two error types** (top-left): **locked** (r18, r42: wrong at all temperatures, a genuine misconception) vs **greedy-fragile** (r159, r47: greedy picks wrong, but sampling recovers the correct answer 60-100% of the time). **Half of these "errors" dissolve under sampling.**
- **Entropy slope** (bottom): Qwen's entropy **rises** monotonically with temperature on all 4 items; Gemma's shows **no upward trend** on any (it wanders non-monotonically, netting ~zero). Qwen's token distributions are wide (it deliberates → temperature explores); Gemma's are peaked (it marches → temperature barely moves it).

## What the path and the sweep add beyond accuracy

The accuracy score reports only whether the final answer matches the key. On these items, the per-token path additionally locates where in the reasoning the model's uncertainty peaks, and the temperature sweep additionally separates errors that persist under sampling from those that do not. Both are properties the scalar score does not expose.

## Honest limits

4 items, n=5 per temperature: qualitative, not powered. Same absolute temperature for both models (Shiqiang's fairness point stands: per-model-default sweeps are needed before any cross-model temperature claim). The entropy-localization in Finding 1 is my reading of a flagged region, not a proven cause.

## What to do next

**What this batch did.** A fixed-temperature sweep (the approach Shiqiang suggested): both models run at the *same* temperatures (0, 0.3, 0.7, 1.0) with 5 samples each, on 4 items. This is good for one specific thing: watching how *one* model behaves as *its own* temperature is turned up.

**Three limits of that setup, each with its fix:**

1. **It can't fairly compare the two models.** The same temperature can be a normal setting for one model and "too hot" for the other, so "Qwen beats Gemma at T=0.7" isn't a fair statement; it might just be Qwen's better operating point. *Fix:* also sweep each model around *its own* recommended temperature (e.g. 0.5× and 2× its default). That is the only setup in which a model-vs-model comparison is fair.
2. **It's too small to be a real number.** 4 items × 5 samples means a figure like "Gemma 1/5" is an illustration, not a measured rate. *Fix:* run all 15 gold-clean items with ≥20 samples per temperature, so the locked-vs-greedy-fragile split comes with error bars instead of anecdotes.
3. **Only 2 models, and idealised decoding.** One small + one reasoning model, pure temperature only (no top-p/top-k), and just 4 temperature points. *Fix:* add more models, a finer temperature grid, and one realistic (top-p) decoding pass, to test whether "small model marches, reasoning model deliberates" generalises, and to locate where the locked→greedy-fragile switch happens.

**Separate question for Shiqiang.** The 3 confirmed wrong MMLU answer keys: worth reporting upstream as a small contribution? (MMLU-Redux-2.0 already flags r67 and r152; r98 we caught independently via re-derivation.)

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

**Total: about two hours on one GPU.** Recording entropy adds only one softmax over the vocabulary per generated token, since it comes from the raw next-token logits the model already computes. The answer-key cleaning ran separately as a language-model workflow, not on the GPU.

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
