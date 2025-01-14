import { system, script } from "./tools"
import { toString } from "lodash"

export default class Config {
  private readonly CONFIG: Json
  private readonly CONFIG_PATH: string
  private readonly VARIABLE: Variable

  constructor() {
    this.VARIABLE = {
      ROOT: false,
      pause: [0, 0],
      thread: undefined,
      info: [],
    }

    this.CONFIG_PATH = files.join(files.cwd(), "config.json")

    this.CONFIG = {
      DEV: false,
      ACCOUNT: "",
      PASSWD: "",
      QQ: "",
      CORP_ID: "", // 公司的钉钉CorpId, 如果只加入了一家公司, 可以不填

      /* 解锁屏幕参数 */
      SWIPESCREEN: {
        TIME: 500, // 滑动时间：毫秒
        START: 0.9, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些 0.9
        END: 0.1, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置 0.1
      },

      SCREEN_BRIGHTNESS: 0, //运行时屏幕亮度
      VOLUME: 0, //声音大小
      OBSERVE_VOLUME_KEY_UP: true, // 监听音量+键, 开启后无法通过音量+键调整音量, 按下音量+键：重启程序线程
      OBSERVE_VOLUME_KEY_DOWN: false, // 不要监听音量-键, 要作为关闭闹钟的按键，所以禁止监听
      NOTIFICATIONS_FILTER: true, // 是否过滤通知
      DELAY: [10, 280], //随机等待时间，单位：秒,如果DELAY[1]填写的值<=0，则跳过等待时间，目前手机设置的是5min锁屏，所以设定5min之内打卡
      // 最小延迟时间,最大延迟时间
      RETRY: 10, //登录和打卡的重试次数
      PACKAGES: {
        QQ: "com.tencent.tim", // 请使用tim
        DD: "com.alibaba.android.rimet", // 钉钉
        EMAIL: "com.tencent.androidqqmail", // QQ邮箱
        XMSF: "com.xiaomi.xmsf", // 小米推送服务
        HWID: "com.huawei.hwid", // 华为手机标识服务
        CLOCK: "com.android.deskclock", // 系统闹铃,自行修改
        HOME: "com.miui.home.launcher.ScreenView", //桌面的包名称，自行修改
      },

      GLOBAL_LOG_FILE_DIR: "Archive/", // 运行日志路径
    }
  }

  private updateConfig(config: Json) {
    let ACCOUNT = config.ACCOUNT
    let PASSWD = config.PASSWD
    let QQ = config.QQ
    for (;;) {
      if (!ACCOUNT) ACCOUNT = toString(dialogs.rawInput("输入钉钉账号"))
      else break
    }
    for (;;) {
      if (!PASSWD) PASSWD = toString(dialogs.rawInput("输入钉钉密码"))
      else break
    }
    for (;;) {
      if (!QQ) QQ = toString(dialogs.rawInput("输入QQ号"))
      else break
    }

    return { ...config, ACCOUNT, PASSWD, QQ }
  }

  private createJsonFile() {
    let config = this.CONFIG
    if (files.exists(this.CONFIG_PATH)) {
      try {
        const cfg: Cfg = JSON.parse(files.read(this.CONFIG_PATH))
        config = { ...this.CONFIG, ...cfg }
      } catch (e) {
        console.error("解析错误，重新生成config.json文件", e)
      }
    } else console.warn("不存在config.json文件，创建并使用默认配置")

    const cfg = this.updateConfig(config)
    const json = JSON.stringify(cfg, null, 2)
    files.write(this.CONFIG_PATH, json)
    return cfg
  }

  initCfg() {
    this.VARIABLE.ROOT = system.isRoot()
    const cfg = this.createJsonFile()
    const final_config: Cfg = { ...cfg, ...this.VARIABLE }
    return final_config
  }

  createLog() {
    const log = files.join(files.cwd(), this.CONFIG.GLOBAL_LOG_FILE_DIR, `${script.formatTime("YYYY-MM-DD-(d)")}.log`)
    console.log("创建运行日志...\n" + log)
    console.setGlobalLogConfig({ file: log })
  }

  information(final_config: Cfg) {
    // console.log(final_config)
    if (final_config.DEV) toastLog("调试模式")
    else console.log("正常模式")
    if (!final_config.NOTIFICATIONS_FILTER) toastLog("白名单已关闭")
    else console.log("白名单已开启")
  }
}
