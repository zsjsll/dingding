// tools.ts
export type Delay = [number, number]

export interface SwipeScreen {
  TIME: number
  START: number
  END: number
}

export type Pause = [number, number]

interface PackageOptions {
  whiteList?: string[]
  except?: string[]
}

export type Package = [string, PackageOptions] | [string]

//listener.ts
export interface ListenerCfg {
  OBSERVE_VOLUME_KEY_UP: boolean
  OBSERVE_VOLUME_KEY_DOWN: boolean
  NOTIFICATIONS_FILTER: boolean
  PACKAGES: AppPackages
}

export interface Info {
  PACKAGENAME: string
  TITLE: string
  TEXT: string
  PRIORITY: number
  CATEGORY: string
  TIME: string
  NUMBER: number
  TICKER_TEXT: string
}

// app.ts

interface QQPackages extends PhonePackages {
  QQ: Package
}

export interface QQCfg {
  PACKAGES: QQPackages
  QQ: string
}

interface DDPackages extends PhonePackages {
  DD: Package
}

export interface DDCfg {
  PACKAGES: DDPackages
  ACCOUNT: string
  PASSWD: string
  RETRY: number

  CORP_ID: string
}

interface ClockPackages extends PhonePackages {
  CLOCK: Package
}

export interface ClockCfg {
  PACKAGES: ClockPackages
  SWIPESCREEN: SwipeScreen
  RETRY: number
}

interface EmailPackages extends PhonePackages {
  EMAIL: Package
}

export interface EmailCfg {
  PACKAGES: EmailPackages
}

// Phone.ts

export interface PhoneCfg {
  DEV: boolean
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
  PACKAGES: PhonePackages
}

interface PhonePackages {
  HOME: Package
}
export enum step {
  next = "next",
  exit = "exit",
}
//config.ts

type ExtendPackages = "XMSF" | "HWID"

type ExtendPackagesMap = Record<ExtendPackages, Package>

export type AppPackages = PhonePackages & QQPackages & DDPackages & ClockPackages & EmailPackages & ExtendPackagesMap


export interface Json extends DDCfg, QQCfg, PhoneCfg, ListenerCfg {
  PACKAGES: AppPackages
  GLOBAL_LOG_FILE_DIR: string
  DELAY: Delay
}

export interface Variable {
  ROOT: boolean
  pause: Pause
  thread: org.autojs.autojs.core.looper.TimerThread | undefined
  info: string[]
}

export type Cfg = Variable & Json
