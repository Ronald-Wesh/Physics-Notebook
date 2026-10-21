/** dy/dt = f(t, y). State y is a plain number array. */
export type Derivative = (t: number, y: number[]) => number[];

/** Euler: y_next = y + f(t, y) * dt. Returns a new array; input untouched. */
export function eulerStep(f: Derivative, t: number, y: number[], dt: number): number[] {
  const slope = f(t, y);
  return y.map((yi, i) => yi + slope[i]! * dt);
}
