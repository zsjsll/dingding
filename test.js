const { toNumber } = require("lodash")
const { floor } = require("lodash")

function a() {
  return NaN
}

const b = [1]

let c = floor(toNumber("123.123.23"))
c ?? 1
console.log(c)


console.log(b.length)
