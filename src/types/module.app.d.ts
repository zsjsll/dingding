interface DefPackages {
  HOME: string
}

interface QQCfg {
  PACKAGES: QQPackages
  QQ: string
}

interface QQPackages extends DefPackages {
  QQ: string
}

interface DDCfg {
  PACKAGES: DDPackages
  ACCOUNT: string
  PASSWD: string
  RETRY: number

  CORP_ID: string
}
interface DDPackages extends DefPackages {
  DD: string
}

interface ClockPackages extends DefPackages {
  CLOCK: string
}

interface ClockCfg {
  PACKAGES: ClockPackages
  SWIPESCREEN: SwipeScreen
  RETRY: number
}

interface EmailPackages extends DefPackages {
  EMAIL: string
}

interface EmailCfg {
  PACKAGES: EmailPackages
}

interface AppPackages extends DefPackages, QQPackages, DDPackages, ClockPackages, EmailPackages {}
