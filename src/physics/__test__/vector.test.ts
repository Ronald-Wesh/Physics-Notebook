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
