const a = { b: { c: 1 } }

function f(k: undefined) {
  k.c = 5
}

f(a.b)
console.log(a)
