interface PhoneCfg {
  DEV: boolean
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
  PACKAGES: PhonePackageIdList
}

interface PhonePackageIdList {
  HOME: string
}
