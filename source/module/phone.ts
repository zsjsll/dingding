import { brightScreen, isDeviceLocked, backHome, setVolume, openScreen, UnLockScreen, resetPhone, closeScreen, openWifi, holdOn } from "@/tools"
import { Cfg } from "./config"

export type PhoneCfg = {
  DEV: boolean
  root: boolean
  SCREEN_BRIGHTNESS: number
  UNLOCKSCREEN: UnLockScreen
  VOLUME: number
  PACKAGE_ID_LIST: Phone_Package_Id_List
  DELAY: Delay
}

type Delay = [number, number]

type Phone_Package_Id_List = {
  HOME: string
}

export class Phone implements PhoneCfg {
  DEV: boolean
  root: boolean
  SCREEN_BRIGHTNESS: number
  UNLOCKSCREEN: UnLockScreen
  VOLUME: number
  PACKAGE_ID_LIST: Phone_Package_Id_List
  DELAY: Delay

  constructor(cfg: Cfg) {
    this.DEV = cfg.DEV
    this.root = cfg.root
    this.SCREEN_BRIGHTNESS = cfg.SCREEN_BRIGHTNESS
    this.UNLOCKSCREEN = cfg.UNLOCKSCREEN
    this.VOLUME = cfg.VOLUME
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
    this.DELAY = cfg.DELAY
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
      openScreen(this.UNLOCKSCREEN, root)
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

  doIt(f: (root:boolean) => void, delay: Delay = [0, 0]) {
    //默认不延迟
    setTimeout(() => {
      threads.shutDownAll()
      threads.start(() => {
        this.turnOn(this.root)
        openWifi(this.root)
        holdOn(...delay)
        f(this.root)
        this.turnOff(this.root)
      })
    }, 1000) //等待，这样可以打断锁屏，并且让console.log()输出完整
  }
}
