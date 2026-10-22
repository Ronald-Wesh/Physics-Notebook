/** dy/dt = f(t, y). State y is a plain number array. */
export type Derivative = (t: number, y: number[]) => number[];//t=>current time,y=>current state

/** Euler: y_next = y + f(t, y) * dt. Returns a new array; input untouched. */
export function eulerStep(f: Derivative, t: number, y: number[], dt: number): number[] {
  const slope = f(t, y);//claculate rate of change at the curent state
  return y.map((yi, i) => yi + slope[i]! * dt);//dt=>how much time to move foward  y.map=>calvculate new value for every item in state array
  //yi=>current item  i=current item position in array slope[i]=slope at matching postion !=trust slope[i] isnrt undefined
}

//euler change=>ynext=y+f(t,y)dt ==newvalue=old+slope*dt
