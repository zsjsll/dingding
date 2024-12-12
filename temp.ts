function aaa({ a = "123", b, c }: { a?: string; b?: string; c?: string } = {}) {
  console.log(a)
  console.log(b)
  console.log(c)
}
aaa()

function bbb([min, max]: [number, number] = [11, 22]) {
  console.log(min)
  console.log(max)
}

bbb()

const c = "0   暂停12.235"

const d = c.match(/\d+(\.\d+)?/g)
console.log(d)
