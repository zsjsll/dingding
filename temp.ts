const line = "------------------------"
let msg = "你好"

msg = line + "\n" + msg + "\n" + line

const se = msg.replace(/^-+\n/, "")

console.log(se)

const o = { a: 1, b: 5 }

if (o.a > 0 || o.b === 0) console.log(1)
