import { brightScreen, isDeviceLocked, backHome, setVolume, swipeScreen, UnLockScreen as SwipeScreen, resetPhone, closeScreen, openWifi } from "@/tools"
import { Cfg, Variable } from "./config"

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
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
  PACKAGE_ID_LIST: Phone_Package_Id_List

  constructor(cfg: Cfg) {
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
    return true
  }

  turnOff(root: boolean) {
    backHome(this.PACKAGE_ID_LIST.HOME)
    if (this.DEV) resetPhone()
    console.log("关闭屏幕")
    for (let i = 0; i < 10; i++) {
      closeScreen(root)
      sleep(2000)

      if (!device.isScreenOn()) {
        console.info("屏幕已关闭")
        return true
      }
    }
    console.error("需root权限或Android 9 以上版本,等待屏幕自动关闭")
    return false
  }

  doIt(variable: Variable, f: () => void) {
    threads.shutDownAll()

    variable.thread = threads.start(() => {
      this.turnOn(variable.root)
      openWifi(variable.root)
      f()
      variable.info = []
      this.turnOff(variable.root)
    })
  }
}
