import { resetPhone, inWhiteList, White_list, reloadScript } from "@/tools"
import { debounce, forIn, isFunction, toString } from "lodash"
import { Cfg } from "./config"

export type ListenerCfg = {
  OBSERVE_VOLUME_KEY_UP: boolean
  OBSERVE_VOLUME_KEY_DOWN: boolean
  NOTIFICATIONS_FILTER: boolean
  PACKAGE_ID_LIST: White_list
}

type Info = {
  PACKAGENAME: string
  TEXT: string
  PRIORITY: number
  CATEGORY: string
  TIME: string
  NUMBER: number
  TICKER_TEXT: string
}

export class Listener implements ListenerCfg {
  constructor(cfg: Cfg) {
    this.OBSERVE_VOLUME_KEY_UP = cfg.OBSERVE_VOLUME_KEY_UP
    this.OBSERVE_VOLUME_KEY_DOWN = cfg.OBSERVE_VOLUME_KEY_DOWN
    this.NOTIFICATIONS_FILTER = cfg.NOTIFICATIONS_FILTER
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
  }
  OBSERVE_VOLUME_KEY_UP: boolean
  OBSERVE_VOLUME_KEY_DOWN: boolean
  PACKAGE_ID_LIST: White_list
  NOTIFICATIONS_FILTER: boolean

  listenVolumeKey(func?: (e: android.view.KeyEvent) => unknown) {
    events.setKeyInterceptionEnabled("volume_up", this.OBSERVE_VOLUME_KEY_UP)
    events.setKeyInterceptionEnabled("volume_down", this.OBSERVE_VOLUME_KEY_DOWN)
    if (this.OBSERVE_VOLUME_KEY_UP || this.OBSERVE_VOLUME_KEY_DOWN) events.observeKey()

    if (this.OBSERVE_VOLUME_KEY_UP) {
      events.on("key", (keycode: number, event: android.view.KeyEvent) => {
        if (keycode === keys.volume_up && event.getAction() === 0) {
          threads.shutDownAll()
          resetPhone()
          toastLog("按下音量+键,重启程序!")
          reloadScript()
        }
      })
    }

    if (this.OBSERVE_VOLUME_KEY_DOWN) {
      events.on("key", (keycode: number, event: android.view.KeyEvent) => {
        if (keycode === keys.volume_down && event.getAction() === 0) {
          threads.shutDownAll()
          resetPhone()
          toastLog("按下音量键,已中断所有子线程!")
          /* 调试脚本*/

          if (isFunction(func)) return func(event)
          else return
        }
      })
    }
  }

  listenNotification(func?: (notification: org.autojs.autojs.core.notification.Notification) => unknown) {
    events.observeNotification()

    events.on(
      "notification",
      debounce(
        (n: org.autojs.autojs.core.notification.Notification) => {
          const info: Info = {
            PACKAGENAME: n.getPackageName(),
            TEXT: n.getText(),
            PRIORITY: n.priority,
            CATEGORY: n.category,
            TIME: toString(new Date(n.when)),
            NUMBER: n.number,
            TICKER_TEXT: n.tickerText,
          }
          forIn(info, (v, k) => console.verbose(`${k}: ${v}`))
          if (!inWhiteList(this.NOTIFICATIONS_FILTER, this.PACKAGE_ID_LIST, info.PACKAGENAME)) return
          if (isFunction(func)) return func(n)
          return
        },
        200,
        { leading: true, trailing: false }
      )
    )
  }
}
