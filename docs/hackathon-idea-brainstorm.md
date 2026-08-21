# Hackathon Brainstorm — Vector Board

**Event:** [Claude in Production Workshop, Nairobi](https://luma.com/claude-bsr9) — teaching session 9:00, pair-up build session 11:00, Anthropic API credits provided. No fixed theme; the ask is "ship something real with Claude in production."

## Research: what actually won recent Claude/Anthropic hackathons

| Project | Result | Move that won it |
|---|---|---|
| [Medkit](https://claude.com/blog/meet-the-winners-of-built-with-opus-4-7-claude-code-hackathon) | Gold, Built with Opus 4.7 | Gamified simulated clinic — repeated timed patient encounters build intuition through feedback loops, not lectures. |
| [Wrench Board](https://fighttorepair.substack.com/p/how-ai-is-set-to-transform-electronics) | Silver, Opus 4.7 | Reads a schematic, then overlays step-by-step diagnosis live on the board. Hard rule: the agent may **never invent a component it wasn't given** — grounding over fluency. |
| Tekton | Opus 4.8 Build Day winner | Every generated piece traces to a documented source ("evidence chain"), checked by independent sub-agents grading in isolated contexts with self-correction loops until tests pass. |
| Sim Francisco | Opus 4.8 Build Day winner | Batches similar LLM calls into representative clusters instead of one call per unit — 10-100x cost cut. |

The common thread: **Claude reasons, a deterministic tool verifies, and the answer cites what verified it.** That's the "production" pattern the workshop is teaching (agent workflows + cost control), not a coincidence.

Sources: [Wrench Board interview](https://fighttorepair.substack.com/p/how-ai-is-set-to-transform-electronics) · [Opus 4.8 winners (mirror)](https://github.com/yuc16/claude-fm/blob/main/content/claude/blog/articles/2026-06-17-Meet%20the%20winners%20of%20our%20Claude%20Opus%204.8%20Build%20Day%20hackathon.md) · [EdTech Innovation Hub on Opus 4.7 winners](https://www.edtechinnovationhub.com/news/a-doctor-a-carpenter-and-a-teacher-win-anthropics-global-opus-47-hackathon)

## The combined idea: Vector Board

A physics problem diagnostic bench — Wrench Board's diagnosis-overlay applied to physics instead of circuits, Tekton's evidence-chain applied to physics laws instead of historical sources, Medkit's gamified drilling as the demo loop.

**Why it fits *this* repo and *this* clock:** `src/physics/vector.ts` is currently an empty stub — `vector.test.ts` already specifies `add`, `sub`, `scale`, `length` and is red. That's the exact shape of tool a "Claude in production" workshop wants: a small pure-function core Claude calls as a **tool**, instead of trusting its own arithmetic.

**How it works:**
1. Give Claude a physics problem (typed, or a photo of a textbook/handwritten page).
2. Claude proposes the next reasoning step and *which law it's applying* (Newton's 2nd law, kinematic equation, vector addition, ...).
3. For any numeric claim, Claude calls the `vector.ts` functions as tools instead of computing by hand — mirrors Wrench Board's "never invent a value not given."
4. If a student's own attempt is provided, Claude diagnoses exactly where it diverges from the tool-verified path — a fault trace, not a fresh solve.
5. Each step in the output is tagged with the law + the tool call that verified it — the evidence chain, visible in the demo.

**Stretch (only if time remains):** a timed "clinic" mode — pull from a small bank of projectile-motion problems (the repo's existing Phase 3 flagship topic), score + streak, Medkit-style.

## Build plan (time-boxed for a short build session)

Respect the repo's existing rule (`docs/superpowers/specs/2026-07-17-physics-notebook-design.md` §7): Ronald types the physics core by hand; Claude pairs/hints, doesn't hand over wholesale physics code. Split the build so that line holds:

1. **0-15 min — Ronald implements `vector.ts`.** It's 4 small functions against tests that already exist (`pnpm test` to check). Claude hints, doesn't type it.
2. **15-45 min — Claude pairs on the harness** (new file, e.g. `scripts/vector-board.ts`): a small script using the Anthropic SDK with tool-use, exposing `add/sub/scale/length` as tools, one hardcoded projectile-motion problem, printing the step-by-step + evidence chain to the terminal. This is orchestration/config, not physics core — fair game for Claude to write.
3. **45-60 min — demo polish.** Feed it a deliberately wrong "student attempt" and show it catch the exact bad step. That's the 30-second demo.
4. **If time remains** — clinic-mode loop over 3-4 canned problems with a running score.

**Demo line:** "Most physics tutors are confident and wrong. This one won't tell you 2+2=5 — it calls a function to check."
