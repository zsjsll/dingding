const path = require("path")

let aa = path.posix.resolve("./dist")
aa = path.resolve("./dist")
console.log("[ aa ]-5", aa)

const o = { a: undefined }
console.log(o===undefined)

const map1 = new Map()

map1.set(["a"], 1)
map1.set("b", 2)
map1.set("c", 3)

console.log(map1.forEach((v) => console.log(v)))
