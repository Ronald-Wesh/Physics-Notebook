export interface Vec2 {//interface =>shape of an object=>structure of a vector.
  readonly x: number;
  readonly y: number;//readonly=>cant assign new values to properties after object creation
}

export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return vec2(a.x + b.x, a.y + b.y);
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return vec2(a.x - b.x, a.y - b.y);
}

export function scale(v: Vec2, k: number): Vec2 {
  return vec2(v.x * k, v.y * k);
}

export function length(v: Vec2): number {//return type number
  return Math.hypot(v.x, v.y);//Math.hypo=>finds square root of sum of sqaures of its arguments
}
