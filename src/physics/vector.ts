export interface Vec2 {
  readonly x: number;
  readonly y: number;
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

export function length(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}
