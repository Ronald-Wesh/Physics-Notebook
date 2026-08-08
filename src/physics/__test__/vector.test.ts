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
  it("calculates length correctly", () => {
    expect(length(vec2(3, 4))).toBe(5);
  });
});
