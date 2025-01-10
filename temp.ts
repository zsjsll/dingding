import { includes, isString, some } from "lodash"

const t = "[2条]12345689"

if (t.startsWith("[")) {
  const k = t.split("]")
  console.log(k.at(-1))
}

const tt = t.replace(/^\[\d+条\]\s*/g, "")
console.log(tt)

function findsome(a: string | string[], find?: string | string[]) {
  if (isString(a)) {
    if (isString(find)) {
      return includes(a, find)
    } else {
      console.log(123)
    }
  }
}
console.log(findsome("aaaaa", "b"))
console.log(some("aaaaa", (v) => v === "a"))

for (const key in [1, 2, 3, 4]) {
  console.log(key)
}
