# Phase 0 Restructure: Split-Concept + Reuse-Tagged Curriculum

**Status:** Approved by Ronald, 2026-08-21. Supersedes task numbering in `docs/superpowers/plans/2026-07-17-phase-0-physics-core.md` from Task 2 onward. Tasks 0, 1 unchanged (already single-concept, already complete). Interfaces, test code, physics equations, and commit messages from the original plan are reused verbatim — this document only changes *sequencing and framing*, not content.

## Problem

Ronald hit a complexity wall starting at the original Task 2 (Euler integrator). Diagnosis, confirmed with Ronald directly: each remaining task introduced **new math/physics AND new TypeScript syntax in the same task**, with no isolation between the two kinds of unfamiliarity. Neither had room to land before the next hit. This is why he started offloading explanations to ChatGPT instead of working through the plan's own hints.

This is a project-based-learning project (per `[[project-based-learning-supervision]]`): Ronald types all code, Claude reviews. This restructure only changes how the *lessons* are sequenced — the supervision contract, TDD workflow, and explain-back gates from the original plan are unchanged.

## Rule

Every task teaches exactly one new thing: **either** new math/physics **or** new TypeScript mechanics, never both. Where the original plan combined them, split into:

1. A **syntax-only primer task** — plain TypeScript, zero physics, isolates the new language mechanic.
2. A **math-only primer task** — paper/whiteboard, no code, isolates the new physics/calculus concept.
3. An **integration task** — combines the two primers into the original plan's real interface/test/implementation. No new concept appears here; it is pure combination of things already understood.

Where the original task only introduced ONE new thing (Task 3, Task 5), it stays a single task, and is explicitly flagged as "no new syntax today" or "no new physics today" so Ronald knows the repetition is deliberate, not something he's failing to notice.

Every task additionally gets a **Reusable in:** line — concrete named contexts (other libraries, frameworks, problem domains) where this exact concept resurfaces, not a vague "this is generally useful." Purpose: make the transfer value visible immediately, not discovered by accident on a future project.

## Restructured Task List

### Task 0: Project scaffold — unchanged (complete)
### Task 1: Vec2 module — unchanged (complete)

### Task 2a: Function types & closures (TS only, no physics)

**New concept:** function type aliases, passing functions as values, `noUncheckedIndexedAccess` + non-null assertion (`!`) on array access.

**Exercise:** Write a type alias for a function shape (e.g. `type Combiner = (a: number, b: number) => number`), write 2-3 tiny functions matching it, pass one as an argument to another function that calls it. Destructure a `number[]` under `strict`/`noUncheckedIndexedAccess` and observe the `possibly undefined` error; resolve with `!` and explain why it's safe here (index is known in range).

No test file needed — this is a scratch exercise, not part of the permanent test suite. Delete scratch file after.

**Explain-back:** What does `noUncheckedIndexedAccess` protect against? When is `!` an honest fix vs. a lie to the compiler?

**Reusable in:** callback-based APIs (Express middleware `(req, res, next) => void`), event handlers, any code that accepts a function as configuration (sort comparators, array `.map`/`.filter` predicates).

### Task 2b: What an ODE is + Euler's method (math only, no code)

**New concept:** state-vector form of a differential equation; Euler's method as "walk in the direction of the current slope."

**Exercise:** On paper — write free-fall as state `[y, vy]` with derivative `[vy, -g]`. Hand-compute 2-3 Euler steps for `dt=0.1` starting at rest, height 100. Compare to the closed-form answer at the same time and observe the gap.

**Explain-back:** In your own words, why does walking the current slope lag a curving trajectory?

**Reusable in:** any simulation or animation loop (game physics, particle systems), control systems, numerical methods generally.

### Task 2c: Implement `eulerStep`

Original plan's Task 2 content verbatim: interface `Derivative`, `eulerStep`, the three failing tests (free fall step, no-mutation, accumulated error). Ronald now has both prerequisite pieces (2a's TS mechanics, 2b's math) — this task is pure combination, TDD as normal, commit `feat: euler integrator`.

**Explain-back:** unchanged from original ("Third test shows Euler overestimates height...").

### Task 3: RK4 integrator + exactness test — unchanged, single task

Flagged explicitly at task start: **no new TypeScript today** — reuses exactly the function-type and array patterns from 2a/2c. Only new content is the math (sampling the slope 4 times, weighted average). Original plan's interface, tests, hints, commit message unchanged.

**Reusable in:** numerical methods broadly (root-finding, optimization, ODE solvers in any language) — pattern of higher-order approximation trading extra computation for accuracy.

### Task 4a: Closures-as-factories (TS only, no physics)

**New concept:** a function that returns a function, closing over a parameter (distinct from 2a's "pass a function as an argument" — this is "produce a function, customized by captured state").

**Exercise:** Write `function multiplier(k: number) { return (x: number) => x * k; }`, use it to build two different multiplier functions from the same factory, verify each remembers its own `k`.

**Explain-back:** What is a closure? Why does `multiplier(3)` returned twice with different `k` not interfere with each other?

**Reusable in:** React hook factories (`useCallback`/custom hooks with captured config), middleware factories, memoized/cached functions, any "configure once, call many times" API.

### Task 4b: Projectile physics (math only, no code)

**New concept:** projectile motion with linear drag; closed-form range check as a sanity test for the numerical version.

**Exercise:** On paper — write the acceleration equations `ax = -drag*vx`, `ay = -g - drag*vy`. With `drag=0`, derive/verify range formula `R = v²sin(2θ)/g` for `v=20, θ=45°`.

**Explain-back:** Why does adding drag shorten the range? What does `drag=0` physically mean?

**Reusable in:** any first-order damped system (friction, air resistance, RC circuits) — the general shape "rate of change opposes velocity."

### Task 4c: Implement projectile system

Original plan's Task 4 content verbatim: `ProjectileParams`, `paramRanges`, `derivative(p)`, `launch`, the three failing tests. Combination of 4a (closure shape) + 4b (equations). Commit `feat: projectile system`.

**Explain-back:** unchanged from original.

### Task 5: Pendulum system + SHM period test — unchanged, single task

Flagged explicitly at task start: **no new TypeScript today** — same `derivative(p)` closure shape as Task 4c. Only new content is the physics (trig, small-angle approximation, energy formula). Original plan's interface, tests, hints, commit message unchanged.

**Reusable in:** any oscillator/spring model (mechanical, electrical LC circuits), energy-conservation sanity checks in general.

### Task 6a: Object-shaped state / nested destructuring (TS only, no physics)

**New concept:** state represented as an object with named array fields (`{ pos: number[], vel: number[] }`) instead of Task 2/3's flat `number[]`; destructuring a field out of that shape.

**Exercise:** Define a small interface with two array fields, write a function that takes it, destructures one field, returns a new object of the same shape (no mutation) — mirrors the immutability discipline from Vec2 (Task 1) applied to a two-field struct.

**Explain-back:** Why return a new object instead of mutating the field in place? (Same reasoning as Vec2 — connect it back explicitly.)

**Reusable in:** Redux/Zustand-style state shapes, any struct-of-arrays data model, React state objects with multiple fields.

### Task 6b: Symplectic integration + Verlet algorithm (math only, no code)

**New concept:** half-kick / drift / half-kick structure of velocity Verlet; "symplectic" in one sentence (conserves a slightly-wrong energy exactly, so real energy oscillates but never drifts).

**Exercise:** On paper — write the three-step Verlet update for one pendulum step by hand using made-up numbers, confirm the shape (`v_half = v + a(x)*dt/2`, `x_new = x + v_half*dt`, `v_new = v_half + a(x_new)*dt/2`).

**Explain-back:** Why does recomputing acceleration at the *new* position (not the old one) matter for the second half-kick?

**Reusable in:** game engines, orbital mechanics, any long-running simulation where energy stability over many steps matters more than per-step accuracy.

### Task 6c: Implement `verletStep`, run the energy-drift showdown

Original plan's Task 6 content verbatim: `SecondOrderState`, `verletStep`, the energy-conservation-over-100-periods test pair (Euler blows up vs. Verlet stays bounded). Combination of 6a (state shape) + 6b (algorithm). Commit `feat: velocity verlet integrator with energy conservation proof`.

**Explain-back:** unchanged from original ("A recruiter asks 'why three integrators?'...").

### Task 7: Phase gate — unchanged

`LEARNING.md` entry, full test run, `tsc --noEmit`, oral exam, commit `docs: phase 0 learning journal`.

## What Doesn't Change

- TDD discipline: test written and failing before implementation, every integration task.
- Commit-after-green, conventional commit messages — identical to original plan.
- Ronald types all code; Claude reviews every diff after commit.
- Explain-back gates at the end of every task, including primer tasks (primers get a lighter explain-back — a sentence or two, not a full oral defense).
- All original interfaces, test code, and physics equations — reused verbatim, not rewritten.

## Net Effect

Task count: 7 remaining → 12 (2 unchanged, 2 stay single, 3 split into 3 each). Same total content and same final test suite as the original plan. No task after this point asks Ronald to absorb new math and new TypeScript simultaneously. Primer tasks are short (15-30 min) and produce no permanent code — only integration tasks touch the real `src/physics/` files and test suite.

## Out of Scope

Phases 1-5 (Next.js skeleton, Canvas, MDX essay, ScrollScene, subsequent concepts) are not restructured here. Same split+tag method should be applied to each phase's plan when Ronald reaches it, as a separate brainstorm/spec cycle — not drafted speculatively now.
