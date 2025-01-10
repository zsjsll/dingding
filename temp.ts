import { includes, isString, some } from "lodash"

function findsome(original: string | string[], find: string | string[]) {
  if (isString(original)) {
    //original is string
    if (isString(find)) {
      return includes(original, find)
    } else {
      //find is array
      let isfind = false
      for (const value of find) {
        isfind = includes(original, value)
        // console.log(f)
        if (isfind) break
      }
      return isfind
    }
  } else {
    //original is array
    if (isString(find)) {
      return some(original, (v) => includes(v, find))
    } else {
      let isfind = some(original, (v) => {
        for (const value of find) {
          isfind = includes(v, value)
          console.log("----->[isfind] =", isfind)

          if (isfind) return true
        }
      })
      return isfind
    }
  }
}
console.log(findsome(["bba", "cccc"], ["bvb", "cccccccc", "c"]))

const aaa = some({ a: 1, b: 2, c: 3 }, (v) => v === 1)
console.log("----->[aaa] =", aaa)
