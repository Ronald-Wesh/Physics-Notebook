import { eulerStep } from "../integrators";

const G = 9.81;
/** Free fall: state [height, velocity] */
const freeFall = (_t: number, [, vy]: number[]) => [vy!, -G];//,vy=>takes 2nd item from array ..comma skips 2nd item height
//vy=>cuurent vertical velocity\rate of change of height -G=>rate of change of velocity: the acceleration.

describe("eulerStep", () => {
  it("advances free fall one step", () => {//Test 1: Does one step produce the expected result?
    const next = eulerStep(freeFall, 0, [100, 0], 0.1);//freefall=>rukes describing how ball moves 0=>starting time 0.1=>amount of time in advance
    expect(next[0]).toBeCloseTo(100, 5); // y + 0*dt=>height
    expect(next[1]).toBeCloseTo(-0.981, 5); // 0 + (-9.81)*0.1=>Velocity 
  });
  it("does not mutate the input state", () => {//Test 2: Does the function leave the original array unchanged?
    const y = [100, 0];//current state=>height ,velocity 
    eulerStep(freeFall, 0, y, 0.1);//ask eulerstep to calculate the state of ball 0.1 secs later
    expect(y).toEqual([100, 0]);
  });
  it("accumulates visible error over 1s of free fall", () => {//Test 3: Does repeating the calculation produce a reasonable approximation over time?
    // exact: y(1) = 100 - 0.5*9.81 = 95.095
    let s = [100, 0];//starting state
    for (let i = 0; i < 100; i++) s = eulerStep(freeFall, i * 0.01, s, 0.01);//i*0.01=>current simulation of time s=>current height& velocity 
    //s =save new state to use in next step
    expect(s[0]).toBeGreaterThan(95.095); // Euler lags the true fall
    expect(s[0]).toBeCloseTo(95.095, 0); // but roughly right
  });
});

//(h(t) = h0 +vot -1/2 gt^2
