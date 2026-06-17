---
title: "Honest Uncertainty Is a Capability, Not Just a Virtue"
category: research
tag: [metacognition, ai]
math: true
---

Okay, quick test. You know how a bicycle works. You've seen thousands of them, you can probably ride one, and if I handed you a pen you'd be pretty sure you could sketch one from memory: two wheels, a frame, pedals, a chain. No problem.

So try it. When the psychologist Rebecca Lawson actually asked hundreds of people to do this, a lot of them drew a bike that couldn't move, usually by looping the chain around both wheels (which welds the steering solid). Maybe you'd nail it, plenty do. But here's the part that should bug you: riding one every week barely helped. Regular cyclists botched it just like everyone else. Whatever that confidence was running on, it wasn't a clear picture of how the thing actually works.

<img src="/assets/img/honest-uncertainty/bicycle.svg" alt="Four hand-drawn bicycles. Three show common mistakes people make drawing a bike from memory: the chain looped around both wheels, a frame bar pinning the front wheel so it cannot steer, and the chain driving the front wheel. The fourth is a working bike for comparison, with the chain linking the pedals to the back wheel." style="max-width:100%;height:auto;display:block;margin:1.5rem auto;">

*The bikes above are my own sketches. For real ones, the designer Gianluca Gimini asked people to draw a bicycle from memory and rendered the broken results in 3D: [Velocipedia](https://www.gianlucagimini.it/portfolio-item/velocipedia/).*

That gap has a name. Psychologists call it the illusion of explanatory depth, and it isn't just bikes: we feel we understand how zippers, flush toilets, and a hundred other everyday things work far better than we actually do, right up until someone asks us to explain the mechanism (Rozenblit and Keil, 2002). The gap between feeling like you understand something and actually understanding it isn't the unsettling part. The unsettling part is that your confidence can't see the gap. It feels exactly the same either way.

Sensing that gap from the inside, before anyone hands you a pencil, is a real skill. [Part 1 of this series](/posts/metacognition-explained/) called it metacognition: the machinery of knowing what you know. This post is about what that machinery sounds like from the outside. And I want to argue something that sounds backwards at first: being able to say "I'm not sure" isn't humility, and it isn't a personality quirk. It's a capability, a hard one, and it might be one of the clearest signs of intelligence we have.

## Two answers to the same question

That skill has an outward face, and you can actually hear it. Picture an incident review. Two engineers, the same question on the table: if the primary database dies, do we lose writes?

Engineer A: "No, we're covered. Replication handles it."

Engineer B: "The replication is synchronous, so a committed write survives the failover. That part I'm sure of. What I don't know is whether every service actually waits for the commit before acking the user. I'd check the payments write path before trusting it."

A sounds stronger. Clean, fast, no hedging. In most rooms, A wins the moment.

Now look at what B actually did. B didn't just answer the question. B answered a second question first: what do I actually know here? The reply has the shape of an audit. One claim marked certain (the replication mode). One marked unknown (the client behaviour). Plus a pointer to exactly where the unknown could bite: the payments path. To produce that, B ran a computation A's answer shows no trace of: check your own knowledge, split it into known and assumed, attach a confidence to each piece, and only then talk. The hedge isn't hesitation. It's the audible output of that check.

Maybe A ran the same check and everything came back green. Possible. But a fluent, unqualified answer is also exactly what it sounds like when no check ran at all: the first thing that came to mind, said at full volume. From the outside you can't tell the two apart, and that's the whole problem. B's hedge is proof of work. A's confidence is unfalsifiable.

One more thing, and it's the part people skip past: B's answer is more useful. It maps the boundary and tells you what to go verify next. The hedge doesn't just cover B. It hands you the audit.

<img src="/assets/img/honest-uncertainty/audit-flow.svg" alt="Same question to two engineers. Engineer A answers confidently with no self-check, ending in an unfalsifiable claim. Engineer B runs a self-check that splits what is known from what is unknown, producing a calibrated answer that maps the boundary and transfers the audit." style="max-width:100%;height:auto;display:block;margin:1.5rem auto;">

## The dichotomy machines live in

A deployed language model is stuck in a cruder version of that same room, with two moves on the menu: answer, or abstain. Answer everything and it barrels past the edge of what it knows, where wrong answers come out just as fluently as right ones. Abstain whenever it gets nervous and it clams up on questions it could have nailed. Both moves fail at the knowledge boundary, which is exactly the place that matters.

A 2026 position paper by Yona, Geva and Matias (ICML) sharpens this. They reframe hallucination as confident error: "incorrect information delivered without appropriate qualification." Read that twice, because the weight is all in the second half. The problem isn't only that the answer is wrong. It's the missing qualification. Wrap the same wrong answer in an honest "I'm not certain, but", and it becomes a far smaller disaster: the reader got a warning, and the warning was accurate.

That reframing opens a third path past answer-or-abstain, the one Engineer B took: put the uncertainty inside the answer itself. Yona et al. call the target faithful uncertainty: the hedging in your words should track the uncertainty in your head. Hedge in proportion to what you actually know.

You can write that target down. With *x* the question and *c* the confidence the model expresses, faithful uncertainty is the condition

$$ c = \Pr(\text{answer is correct} \mid x). $$

In plain terms: say you're 70% sure exactly in the situations where you'd actually be right 70% of the time. A confident error is what you get when this breaks with the dial turned up, *c* high and the answer wrong.

In Part 1's vocabulary, this is monitoring routed straight into the answer: the meta-level's read on the object-level, said out loud.

<img src="/assets/img/honest-uncertainty/knowledge-boundary.svg" alt="A circle is the boundary of what the model knows. A question sits on the edge. Three responses: answer confidently (a confident error), abstain (refuses what it could answer), and express the uncertainty (faithful uncertainty, hedged in proportion to what it knows)." style="max-width:100%;height:auto;display:block;margin:1.5rem auto;">

## What expertise sounds like

Here's the part the machine framing makes easy to forget: humans only pull this off when they're actually good. And "good" has a precise version. The per-question target above is an ideal you can't observe directly: for any single question you never get to see the true probability that the answer is right. What you can check is its population shadow, calibration. Across all the times a forecaster claims confidence *c*, they should turn out right a *c* fraction of the time,

$$ \Pr(\text{correct} \mid C = c) = c \quad \text{for every } c. $$

The average gap between the two sides is the expected calibration error, and shrinking it is roughly the whole job of uncertainty work. Kruger and Dunning's 1999 result gets flattened into "clueless people are overconfident," but the real mechanism is sharper: the skills you need to produce a right answer are mostly the same skills you need to judge whether an answer is right. Take the skill away and you don't just lose accuracy, you lose the ability to see that you've lost it. Miscalibration isn't a character flaw that tags along with incompetence. It is what incompetence feels like from the inside.

This is why I keep hammering on mechanical, not moral. Honest uncertainty has two parts: a monitoring signal good enough to tell knowing from guessing, and the willingness to say it out loud. We moralise the second part and forget the first, but the first does the heavy lifting, and it's a capability. You can't report a state you can't read. The bluffer usually isn't lying. The bluffer is blind. And Part 1's twist cuts both ways: even in experts, that monitoring signal is a cue-based hunch, a feeling of knowing assembled from familiarity and fluency, not a readout off a gauge. Calibrated hedging isn't the natural state of an honest person. It's an achievement.

Which is why hedging is what expertise sounds like. Listen to a senior engineer, a good doctor, a careful lawyer: almost certainly X, unless Y, which I'd rule out by doing Z. The qualifications aren't padding around the competence. They are the competence, out loud.

## Models can be taught to say it

The reporting side of this isn't science fiction for machines either. Honesty has been an explicit alignment target since Askell and colleagues' 2021 "helpful, honest, harmless" framing. Kadavath et al. (2022), in a paper titled with admirable restraint "Language Models (Mostly) Know What They Know," showed that large models can be probed to predict whether they know an answer, with decent calibration when you ask the right way. Lin et al. (2022) went further: fine-tune a model and it will state its confidence in plain words, "90% confident," with real calibration and no peek at its own internals. Verbalized confidence is trainable.

Whether what gets verbalized is genuine self-monitoring or just a convincing impression of it is a harder question, and it's the whole next post in this series. For today, it's enough that the channel exists.

## The twist: thinking makes it worse

If honest uncertainty were just a free dividend of intelligence, the reasoning-model era should have handed it to us. The published record says the opposite happened.

Yao et al. (2025) open on a striking data point: OpenAI's o3, built to think longer, hallucinated more on the SimpleQA factuality benchmark, not less. Digging in, they find flaw repetition (reasoning chains that keep re-running the same broken logic) and think-answer mismatch (a final answer that doesn't follow from the model's own chain of thought). Kirichenko et al. (2025) make it systematic with AbstentionBench, twenty datasets of unanswerable, underspecified, and false-premise questions: reasoning fine-tuning degrades abstention by 24 percent on average, even in the math and science domains these models were explicitly trained on, and a careful system prompt helps but doesn't fix it. Yona et al. put the diagnosis bluntly: training that rewards long chains of thought and persistence teaches a model to value finishing a reasoning path over abstaining, rationalising its way to a wrong answer.

The lesson generalises. Monitoring is a separate capability from reasoning. Pouring more computation into the object level does not conjure the meta-level signal, and you can't compute your way out of a signal you don't have. Think harder without better monitoring and all you get is a more elaborate bluff. It's Engineer A with a whiteboard.

<img src="/assets/img/honest-uncertainty/reasoning-monitoring.svg" alt="More thinking scales object-level reasoning into a longer, more confident answer, but it does not build the meta-level monitoring that asks whether the model actually knows. With that check never run, the confident answer ships as an elaborate bluff." style="max-width:100%;height:auto;display:block;margin:1.5rem auto;">

## Agents raise the stakes

In a chat window, a confident error costs you a wrong paragraph, and a sceptical reader can catch it. In an agent, it costs you actions. Tool calling is gated on self-assessment: a web search only fires usefully if the model can tell it doesn't know. A retrieval call, an escalation to a human, a request for clarification, each one is a control decision, and each one runs on a monitoring signal. Yona et al. make the same point structurally: in agentic systems, uncertainty awareness becomes the control layer deciding when to search and what to trust.

Take that signal away and an agent fails in one of two familiar ways. It never asks for help (the confident bluff, now holding tools). Or it asks constantly (a search before every step, the tool reduced to a nervous tic). Bolting on more tools doesn't fix this, because the blind spot isn't in the tools. Every capability you add inherits the same broken gate.

## The flip

So flip the frame. Honesty about uncertainty isn't a personality trait that some systems, and some people, happen to be born with. It's a capability with a specific shape: a monitoring signal that separates knowing from guessing, and a path from that signal into what you do next. Trust isn't something a system can ask you for. It's the rational response to calibration you've watched hold up over time.

And there's a clean reason calibration is the rational thing to aim for, not just the polite one. Score a forecaster with a proper scoring rule, the standard one being the log score,

$$ \ell(c, y) = -\big[\, y \log c + (1 - y)\log(1 - c) \,\big], $$

where *y* is 1 if the answer turned out right and 0 if it didn't. The expected score is best exactly when *c* equals the forecaster's true probability of being correct. Overstate your confidence and the rule punishes you on the answers you get wrong; understate it and it punishes you on the ones you get right. Bluffing isn't only dishonest, it's provably worse on average. Honest uncertainty is the equilibrium.

And in an agent it stops being a social nicety and becomes a routing signal: the bit that decides whether to act, search, or stop.

Go back to the incident review. Which engineer do you trust with the failover? B. Not because B was humble, but because the hedge proved the monitoring is there, and that monitoring is exactly what you're leaning on the next time B says "I'm sure."

"I don't know," said in the right place, is one of the most intelligent things a system can say. The intelligence is in knowing the right places.

## References and further reading

- Yona, G., Geva, M., and Matias, Y. (2026). [Hallucinations Undermine Trust; Metacognition is a Way Forward](https://arxiv.org/abs/2605.01428). ICML 2026 (position track). arXiv:2605.01428.
- Kirichenko, P., Ibrahim, M., Chaudhuri, K., and Bell, S. J. (2025). [AbstentionBench: Reasoning LLMs Fail on Unanswerable Questions](https://arxiv.org/abs/2506.09038). arXiv:2506.09038.
- Yao, Z., Liu, Y., Chen, Y., Chen, J., Fang, J., Hou, L., Li, J., and Chua, T.-S. (2025). [Are Reasoning Models More Prone to Hallucination?](https://arxiv.org/abs/2505.23646). arXiv:2505.23646.
- Askell, A., et al. (2021). [A General Language Assistant as a Laboratory for Alignment](https://arxiv.org/abs/2112.00861). arXiv:2112.00861.
- Kadavath, S., et al. (2022). [Language Models (Mostly) Know What They Know](https://arxiv.org/abs/2207.05221). arXiv:2207.05221.
- Lin, S., Hilton, J., and Evans, O. (2022). [Teaching Models to Express Their Uncertainty in Words](https://arxiv.org/abs/2205.14334). arXiv:2205.14334.
- Gneiting, T., and Raftery, A. E. (2007). [Strictly Proper Scoring Rules, Prediction, and Estimation](https://doi.org/10.1198/016214506000001437). *Journal of the American Statistical Association*, 102(477), 359 to 378.
- Kruger, J., and Dunning, D. (1999). [Unskilled and unaware of it: How difficulties in recognizing one's own incompetence lead to inflated self-assessments](https://doi.org/10.1037/0022-3514.77.6.1121). *Journal of Personality and Social Psychology*, 77(6), 1121 to 1134.
- Lawson, R. (2006). [The science of cycology: Failures to understand how everyday objects work](https://doi.org/10.3758/BF03195929). *Memory & Cognition*, 34(8), 1667 to 1675.
- Rozenblit, L., and Keil, F. (2002). [The misunderstood limits of folk science: An illusion of explanatory depth](https://doi.org/10.1207/s15516709cog2605_1). *Cognitive Science*, 26(5), 521 to 562.
