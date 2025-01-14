type Json = {
  PACKAGES: WhiteList
  GLOBAL_LOG_FILE_DIR: string
  DELAY: Delay
} & QQCfg &
  DDCfg &
  ClockCfg &
  PhoneCfg &
  ListenerCfg &
  EmailCfg &
  BaseConfig

// interface Json extends BaseConfig, DDCfg, QQCfg, PhoneCfg, ListenerCfg {
//   PACKAGES: AppPackages
//   GLOBAL_LOG_FILE_DIR: string
//   DELAY: Delay
// }

// interface WhiteList {
//   XMSF: string
//   HWID: string
// }

interface BaseConfig {
  ACCOUNT: string
  PASSWD: string
  QQ: string
  CORP_ID: string
}

interface Variable {
  ROOT: boolean
  pause: Pause
  thread: org.autojs.autojs.core.looper.TimerThread | undefined
  info: string[]
}

type Cfg = Variable & Json
