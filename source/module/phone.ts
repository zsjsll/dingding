import { brightScreen, isDeviceLocked, backHome, setVolume, swipeScreen, SwipeScreen, resetPhone, closeScreen, openWifi } from "@/tools"
import { Cfg, Variable } from "./config"
import { isEmpty } from "lodash"

export type PhoneCfg = {
  DEV: boolean
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
  PACKAGE_ID_LIST: Phone_Package_Id_List
}

type Phone_Package_Id_List = {
  HOME: string
}

export class Phone implements PhoneCfg {
  DEV: boolean
  ROOT: boolean
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
  PACKAGE_ID_LIST: Phone_Package_Id_List

  constructor(cfg: Cfg) {
    this.ROOT = cfg.ROOT
    this.DEV = cfg.DEV
    this.SCREEN_BRIGHTNESS = cfg.SCREEN_BRIGHTNESS
    this.SWIPESCREEN = cfg.SWIPESCREEN
    this.VOLUME = cfg.VOLUME
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
  }

  turnOn(root: boolean) {
    if (this.DEV) this.SCREEN_BRIGHTNESS = -1

    if (!brightScreen(this.SCREEN_BRIGHTNESS)) {
      console.error("唤醒设备失败!")
      return false
    }
    sleep(500)
    if (isDeviceLocked()) {
      console.log("解锁屏幕")
      swipeScreen(this.SWIPESCREEN, root)
      if (isDeviceLocked()) {
        console.error("上滑解锁失败, 请按脚本中的注释调整UNLOCKSCREEN中的 key[TIME, START, END] 的参数!")
        return false
      }
    }
    console.info("屏幕已解锁")
    setVolume(this.VOLUME)
    backHome(this.PACKAGE_ID_LIST.HOME)
    openWifi(root)
    return true
  }

  turnOff(root: boolean) {
    backHome(this.PACKAGE_ID_LIST.HOME)
    if (this.DEV) resetPhone()
    console.log("关闭屏幕")
    for (let i = 0; i < 10; i++) {
      closeScreen(root)
      if (!device.isScreenOn()) {
        console.info("屏幕已关闭")
        return true
      }
    }
    console.error("需root权限或Android 9 以上版本,等待屏幕自动关闭")
    return false
  }

  doIt(
    hook: Hook = {
      beforeCreateThread: function (): void {},
      beforeTurnOn: function (): void {},
      running: function (): void {},
      afterTurnOff: function (): void {},
      afterCreateThread: function (): void {},
    }
  ) {
    hook.beforeCreateThread()
    const thread = threads.start(() => {
      hook.beforeTurnOn
      this.turnOn(this.ROOT) //打开wifi也在这个地方完成
      hook.running()
      this.turnOff(this.ROOT)
      hook.afterTurnOff()
    })
    hook.afterCreateThread()
    return thread
  }
}

export type Hook = {
  beforeCreateThread: () => void
  afterCreateThread: () => void
  beforeTurnOn: () => void
  running: () => void
  afterTurnOff: () => void
}
