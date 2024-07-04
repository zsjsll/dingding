import {
    ceil,
    floor,
    isObject,
    isString,
    List,
    parseInt,
    replace,
    split,
    toInteger,
    toNumber,
    trim,
    trimStart,
} from "lodash"

function test(str: string) {
    const a = "0" + str

    const b = a.match(/[\d.]+/g)?.map((v) => toNumber(v))
    return b
}

console.log(test("15暂停4.5"))

type O = {
    a: number
    b: number
}

function test2(o: O) {
    if (o !== undefined) {
        const { a, b } = o
        if (a === 0 && b === 0) return "1"
        else if (a === 0) return "2"
        else return "4"
    }
}

console.log(test2({ a: 0, b: 6 }))
