type Combiner = (a: number, b: number) => number; //Defining function type(arguments)

const add: Combiner = (a, b) => a + b;
const multiply: Combiner = (a, b) => a * b;
const max: Combiner = (a, b) => Math.max(a, b);

function applyCombiner(f: Combiner, x: number, y: number): number {
  return f(x, y);
}

console.log(applyCombiner(add, 2, 3)); // 5
console.log(applyCombiner(multiply, 2, 3)); // 6
console.log(applyCombiner(max, 2, 3)); // 3

// Step 4: noUncheckedIndexedAccess=>Typescript compiler setting makes array access safer
// const nums: number[] = [10, 20];
// const [a, b] = nums;
// // a, b are `number | undefined` here -> `a + b` errors: "'a' is possibly 'undefined'"
// // const bad = a + b;
// const ok = a! + b!; // `!` asserts "trust me, not undefined" — honest only because we know length is 2
// console.log(ok);

//!=>Non-Null assertion Operator=>"Trust me. I know this value is not null or undefined."

const nums: number[] = [10, 20];

const a = nums[0];
const b = nums[1];

if (a !== undefined && b !== undefined) {
  const ok = a + b;
  console.log(ok);
}

//Combiner=>Defines rules for a function
//applyCombiner=>Desmonstrates that afunctions can be passed in othe rfunctions
//noUncheckedIndexAccess=>warns when an array element doesnt exist
//!=>trust assertions that value exists no checking at runtime=>non null assertion Operator