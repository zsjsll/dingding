const t = "[2条]12345689"

if (t.startsWith("[")) {
  const k = t.split("]")
  console.log(k.at(-1))
}

const tt = t.replace(/^\[\d+条\]\s*/g, "")
console.log(tt)

const aaa=123
console.log(aaa)
