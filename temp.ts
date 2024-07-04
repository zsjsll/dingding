import { ceil, floor, List, parseInt, replace, split, toInteger, toNumber, trim, trimStart } from "lodash"

function test(str: string) {
    const a = "0" + str

    const b = a.match(/[\d.]+/g)?.map((v) => toNumber(v))
    return b
}

console.log(test("15暂停4.5"))

let a = 1
a ||= 10
console.log(a)
