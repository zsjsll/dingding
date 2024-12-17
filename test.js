let _ = require("lodash")

let msgs = ["你好", "小明"]
let a = _.some(msgs, (v) => _.includes(v, "你好"))
console.log(a)

function aa() {
  return 123
}
let bb = [`hhaha" + ${aa()}`, 123]
console.log(bb)
msgs.shift()

console.log(msgs)
