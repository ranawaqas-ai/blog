---
title: "The Answer Key Is Wrong: Four Broken Physics Questions in MMLU"
category: research
tag: [ai, llm, evaluation, datasets]
---

**Setup.** MMLU is one of the standard benchmarks LLMs are scored on. While doing an error analysis on its physics subjects, every "the model got this wrong" first had to survive a check the benchmark itself rarely gets: is the model wrong, or is the question? Among the physics items one small model got wrong, four turned out to be defective in the dataset itself, in two different ways. All four are now reported upstream, on the paper repo ([aryopg/mmlu-redux#6](https://github.com/aryopg/mmlu-redux/issues/6)) and on the dataset's own Community tab ([mmlu-redux-2.0 discussion #3](https://huggingface.co/datasets/edinburgh-dawg/mmlu-redux-2.0/discussions/3)).

## Defect type 1: the answer key is wrong (3 items)

The question is fine; the stored gold letter is not. A model that answers correctly is scored as wrong.

| item | question | stored gold | correct | why |
|---|---|---|---|---|
| high_school_physics r67 | which change to a circuit *always* increases the current? | A (more voltage *and* more resistance) | **C** (more voltage, less resistance) | Ohm's law, I = V/R: only C raises I unconditionally |
| high_school_physics r98 | which battery/resistor configuration gives the greatest current? | A (high voltage, series) | **B** (high voltage, parallel) | parallel resistance < series resistance, same battery |
| conceptual_physics r152 | interference can sometimes... | B (cancel completely) | **C** (both of these) | light can also build to more than the sum of the separate intensities |

How they were caught, in increasing order of effort: r67 and r152 are confirmed by [MMLU-Redux](https://arxiv.org/abs/2406.04127), the expert re-annotation project, which flags both as `wrong_groundtruth`. r98 is outside Redux's sample, so it was verified by a blind derivation (a solver that never sees the official key) followed by an adversarial check (a judge instructed to *defend* the key against the derivation, which failed to).

Across the full pool this is not exotic: of 59 items the small model got wrong, 3 had wrong keys, roughly 5%. Any per-item error analysis that skips this check is partly studying the answer key.

## Defect type 2: the key is right, the option text is broken (1 item)

This one is nastier, because every letter-level check passes it.

**college_physics r80:** "The surface of the Sun has a temperature close to 6,000 K and it emits a blackbody (Planck) spectrum that reaches a maximum near 500 nm. For a body with a surface temperature close to 300 K, at what wavelength would the thermal spectrum reach a maximum?"

The stored options, verbatim:

- A. `10:00 PM`
- B. `100 Pm`
- C. `10 mm`
- D. `100 mm`

Gold: A. And the letter A is, in a sense, correct: the physics answer is **10 µm** (Wien's law: 2.898e-3 / 300 K = 9.66 µm, or just the Sun's 500 nm scaled by 6000/300 = 20x), and option A was evidently meant to say "10 µm". But somewhere along the dataset's life, "10 µm" became "10:00 PM", a time of day, and "100 Pm" in option B (petameters, 10^17 m) looks like the same mangling. As stored, the item is unanswerable.

Because the gold *letter* matches the intended option, both the Redux re-annotation (which has this item as `error_type: ok`) and our own key-checking passed it. What caught it was reading a model's reasoning trace:

![Animation: a sliding window of averaged token entropy crosses a 4,041-token reasoning trace; 42 spans flag as doubt phrases surface, and it ends on "A. 10:00 PM: this is a time, not a wavelength" and Answer: UNKNOWN, with the corrupted dataset row shown.](/assets/img/reading-the-path/r80-doubt-loop-2026-07-02.gif)

Qwen3-32B, given enough output tokens to finish, computed 10 µm, went looking for it among the options, and wrote, verbatim: option A "is a time, not a wavelength... none of the options match the correct value of approximately 10 micrometers", then answered UNKNOWN. The model narrated the dataset bug. (With the usual 3,072-token generation cap, that deliberation gets cut off mid-loop and scored as just another wrong answer, which is how the item hid inside aggregate accuracy in the first place.)

## The two lessons

**Checking the answer key is not enough.** A benchmark item can be broken in the option text while carrying a perfectly correct gold letter. Verification that compares letters (ours did, and so does most re-annotation tooling) is structurally blind to this class. Option text needs its own sanity check: are the options even the right *type* of thing for the question?

**Reasoning traces are a data-quality instrument.** Aggregate accuracy hid all four of these items; each one just looked like a model failure. The wrong keys fell to re-derivation, and the corrupted option fell to a model literally explaining the defect in its chain of thought. If a strong model keeps "failing" one specific item while writing lucid physics, read the trace before trusting the label.

---

*The defect report with full evidence is at [aryopg/mmlu-redux#6](https://github.com/aryopg/mmlu-redux/issues/6), cross-posted to the [HF dataset discussion](https://huggingface.co/datasets/edinburgh-dawg/mmlu-redux-2.0/discussions/3). The sliding-window entropy method used in the animation is described in [A Sliding Window on Entropy](/posts/a-sliding-window-on-entropy/).*
