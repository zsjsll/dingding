import { BlackListOptions, FilterStates } from "./src/modules/types"
import { forEach, forIn, includes, isEmpty } from "lodash"

const a = "考勤打卡，打卡成功"

const b: BlackListOptions = { keywords: [], except: [] } //true
// const b: BlackListOptions = { keywords: ["123"], except: [] } //true
// const b: BlackListOptions = { keywords: ["考勤"], except: [] } //false
// const b: BlackListOptions = { keywords: ["考勤"], except: ["123"] } //false
// const b: BlackListOptions = { keywords: ["123", "考勤"], except: ["123", "打卡"] } //true

const filterKeywords = (text: string, black_list: BlackListOptions) => {
  let status: FilterStates = FilterStates.pass
  if (isEmpty(black_list?.keywords)) console.info("放行，黑名单为空")
  forIn(black_list.keywords, (key_word) => {
    if (!includes(text, key_word)) console.info("放行,不在黑名单中")
    if (isEmpty(black_list.except)) {
      console.info("丢弃,在黑名单中，但排除名单为空")
      status = FilterStates.drop
    } else {
      forIn(black_list.except, (except_word) => {
        if (includes(text, except_word)) console.info("放行,在黑名单中,但也在排除名单中")
        else {
          console.info("丢弃,在黑名单中，但是不在排除名单中")
          status = FilterStates.drop
        }
      })
    }
  })
  return status
}

console.log(filterKeywords(a, b))

interface Name {
  name: string
}

type L = [Name, Name]

const l: L = [{ name: "aaaa" }, { name: "2" }]

forEach(l, (v) => {
  console.log(v)
})

console.log(includes("123", undefined))
