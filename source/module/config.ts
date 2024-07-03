import { QQCfg, DDCfg, ClockCfg, EmailCfg } from "@/app"
import { PhoneCfg } from "@/phone"
import { ListenerCfg } from "@/listener"
import { getCurrentDate } from "./tools"
import { toString } from "lodash"

export type Cfg = {
    PACKAGE_ID_LIST: White_list
    GLOBAL_LOG_FILE_DIR: string
    suspend_count: number
    msg: string
} & QQCfg &
    DDCfg &
    ClockCfg &
    PhoneCfg &
    ListenerCfg &
    EmailCfg &
    BASE_CONFIG

type White_list = { [k: string]: string; XMSF: string }

type BASE_CONFIG = {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID?: string
}

export class Config {
    config: Cfg
    config_path: string

    constructor() {
        this.config_path = files.join(files.cwd(), "config.json")

        this.config = {
            DEV: false,

            ACCOUNT: "",
            PASSWD: "",
            QQ: "",
            CORP_ID: "", // 公司的钉钉CorpId, 如果只加入了一家公司, 可以不填

            /* 解锁屏幕参数 */
            UNLOCKSCREEN: {
                TIME: 200, // 滑动时间：毫秒
                START: 0.7, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些 0.9
                END: 0.3, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置 0.1
            },

            SCREEN_BRIGHTNESS: 0, //运行时屏幕亮度
            VOLUME: 0, //声音大小
            OBSERVE_VOLUME_KEY: true, // 监听音量+-键, 开启后无法通过音量+-键调整音量, 按下音量+-键：结束所有子线程
            NOTIFICATIONS_FILTER: true, // 是否过滤通知
            DELAY: 4, //随机等待时间，单位：分钟,如果填写的值<:0，则跳过等待时间，目前手机设置的是5min锁屏，所以设定4min
            RETRY: 5, //登录和打卡的重试次数
            PACKAGE_ID_LIST: {
                QQ: "com.tencent.tim", // 请使用tim
                DD: "com.alibaba.android.rimet", // 钉钉
                EMAIL: "com.tencent.androidqqmail", // QQ邮箱
                XMSF: "com.xiaomi.xmsf", // 小米推送服务
                HWID: "com.huawei.hwid", // 华为手机标识服务
                CLOCK: "com.android.deskclock", // 系统闹铃,自行修改
                HOME: "com.miui.home.launcher.ScreenView", //桌面的包名称，自行修改
            },

            GLOBAL_LOG_FILE_DIR: "Archive/", // 运行日志路径

            suspend_count: 0, //暂停打卡次数
            msg: "",
        }
    }

    private updateConfig(config: Cfg) {
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

    createJsonFile() {
        let config: Cfg = this.config
        if (files.exists(this.config_path)) {
            const cfg: Cfg = JSON.parse(files.read(this.config_path))
            config = { ...this.config, ...cfg }
        } else console.log("不存在config.json文件,创建并使用默认配置")

        const final_config = this.updateConfig(config)
        const json = JSON.stringify(final_config, null, 2)
        files.write(this.config_path, json)
        return final_config
    }

    createLog() {
        const log = files.join(files.cwd(), this.config.GLOBAL_LOG_FILE_DIR, `${getCurrentDate()}.log`)
        console.log("创建运行日志...\n" + log)
        console.setGlobalLogConfig({ file: log })
    }

    information(final_config: Cfg) {
        // console.log(final_config)
        if (final_config.DEV) toastLog("调试模式")
        else toastLog("正常模式")
        if (final_config.NOTIFICATIONS_FILTER) toastLog("白名单已开启")
        else toastLog("白名单已关闭")
    }
}
