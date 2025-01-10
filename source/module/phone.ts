import { brightScreen, isDeviceLocked, backHome, setVolume, swipeScreen, SwipeScreen, resetPhone, closeScreen, openWifi } from "@/tools"

export interface PhoneCfg {
  DEV: boolean
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
  PACKAGE_ID_LIST: PhonePackageIdList
}

interface PhonePackageIdList {
  HOME: string
}

export class Phone {
  private readonly DEV: boolean
  private readonly SCREEN_BRIGHTNESS: number
  private readonly SWIPESCREEN: SwipeScreen
  private readonly VOLUME: number
  private readonly PACKAGE_ID_LIST: PhonePackageIdList

  next: step = step.next
  exit: step = step.exit

  constructor(cfg: PhoneCfg) {
    this.DEV = cfg.DEV
    this.SCREEN_BRIGHTNESS = cfg.SCREEN_BRIGHTNESS
    this.SWIPESCREEN = cfg.SWIPESCREEN
    this.VOLUME = cfg.VOLUME
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
  }

  turnOn(root: boolean) {
    const screen_brightness = this.DEV ? -1 : this.SCREEN_BRIGHTNESS
    if (!brightScreen(screen_brightness)) {
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
}

enum step {
  next = "next",
  exit = "exit",
}
