import { backHome, openApp, getCurrentDate, getCurrentTime, swipeScreen, UnLockScreen as SwipeScreen, Msgs, formatMsgsToString } from "@/tools"
import { Cfg } from "./config"
import { startsWith } from "lodash"

export type QQCfg = {
  PACKAGE_ID_LIST: QQ_Package_Id_List
  QQ: string
}

type QQ_Package_Id_List = {
  QQ: string
  HOME: string
}

export class QQ implements QQCfg {
  PACKAGE_ID_LIST: QQ_Package_Id_List
  QQ: string

  constructor(cfg: Cfg) {
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
    this.QQ = cfg.QQ
  }

  private open() {
    return openApp(this.PACKAGE_ID_LIST.QQ)
  }
  private chat() {
    // 最新的tim和qq 如果用意图启动，会出错误，所以改成查找控件来进入聊天窗口

    let a: boolean = false
    let b: boolean = false
    sleep(1e3)
    let nav = id("kbi").findOne(2e3)

    if (nav !== null && nav.text() === "消息") a = nav.parent().click()
    else nav = text("消息").boundsInside(0, 2189, device.width, device.height).findOne(2e3) //双保险查找控件

    if (nav !== null && nav.text() === "消息") a = nav.parent().click()
    // else bounds(0, 2189, device.width, device.height).click() //双保险查找控件
    sleep(1e3)
    // const contact = id("n19").indexInParent(1).findOne(10e3).child(0)
    let contact = id("aua").descStartsWith("123_").findOne(2e3)
    if (contact !== null && startsWith(contact.desc(), "123_")) b = contact.click()
    else contact = descStartsWith("123_").boundsInside(0, 351, device.width, 545).findOne(2e3) //双保险查找控件
    if (contact !== null && startsWith(contact.desc(), "123_")) b = contact.click()
    // else bounds(0, 351, device.width, 545).click() //双保险查找控件
    sleep(2e3)
    if (!a || !b) {
      app.startActivity({
        action: "android.intent.action.VIEW",
        data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + this.QQ,
        packageName: this.PACKAGE_ID_LIST.QQ,
      })
    }
    sleep(2e3)
  }

  sendmsg(message: string) {
    const input = id(this.PACKAGE_ID_LIST.QQ + ":id/input").findOne(10e3)

    input.setText(message)

    const send = text("发送").clickable().findOne(10e3)
    sleep(1000)
    send.click()
    console.info("发送成功")
    return true
  }
  openAndSendMsg(message: Msgs) {
    console.log("发送信息")
    backHome(this.PACKAGE_ID_LIST.HOME)
    if (!this.open()) {
      console.error("无法打开QQ!")
      return false
    }
    this.chat() //进入聊天界面

    message = formatMsgsToString(message)

    // if (Array.isArray(message)) message = message.join("\n")
    console.info(message)
    const r = this.sendmsg(message)
    sleep(1e3)
    backHome(this.PACKAGE_ID_LIST.HOME)
    sleep(5e3)
    return r
  }
}

export type DDCfg = {
  PACKAGE_ID_LIST: DD_Package_Id_List
  ACCOUNT: string
  PASSWD: string
  RETRY: number

  CORP_ID: string
}
type DD_Package_Id_List = {
  DD: string
  HOME: string
}

export class DD implements DDCfg {
  constructor(cfg: Cfg) {
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
    this.ACCOUNT = cfg.ACCOUNT
    this.PASSWD = cfg.PASSWD
    this.RETRY = cfg.RETRY
    this.CORP_ID = cfg.CORP_ID
  }

  PACKAGE_ID_LIST: DD_Package_Id_List
  ACCOUNT: string
  PASSWD: string
  RETRY: number
  CORP_ID: string

  private isLogin() {
    if (id(this.PACKAGE_ID_LIST.DD + ":id/cb_privacy").findOne(5e3) !== null) return false
    // else if (id(this.PACKAGE_ID_LIST.DD + ":id/home_app_item").findOne(5e3) !== null) return true
    return true
  }
  // 登录钉钉，如果已经登录，false
  private logining() {
    //是否为新版本的钉钉，如果是，用旧的登录方式
    if (id("tv_more").findOne(2e3) !== null) {
      id("tv_more").findOne(10e3).click()
      sleep(2e3)
      id("ll_rollback_old_login").findOne(10e3).click()
      sleep(2e3)
      console.log("切换登录方式为旧版...")
    }
    sleep(2e3)
    id("et_phone_input").findOne(10e3).setText(this.ACCOUNT)
    sleep(2e3)
    id("et_password").findOne(10e3).setText(this.PASSWD)
    sleep(2e3)
    id("cb_privacy").findOne(10e3).click()
    sleep(2e3)
    id("btn_next").findOne(10e3).click()
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
    if (!this.isLogin()) return false
    const message = id("home_app_item").indexInParent(0).findOne(5e3)
    if (message !== null) message.click()
    else if (packageName(this.PACKAGE_ID_LIST.DD).findOne(2e3) !== null) click(device.width / 10, device.height * 0.95)
    else false
    return true
  }

  private open() {
    for (let index = 1; index <= this.RETRY; index++) {
      console.info(`第${index}次登录...`)
      backHome(this.PACKAGE_ID_LIST.HOME)
      console.log("正在启动" + app.getAppName(this.PACKAGE_ID_LIST.DD) + "...")

      if (!openApp(this.PACKAGE_ID_LIST.DD)) {
        console.warn("启动失败，重新启动...")
        continue
      }

      if (!this.isLogin()) {
        console.log("正在登录...")
        this.logining()
      } else console.log("可能已登录")
      if (this.noUpdate()) console.info("取消更新")
      else console.log("无更新消息")
      sleep(5e3) //如果设置了极速打卡或者蓝牙自动打卡， 会在这段时间完成打卡
      if (this.atAppHome()) return true
      else console.warn("登录失败,重试...")
    }
    console.error(`重试${this.RETRY}次,登录失败!`)
    return false
  }

  private punchIn() {
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
      const btn = text("上班打卡").clickable(true).findOnce() || text("下班打卡").clickable(true).findOnce() || text("迟到打卡").clickable(true).findOnce()
      if (btn === null) {
        click(device.width / 2, device.height * 0.6)
        console.log("点击打卡按钮坐标")
      } else {
        btn.click()
        console.log("按下打卡按钮")
      }
      if (textContains("成功").findOne(15e3) === null) {
        console.warn("打卡无效,也许未到打卡时间!")
        return `考勤打卡:${getCurrentTime()}打卡·无效`
      }
      // return `考勤打卡:${getCurrentTime()}打卡·成功\n但未收到成功消息`
      return `考勤打卡:${getCurrentTime()}打卡·成功`
    }
    const e = `重试${this.RETRY}次,打卡失败!`
    console.error(e)
    return e
  }

  openAndPunchIn() {
    console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
    console.log("开始打卡")
    backHome(this.PACKAGE_ID_LIST.HOME)
    if (!this.open()) {
      const e = "无法打开钉钉!"
      console.error(e)
      return e
    }
    const r = this.punchIn()
    sleep(3e3)
    backHome(this.PACKAGE_ID_LIST.HOME)
    sleep(2e3)
    return r
  }
}

type CLOCK_Package_Id_List = {
  CLOCK: string
  HOME: string
}

export type ClockCfg = {
  PACKAGE_ID_LIST: CLOCK_Package_Id_List
  SWIPESCREEN: SwipeScreen
}

export class Clock implements ClockCfg {
  constructor(cfg: Cfg) {
    this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST

    this.SWIPESCREEN = cfg.SWIPESCREEN
    this.root = cfg.var.root
  }

  PACKAGE_ID_LIST: CLOCK_Package_Id_List

  SWIPESCREEN: SwipeScreen
  root: boolean

  //需要root
  closeAlarm(root: boolean) {
    sleep(2e3)
    if (root) {
      for (let i = 0; i < 10; i++) {
        VolumeDown()
        sleep(1e3)
        if (packageName(this.PACKAGE_ID_LIST.CLOCK).findOne(500) === null) {
          console.log("已闭闹钟")
          return
        } else {
          swipeScreen(this.SWIPESCREEN, true)
          console.warn("通过root权限滑动关闭闹钟，可能未关闭")
          return
        }
      }
    } else {
      swipeScreen(this.SWIPESCREEN, false)
      console.warn("没有root权限，通过滑动关闭闹钟，可能未关闭")
      return
    }

    return //返回的是延时时间
  }
}

type Email_Package_Id_List = {
  EMAIL: string
}

export type EmailCfg = {
  PACKAGE_ID_LIST: Email_Package_Id_List
}
