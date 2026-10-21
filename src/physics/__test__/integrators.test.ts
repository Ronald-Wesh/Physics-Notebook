import { eulerStep } from "../integrators";

const G = 9.81;
/** Free fall: state [height, velocity] */
const freeFall = (_t: number, [, vy]: number[]) => [vy!, -G];

describe("eulerStep", () => {
  it("advances free fall one step", () => {
    const next = eulerStep(freeFall, 0, [100, 0], 0.1);
    expect(next[0]).toBeCloseTo(100, 5); // y + 0*dt
    expect(next[1]).toBeCloseTo(-0.981, 5); // 0 + (-9.81)*0.1
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
    expect(s[0]).toBeGreaterThan(95.095); // Euler lags the true fall
    expect(s[0]).toBeCloseTo(95.095, 0); // but roughly right
  });
});
