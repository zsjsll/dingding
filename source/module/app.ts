import { backHome, openApp, getCurrentDate, getCurrentTime, holdOn } from "@/tools"
import { Cfg } from "./config"

export type QQCfg = {
    PACKAGE_ID_LIST: QQ_Package_Id_List
    QQ: string
}

type QQ_Package_Id_List = {
    QQ: string
    HOME: string
}

type App = {
    open(retry?: number): boolean
}

export class QQ implements App, QQCfg {
    PACKAGE_ID_LIST: QQ_Package_Id_List
    QQ: string

    constructor(cfg: Cfg) {
        this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
        this.QQ = cfg.QQ
    }

    open() {
        return openApp(this.PACKAGE_ID_LIST.QQ)
    }

    sendmsg(message: string) {
        app.startActivity({
            action: "android.intent.action.VIEW",
            data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + this.QQ,
            packageName: this.PACKAGE_ID_LIST.QQ,
        })
        const input = id(this.PACKAGE_ID_LIST.QQ + ":id/input").findOne(-1)
        input.setText(`${message}\n当前电量:${device.getBattery()}%\n是否充电:${device.isCharging()}`)
        const send = text("发送").clickable().findOne(-1)
        send.click()
        console.info("发送成功")
        return true
    }
    openAndSendMsg(message: string = "测试") {
        console.log("发送信息")
        backHome(this.PACKAGE_ID_LIST.HOME)
        if (!this.open()) {
            console.error("无法打开QQ!")
            return false
        }
        const r = this.sendmsg(message)
        sleep(1000)
        backHome(this.PACKAGE_ID_LIST.HOME)
        return r
    }
}

export type DDCfg = {
    PACKAGE_ID_LIST: DD_PACKAGE_ID_LIST
    ACCOUNT: string
    PASSWD: string
    RETRY: number
    DELAY: number
    CORP_ID?: string
}
type DD_PACKAGE_ID_LIST = {
    DD: string
    HOME: string
}

export class DD implements App, DDCfg {
    constructor(cfg: Cfg) {
        this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
        this.ACCOUNT = cfg.ACCOUNT
        this.PASSWD = cfg.PASSWD
        this.RETRY = cfg.RETRY
        this.CORP_ID = cfg.CORP_ID
        this.DELAY = cfg.DELAY
    }
    DELAY: number
    PACKAGE_ID_LIST: DD_PACKAGE_ID_LIST
    ACCOUNT: string
    PASSWD: string
    RETRY: number
    CORP_ID: string

    // 登录钉钉，如果已经登录，false
    private logining() {
        if (id(this.PACKAGE_ID_LIST.DD + ":id/cb_privacy").findOne(1e3) !== null) {
            id("et_phone_input").findOne(-1).setText(this.ACCOUNT)
            id("et_password").findOne(-1).setText(this.PASSWD)
            id("cb_privacy").findOne(-1).click()
            id("btn_next").findOne(-1).click()
            return true
        } else return false
    }
    // 不进行更新
    private noUpdate() {
        const noupdate = text("暂不更新").findOne(10e3)
        if (noupdate !== null) {
            noupdate.click()
            return true
        } else return false
    }
    // 强制回到app的home界面
    private atAppHome() {
        const message = id("home_app_item").indexInParent(0).findOne(1e3)

        if (message === null) return false
        message.click()
        return true
    }

    open() {
        for (let index = 1; index <= this.RETRY; index++) {
            console.info(`第${index}次登录...`)
            backHome(this.PACKAGE_ID_LIST.HOME)
            console.log("正在启动" + app.getAppName(this.PACKAGE_ID_LIST.DD) + "...")

            if (!openApp(this.PACKAGE_ID_LIST.DD)) {
                console.warn("启动失败，重新启动...")
                continue
            }
            if (!this.logining()) console.log("正在登录...")
            else console.log("可能已登录")
            if (this.noUpdate()) console.info("取消更新")
            else console.log("无更新消息")
            const is_at_app_home = this.atAppHome()
            sleep(5e3) //如果设置了极速打卡或者蓝牙自动打卡， 会在这段时间完成打卡
            if (is_at_app_home) return true
            else console.warn("登录失败,重试...")
        }
        console.error(`重试${this.RETRY}次,登录失败!`)
        return false
    }

    punchIn() {
        const u = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"
        const url = this.CORP_ID === "" ? u : `${u}?corpId=${this.CORP_ID}`

        const a = app.intent({
            action: "VIEW",
            data: url,
            //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
        })
        for (let index = 1; index <= this.RETRY; index++) {
            console.info(`第${index}次尝试打卡...`)
            app.startActivity(a)
            console.log("正在进入考勤界面...")
            if (text("申请").findOne(15e3) === null) {
                console.error("连接错误,重新进入考勤界面!")
                back()
                continue
            }
            console.log("已进入考勤界面")
            console.log("等待连接到考勤机...")
            if (textContains("考勤").findOne(15e3) === null) {
                console.error("不符合打卡规则,重新进入考勤界面!")
                back()
                continue
            }
            console.info("可以打卡")
            const btn =
                text("上班打卡").clickable(true).findOnce() ||
                text("下班打卡").clickable(true).findOnce() ||
                text("迟到打卡").clickable(true).findOnce()
            if (btn === null) {
                click(device.width / 2, device.height * 0.56)
                console.log("点击打卡按钮坐标")
            } else {
                btn.click()
                console.log("按下打卡按钮")
            }
            if (textContains("成功").findOne(15e3) === null) {
                console.warn("打卡无效,也许未到打卡时间!")
                return `考勤打卡:${getCurrentTime()}打卡·无效\n也许未到打卡时间`
            }

            console.info("打卡成功!")
            return `考勤打卡:${getCurrentTime()}打卡·成功\n但未收到成功消息`
        }
        const e = `重试${this.RETRY}次,打卡失败!`
        console.error(e)
        return e
    }

    /**
     * @param {number} [retry=this.DELAY] 延时打卡，默认为config中的DELAY
     */
    openAndPunchIn(delay: number = this.DELAY) {
        console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
        console.log("开始打卡")
        backHome(this.PACKAGE_ID_LIST.HOME)
        holdOn(delay)
        if (!this.open()) {
            const e = "无法打开钉钉!"
            console.error(e)
            return e
        }
        const r = this.punchIn()
        backHome(this.PACKAGE_ID_LIST.HOME)
        return r
    }
}
