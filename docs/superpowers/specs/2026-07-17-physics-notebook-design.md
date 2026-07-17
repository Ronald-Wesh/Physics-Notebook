# Physics Notebook — Design Document

**Date:** 2026-07-17
**Status:** Draft for review
**Author:** Ronald (with Claude supervision)

## 1. Purpose

An interactive physics learning site built as a **portfolio piece** and a **project-based learning vehicle**. Ronald (CS major, intermediate physics, MERN background) writes all the code under supervision; the project teaches Next.js, TypeScript, canvas graphics, and numerical physics along the way.

Inspired by https://physics-notebook.casberry.in/ but deliberately a different species, not a clone.

## 2. Differentiation

The reference site puts a simulation *in a box next to* static text. This project makes the **page itself alive** — explorable explanations in the style of distill.pub and Bret Victor's essays:

- Numbers inside sentences are draggable; drag one and the equation, graph, and animation all update instantly.
- Equations render with live values highlighted, not as static images.
- Scrolling advances a narrative while the simulation evolves cinematically.
- Every concept is a "living essay," not a page with a widget.

Second structural difference: the reference hand-wires every page in vanilla JS, which is why most of its catalog is roadmap stubs. This project builds an **essay framework first** — reusable interactive primitives — so each new concept is a content file plus one simulation, not a new engineering project. Depth *and* breadth become possible.

## 3. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, static export) | MDX support, SEO for portfolio discoverability, highest job-market value |
| Language | TypeScript | Transferable skill; types shine in the physics core |
| Content | MDX | Physics prose in markdown with React components dropped mid-sentence |
| Styling | Tailwind CSS | Fast iteration, industry standard |
| Equations | KaTeX | Same job as reference's MathJax, ~10× faster |
| Animation | GSAP + ScrollTrigger | Scroll-driven narrative scenes (same lib the reference uses) |
| Simulation | Raw Canvas 2D API | No physics library — integrators written by hand as a learning goal |
| State | Zustand | Tiny store linking inline controls to sims and graphs |
| Icons | Lucide (React package) | Same as reference |
| Testing | Vitest | Physics core is pure functions — ideal unit-test ground |
| Hosting | Vercel (free tier) | Zero-config CDN, preview deploys |

No backend, no database, no auth. Static site. Anything server-side is out of scope until a real need appears.

## 4. Architecture

Single Next.js app, one repo. No monorepo/workspace — the physics core is just a folder of pure TypeScript.

```
physics-notebook/
├── src/
│   ├── physics/            # Pure TS, zero framework imports, fully unit-tested
│   │   ├── vector.ts       # Vec2 math
│   │   ├── integrators.ts  # Euler, RK4, symplectic (velocity Verlet)
│   │   ├── systems/        # One module per simulated system
│   │   │   ├── projectile.ts
│   │   │   ├── pendulum.ts
│   │   │   └── ...
│   │   └── __tests__/
│   ├── components/
│   │   ├── essay/          # The reusable primitives (see §5)
│   │   └── ui/             # Nav, theme toggle, cards
│   ├── content/            # One .mdx file per concept
│   │   └── mechanics/
│   │       ├── newtons-laws.mdx
│   │       └── ...
│   ├── stores/             # One Zustand store factory per essay
│   └── app/                # Next.js routes
│       ├── layout.tsx
│       ├── page.tsx        # Home: domain/concept library grid
│       └── [domain]/[concept]/page.tsx
├── docs/superpowers/specs/
└── LEARNING.md             # Phase-by-phase learning journal
```

**Data flow per essay:** MDX prose renders server-side → interactive primitives are client components → they read/write a per-essay Zustand store → the store feeds the sim loop (canvas) and graphs → drag a `<Num>` in a sentence and everything downstream reacts.

**Physics/render split:** `src/physics/` computes state (pure functions: `step(state, params, dt) → state`); components only draw it. This boundary is what makes the core testable and the components thin.

## 5. Core Primitives (the essay framework)

| Component | Role |
|---|---|
| `<Num>` | Draggable/scrubbable number inline in prose, bound to a store param |
| `<Eq>` | KaTeX equation; live param values substituted and highlighted |
| `<SimCanvas>` | Canvas harness: RAF loop, resize handling, play/pause/reset, calls a system's `step` + `draw` |
| `<Graph>` | Reactive plot (canvas-drawn) of any store values over time |
| `<ScrollScene>` | GSAP ScrollTrigger section that drives store params or camera as the reader scrolls |
| `<ConceptLayout>` | Essay chrome: title, domain breadcrumb, prev/next, reading progress |

Rule: every essay is built ONLY from these primitives plus its system module. A new primitive is added only when two essays need it.

## 6. Content Roadmap

Ordered for learning progression (each concept's physics builds on the previous), mechanics first:

1. **Newton's Laws** — projectile motion, forces (Phase 3 flagship essay)
2. **Conservation of Energy** — pendulum / ramp
3. **Momentum & Collisions** — 1D/2D collisions
4. **Oscillations & SHM** — springs, damping, resonance
5. **Gravity & Orbits** — two-body, orbital mechanics
6. **Rotational Dynamics** — torque, angular momentum
7. **Double Pendulum & Chaos** — showpiece essay (visually spectacular)
8. **Waves & Interference** — first non-mechanics domain
9. Electric & Magnetic Fields, and beyond — same rails, new domains

No stub pages ever published. A concept appears on the site only when its essay is complete. The library grid shows what exists, not promises.

## 7. Learning Path (build phases)

One new technology per phase. Each phase ends with an explain-back review and a LEARNING.md entry.

| Phase | New skill | Deliverable |
|---|---|---|
| 0 | TypeScript | `src/physics/` core: Vec2, Euler + RK4 + Verlet integrators, projectile & pendulum systems, Vitest tests passing |
| 1 | Next.js basics | App skeleton: routing, layout, theme toggle, empty library grid, deployed to Vercel |
| 2 | Canvas + React | `<SimCanvas>` running the projectile system with play/pause |
| 3 | MDX pipeline | First full essay: Newton's Laws with `<Num>`, `<Eq>`, `<Graph>` all live |
| 4 | GSAP ScrollTrigger | `<ScrollScene>` added to the Newton essay; library grid polished |
| 5+ | Repetition → fluency | One new concept essay per cycle, following §6 order |

**Supervision contract:** Ronald types all code. Claude explains concepts, points at docs, reviews diffs like a senior dev, and hints (not answers) during debugging. Wholesale code from Claude only for inert config. Phase gate: Ronald explains the phase's code in plain words before moving on.

## 8. Error Handling & Edge Cases

- Sim loop: clamp `dt` (tab-switch resume must not explode the integrator); pause when canvas is off-screen (IntersectionObserver).
- `<Num>` inputs: min/max clamps per param, defined in the system module, so no slider value can produce NaN states.
- Reduced motion: respect `prefers-reduced-motion` — scroll scenes degrade to static states.
- Mobile: `<Num>` drag works via touch; sims cap device-pixel-ratio to keep frame rate.

## 9. Testing

- **Physics core:** Vitest unit tests — integrator accuracy against closed-form solutions (projectile parabola, SHM period), energy conservation drift bounds for Verlet.
- **Components:** light — one render test per primitive. No e2e suite unless the site grows one page type beyond essays.

## 10. Success Criteria

- A recruiter landing on any essay understands within 10 seconds that the page is interactive and unusual.
- Adding concept essay N+1 requires no new framework code, only content + one system module.
- Ronald can explain every line in the repo and rebuild the stack unaided on a future project.
- Lighthouse: 90+ performance and SEO on essay pages.
