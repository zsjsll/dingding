interface ListenerCfg {
  OBSERVE_VOLUME_KEY_UP: boolean
  OBSERVE_VOLUME_KEY_DOWN: boolean
  NOTIFICATIONS_FILTER: boolean
  PACKAGES: WhiteList
}

interface Info {
  PACKAGENAME: string
  TITLE: string
  TEXT: string
  PRIORITY: number
  CATEGORY: string
  TIME: string
  NUMBER: number
  TICKER_TEXT: string
}
