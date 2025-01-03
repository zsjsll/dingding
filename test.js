const path = require("path")

let aa = path.posix.resolve("./dist")
aa = path.resolve("./dist")
console.log("[ aa ]-5", aa)


const o = { a: 123, b: 23, c: { d: 12 } }
console.log("----->[o] =", Object.keys(o))



const map1 = new Map();

map1.set(['a'], 1);
map1.set('b', 2);
map1.set('c', 3);

console.log(map1.forEach(v=>console.log(v)
))
