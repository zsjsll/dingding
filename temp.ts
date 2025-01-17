import { BlackListOptions } from "@/types"
import { includes } from "lodash"

const a = "考勤打卡，打卡成功"

const b: BlackListOptions = { keywords: [], except: [] }

const findKeywords = (black_list: BlackListOptions, info: string) => {
  for (const keyword of black_list.keywords) {
    if (includes(info, keyword)) {
      for (const except of black_list.except) {
        if (includes(info, except)) {
          console.log("放行,在黑名单中,但在排除名单中")
          return true
        } else {
          console.log("丢弃,在黑名单中，也不在排除名单中")
          return false
        }
      }
      console.log("丢弃,在黑名单中")
      return false
    } else {
      console.log("放行,不在黑名单中")
      return true
    }
  }
}

findKeywords(b, a)
