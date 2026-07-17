# Phase 0: TypeScript Physics Core — Implementation Plan

> **Execution model:** Supervised learning, NOT agent execution. Ronald types all code (tests AND implementations). Claude explains, reviews, and hints. This plan deliberately omits implementation code — it gives exact interfaces, complete test code, the physics equations, and progressive hints. Do not paste solutions.

**Goal:** A pure-TypeScript physics library (`src/physics/`) with vector math, three integrators (Euler, RK4, velocity Verlet), projectile and pendulum systems — fully unit-tested with Vitest, zero framework dependencies.

**Architecture:** Simulation state is a plain `number[]` (standard ODE form). Integrators are pure functions that take a derivative/acceleration function and a state and return the next state. Systems (projectile, pendulum) supply those derivative functions plus parameter metadata. Nothing imports from React, Next.js, or the DOM.

**Tech Stack:** TypeScript (strict), Vitest, Node 20+. No other dependencies.

## Global Constraints

- `src/physics/` must never import from `react`, `next`, or browser globals (`window`, `document`).
- All functions pure: no mutation of input arrays/objects, no module-level mutable state.
- TypeScript `strict: true` — no `any` unless justified in a review.
- TDD: test written and failing BEFORE implementation, every task.
- Commit after every green test cycle. Commit messages: conventional (`feat:`, `test:`, `chore:`).
- Explain-back gate at each task's end: Ronald explains the code in plain words before next task.

## Learning objectives for the phase

By the end you can: read/write TS function types and interfaces, explain why `strict` catches bugs, explain what an ODE integrator does and why RK4 beats Euler, explain symplectic integration in one sentence, write a unit test against a closed-form physics solution.

---

### Task 0: Project scaffold (config — typed together, low ceremony)

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`

**Concepts to learn first (15 min):**
- What `tsconfig.json` controls (read: https://www.typescriptlang.org/tsconfig — just `strict`, `target`, `module` entries)
- What Vitest is (skim: https://vitest.dev/guide/)

**Steps:**

- [ ] **Step 1:** Run `npm init -y`, then `npm install -D typescript vitest`
- [ ] **Step 2:** Create `tsconfig.json` (config is inert — copy this):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3:** Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { globals: true },
});
```

- [ ] **Step 4:** Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`. Create `.gitignore` with `node_modules/`.
- [ ] **Step 5:** Smoke check — create `src/physics/__tests__/smoke.test.ts` yourself:

```ts
describe("toolchain", () => {
  it("runs a test", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test` — expect 1 passing. Delete the smoke file after.
- [ ] **Step 6:** Commit: `chore: scaffold typescript + vitest`

**Explain-back:** What does `strict: true` change about the code you're allowed to write?

---

### Task 1: Vec2 module (TS warm-up)

**Files:**
- Create: `src/physics/vector.ts`
- Test: `src/physics/__tests__/vector.test.ts`

**Interfaces (Produces):**

```ts
export interface Vec2 { readonly x: number; readonly y: number; }
export function vec2(x: number, y: number): Vec2;
export function add(a: Vec2, b: Vec2): Vec2;
export function sub(a: Vec2, b: Vec2): Vec2;
export function scale(v: Vec2, k: number): Vec2;
export function length(v: Vec2): number;
```

Used later by canvas rendering (Phase 2), not by the integrators. This task exists to learn TS syntax on easy material.

**Concepts to learn first (30 min):**
- TS interfaces and `readonly` (TS Handbook → "Object Types")
- Why pure functions returning new objects, not methods mutating `this`

- [ ] **Step 1: Write the failing tests** (type these yourself):

```ts
import { vec2, add, sub, scale, length } from "../vector";

describe("Vec2", () => {
  it("adds component-wise", () => {
    expect(add(vec2(1, 2), vec2(3, 4))).toEqual({ x: 4, y: 6 });
  });
  it("subtracts component-wise", () => {
    expect(sub(vec2(3, 4), vec2(1, 2))).toEqual({ x: 2, y: 2 });
  });
  it("scales by a scalar", () => {
    expect(scale(vec2(1, -2), 3)).toEqual({ x: 3, y: -6 });
  });
  it("computes euclidean length", () => {
    expect(length(vec2(3, 4))).toBe(5);
  });
  it("does not mutate inputs", () => {
    const a = vec2(1, 1);
    add(a, vec2(2, 2));
    expect(a).toEqual({ x: 1, y: 1 });
  });
});
```

- [ ] **Step 2:** Run `npm test` — expect FAIL (module doesn't exist).
- [ ] **Step 3:** Implement `vector.ts` yourself. Hint ladder (peek one at a time only if stuck): (1) each function is one line; (2) `Math.hypot` exists.
- [ ] **Step 4:** Run `npm test` — expect all green.
- [ ] **Step 5:** Commit: `feat: vec2 math module`

**Explain-back:** Why `readonly` on the interface fields? What breaks without it?

---

### Task 2: Euler integrator + free-fall test

**Files:**
- Create: `src/physics/integrators.ts`
- Test: `src/physics/__tests__/integrators.test.ts`

**Interfaces (Produces):**

```ts
/** dy/dt = f(t, y). State y is a plain number array. */
export type Derivative = (t: number, y: number[]) => number[];

export function eulerStep(f: Derivative, t: number, y: number[], dt: number): number[];
```

**Physics/math to learn first (45 min):**
- What an ODE is; state-vector form. Free fall: state `[y, vy]`, derivative `[vy, -g]`.
- Euler's method: `y_next = y + f(t, y) * dt`. It's just "walk in the direction of the current slope."
- 3Blue1Brown "Differential equations" video recommended.

- [ ] **Step 1: Write the failing test:**

```ts
import { eulerStep } from "../integrators";

const G = 9.81;
/** Free fall: state [height, velocity] */
const freeFall = (_t: number, [y, vy]: number[]) => [vy!, -G];

describe("eulerStep", () => {
  it("advances free fall one step", () => {
    // start at rest, height 100. After dt=0.1: y unchanged-ish, vy = -0.981
    const next = eulerStep(freeFall, 0, [100, 0], 0.1);
    expect(next[0]).toBeCloseTo(100, 5);      // y + 0*dt
    expect(next[1]).toBeCloseTo(-0.981, 5);   // 0 + (-9.81)*0.1
  });
  it("does not mutate the input state", () => {
    const y = [100, 0];
    eulerStep(freeFall, 0, y, 0.1);
    expect(y).toEqual([100, 0]);
  });
  it("accumulates visible error over 1s of free fall", () => {
    // exact: y(1) = 100 - 0.5*9.81 = 95.095
    let s = [100, 0];
    for (let i = 0; i < 100; i++) s = eulerStep(freeFall, i * 0.01, s, 0.01);
    expect(s[0]).toBeGreaterThan(95.095); // Euler lags the true fall — error is real and measurable
    expect(s[0]).toBeCloseTo(95.095, 0);  // but roughly right
  });
});
```

Note `[y, vy]: number[]` destructuring makes elements possibly-undefined under `noUncheckedIndexedAccess` — hence `vy!`. You'll hit this; understand it rather than fight it.

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement. Hints: (1) map over the derivative result; (2) 2 lines.
- [ ] **Step 4:** `npm test` — green.
- [ ] **Step 5:** Commit: `feat: euler integrator`

**Explain-back:** Third test shows Euler overestimates height. Why does walking the current slope systematically lag a curving trajectory?

---

### Task 3: RK4 integrator + exactness test

**Files:**
- Modify: `src/physics/integrators.ts`
- Test: `src/physics/__tests__/integrators.test.ts` (append)

**Interfaces (Produces):**

```ts
export function rk4Step(f: Derivative, t: number, y: number[], dt: number): number[];
```

**Math to learn first (45 min):**
- RK4 idea: sample the slope 4 times (start, two midpoints, end), take weighted average `(k1 + 2k2 + 2k3 + k4)/6`. Wikipedia "Runge–Kutta methods" § The Runge–Kutta method — copy the four k-definitions onto paper before coding.
- Key fact you'll prove in the test: RK4 is exact (to floating point) for trajectories that are polynomials of degree ≤ 4 in t — a parabola qualifies.

- [ ] **Step 1: Write the failing test (append):**

```ts
import { rk4Step } from "../integrators";

describe("rk4Step", () => {
  it("is exact on free fall (parabola)", () => {
    // exact: y(1) = 100 - 0.5*9.81*1² = 95.095, vy(1) = -9.81
    let s = [100, 0];
    for (let i = 0; i < 100; i++) s = rk4Step(freeFall, i * 0.01, s, 0.01);
    expect(s[0]).toBeCloseTo(95.095, 10);
    expect(s[1]).toBeCloseTo(-9.81, 10);
  });
  it("beats euler on the same problem at the same dt", () => {
    let e = [100, 0], r = [100, 0];
    for (let i = 0; i < 100; i++) {
      e = eulerStep(freeFall, i * 0.01, e, 0.01);
      r = rk4Step(freeFall, i * 0.01, r, 0.01);
    }
    const exact = 95.095;
    expect(Math.abs(r[0]! - exact)).toBeLessThan(Math.abs(e[0]! - exact));
  });
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Implement — hints: (1) you need element-wise `add` and `scale` for `number[]`, write tiny local helpers; (2) k2 evaluates f at `t + dt/2` with state `y + k1*dt/2`; (3) ~10 lines with helpers.
- [ ] **Step 4:** Green. **Step 5:** Commit: `feat: rk4 integrator`

**Explain-back:** In your own words: why does sampling the slope mid-step help? (Answer should mention the slope changing during the step.)

---

### Task 4: Projectile system module

**Files:**
- Create: `src/physics/systems/projectile.ts`
- Test: `src/physics/__tests__/projectile.test.ts`

**Interfaces (Produces)** — this shape is the template every future system copies:

```ts
export interface ProjectileParams {
  g: number;        // m/s², gravity
  drag: number;     // 1/s, linear drag coefficient; 0 = vacuum
}

/** Ranges the UI may expose. Values outside are clamped by the caller. */
export const paramRanges: Record<keyof ProjectileParams, { min: number; max: number; default: number }>;

/** State layout: [x, y, vx, vy] */
export function derivative(p: ProjectileParams): Derivative;

/** Convenience: initial state from launch speed (m/s) and angle (radians). */
export function launch(speed: number, angle: number): number[];
```

**Physics to learn first (30 min):**
- Projectile with linear drag: `ax = -drag*vx`, `ay = -g - drag*vy`. With `drag = 0`, closed form: range `R = v²·sin(2θ)/g`.
- Why `derivative(p)` returns a function (closure capturing params) instead of taking params every call.

- [ ] **Step 1: Failing tests:**

```ts
import { derivative, launch, paramRanges } from "../systems/projectile";
import { rk4Step } from "../integrators";

describe("projectile", () => {
  it("matches closed-form range in vacuum", () => {
    // v=20 m/s, 45°: R = 400*sin(90°)/9.81 = 40.775 m
    const f = derivative({ g: 9.81, drag: 0 });
    let s = launch(20, Math.PI / 4);
    let t = 0;
    while (s[1]! >= 0) { s = rk4Step(f, t, s, 0.0001); t += 0.0001; }
    expect(s[0]!).toBeCloseTo(400 / 9.81, 2);
  });
  it("drag shortens the range", () => {
    const fv = derivative({ g: 9.81, drag: 0 });
    const fd = derivative({ g: 9.81, drag: 0.3 });
    const range = (f: typeof fv) => {
      let s = launch(20, Math.PI / 4), t = 0;
      while (s[1]! >= 0) { s = rk4Step(f, t, s, 0.001); t += 0.001; }
      return s[0]!;
    };
    expect(range(fd)).toBeLessThan(range(fv));
  });
  it("declares sane param ranges", () => {
    expect(paramRanges.g.min).toBeGreaterThan(0);
    expect(paramRanges.drag.min).toBe(0);
  });
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Implement (hints: (1) `derivative` is a function returning an arrow function; (2) `launch` uses `Math.cos`/`Math.sin`).
- [ ] **Step 4:** Green. **Step 5:** Commit: `feat: projectile system`

**Explain-back:** What is a closure, and why does `derivative(p)` use one?

---

### Task 5: Pendulum system + SHM period test

**Files:**
- Create: `src/physics/systems/pendulum.ts`
- Test: `src/physics/__tests__/pendulum.test.ts`

**Interfaces (Produces):**

```ts
export interface PendulumParams { g: number; L: number; damping: number; }
export const paramRanges: Record<keyof PendulumParams, { min: number; max: number; default: number }>;
/** State layout: [theta, omega] (radians, rad/s) */
export function derivative(p: PendulumParams): Derivative;
/** Acceleration form for Verlet (Task 6): alpha(theta) with damping=0 */
export function acceleration(p: PendulumParams): (pos: number[]) => number[];
/** Total energy per unit mass: ½L²ω² + gL(1−cosθ) */
export function energy(p: PendulumParams, state: number[]): number;
```

**Physics to learn first (45 min):**
- Pendulum equation: `θ'' = -(g/L)·sinθ - damping·θ'`.
- Small-angle approximation `sinθ ≈ θ` gives SHM with period `T = 2π√(L/g)`. Your test uses this.
- Energy: kinetic `½L²ω²` + potential `gL(1−cosθ)` (per unit mass).

- [ ] **Step 1: Failing tests:**

```ts
import { derivative, energy } from "../systems/pendulum";
import { rk4Step } from "../integrators";

describe("pendulum", () => {
  it("small-angle period matches 2π√(L/g)", () => {
    const p = { g: 9.81, L: 1, damping: 0 };
    const f = derivative(p);
    const T = 2 * Math.PI * Math.sqrt(p.L / p.g); // ≈ 2.006 s
    let s = [0.05, 0]; // 0.05 rad ≈ 2.9° — safely small-angle
    let t = 0;
    const dt = 0.0001;
    // integrate exactly one predicted period; theta should return to start
    while (t < T) { s = rk4Step(f, t, s, dt); t += dt; }
    expect(s[0]!).toBeCloseTo(0.05, 3);
  });
  it("damping decays the swing", () => {
    const f = derivative({ g: 9.81, L: 1, damping: 0.5 });
    let s = [1, 0], t = 0;
    for (let i = 0; i < 50000; i++) { s = rk4Step(f, t, s, 0.001); t += 0.001; }
    expect(Math.abs(s[0]!)).toBeLessThan(0.1);
  });
  it("energy formula is zero at rest at the bottom", () => {
    expect(energy({ g: 9.81, L: 1, damping: 0 }, [0, 0])).toBe(0);
  });
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** Green. **Step 5:** Commit: `feat: pendulum system`

**Explain-back:** Why does the period test only work for small starting angles?

---

### Task 6: Velocity Verlet + the energy-drift showdown

**Files:**
- Modify: `src/physics/integrators.ts`
- Test: `src/physics/__tests__/energy.test.ts`

**Interfaces (Produces):**

```ts
export interface SecondOrderState { pos: number[]; vel: number[]; }
/** Velocity Verlet for systems where acceleration depends on position only. */
export function verletStep(
  accel: (pos: number[]) => number[],
  s: SecondOrderState,
  dt: number
): SecondOrderState;
```

**Math to learn first (45 min):**
- Velocity Verlet algorithm (Wikipedia "Verlet integration" § Velocity Verlet): half-kick, drift, recompute accel, half-kick.
- "Symplectic" in one sentence: the integrator conserves a slightly-wrong energy exactly, so real energy oscillates but never drifts — which is why games and orbital sims use it.

- [ ] **Step 1: Failing test — the payoff test of the whole phase:**

```ts
import { eulerStep, verletStep } from "../integrators";
import { derivative, acceleration, energy } from "../systems/pendulum";

describe("energy conservation over 100 periods", () => {
  const p = { g: 9.81, L: 1, damping: 0 };
  const T = 2 * Math.PI * Math.sqrt(p.L / p.g);
  const dt = 0.01;
  const steps = Math.round((100 * T) / dt);
  const E0 = energy(p, [1, 0]);

  it("explicit euler blows up (energy grows > 5%)", () => {
    const f = derivative(p);
    let s = [1, 0], t = 0;
    for (let i = 0; i < steps; i++) { s = eulerStep(f, t, s, dt); t += dt; }
    expect(energy(p, s)).toBeGreaterThan(E0 * 1.05);
  });

  it("verlet stays bounded (energy within 1%)", () => {
    const a = acceleration(p);
    let s = { pos: [1], vel: [0] };
    for (let i = 0; i < steps; i++) s = verletStep(a, s, dt);
    expect(energy(p, [s.pos[0]!, s.vel[0]!])).toBeGreaterThan(E0 * 0.99);
    expect(energy(p, [s.pos[0]!, s.vel[0]!])).toBeLessThan(E0 * 1.01);
  });
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Implement `verletStep` (hints: (1) v_half = v + a(x)·dt/2; (2) x_new = x + v_half·dt; (3) v_new = v_half + a(x_new)·dt/2).
- [ ] **Step 4:** Green — this pair of tests is your interview story.
- [ ] **Step 5:** Commit: `feat: velocity verlet integrator with energy conservation proof`

**Explain-back:** A recruiter asks "why three integrators?" — answer in 3 sentences, no notes.

---

### Task 7: Phase gate

**Files:**
- Create: `LEARNING.md`

- [ ] **Step 1:** Write LEARNING.md Phase 0 entry, 5+ lines, own words: what TS features you now know, what an integrator is, what surprised you.
- [ ] **Step 2:** Full run: `npm test` — everything green, then `npx tsc --noEmit` — zero type errors.
- [ ] **Step 3:** Oral exam (in chat): explain closures, `strict` benefits, Euler vs RK4 vs Verlet trade-offs. Claude probes until fluent.
- [ ] **Step 4:** Commit: `docs: phase 0 learning journal`. Phase 1 (Next.js skeleton) unlocks.

---

## Working rhythm

Per task: read the "learn first" material → type the test → watch it fail → attempt implementation alone (minimum 20 minutes before asking) → if stuck, take hints one rung at a time → green → explain-back in chat → commit. Claude reviews every diff after commit and may require changes before the next task.
