import { includes } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { formatSuspendInfo, delay, onlyRunOneScript, suspendStatus, formatMsgs } from "@/tools"
;(function main() {
  //初始化脚本
  onlyRunOneScript() //停止其他脚本，只运行当前脚本
  setScreenMetrics(device.width, device.height)
  auto()
  shell("", true)
  console.log("完成初始化脚本")

  //初始化设置
  const config = new Config()
  const cfg = config.createJsonFile()
  config.createLog()
  config.information(cfg)
  console.log("完成初始化设置")

  const phone = new Phone(cfg)
  const listener = new Listener(cfg)
  const qq = new QQ(cfg)
  const dd = new DD(cfg)
  const clock = new Clock(cfg)
  listener.listenVolumeKey(() => {}) //可以添加自己需要的调试函数
  listener.listenNotification((notification) => {
    listenMsg(notification)
    listenClock(notification)
    listenDD(notification)
  })
  toastLog("运行中。。。")

  function listenMsg(n: org.autojs.autojs.core.notification.Notification) {
    // if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.EMAIL && n.getPackageName() !== cfg.PACKAGE_ID_LIST.QQ) return
    if (n.getText() === "帮助") {
      let msg =
        "帮助: 显示所有指令内容\n打卡: 马上打卡\n锁屏: 停止当前动作后锁屏\n{n}暂停{m}: 延迟{n}次,暂停{m}次\n恢复: 恢复自动打卡\n状态: 显示当前状态" +
        "\n" +
        suspendStatus(cfg.suspend)
      msg = msg + "\n" + formatMsgs(cfg.msgs)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.msgs = []
      })
      return
    }
    if (n.getText() === "打卡") {
      phone.doIt(() => {
        let msg = dd.openAndPunchIn() + "\n" + suspendStatus(cfg.suspend)
        msg = msg + "\n" + formatMsgs(cfg.msgs)
        qq.openAndSendMsg(msg)
        cfg.msgs = []
      })
      return
    }
    if (n.getText() === "状态") {
      let msg = suspendStatus(cfg.suspend)
      msg = msg + "\n" + formatMsgs(cfg.msgs)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.msgs = []
      })
    }
    if (includes(n.getText(), "暂停")) {
      cfg.suspend = formatSuspendInfo(n.getText())
      let msg = "修改成功, 已恢复定时打卡功能" + "\n" + suspendStatus(cfg.suspend)
      if (cfg.suspend.count !== 0) msg = suspendStatus(cfg.suspend)
      msg = msg + "\n" + formatMsgs(cfg.msgs)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.msgs = []
      })
      return
    }

    if (n.getText() === "恢复") {
      cfg.suspend = { after: 0, count: 0 }
      console.info("恢复定时打卡")
      let msg = "修改成功, 已恢复定时打卡功能" + "\n" + suspendStatus(cfg.suspend)
      msg = msg + "\n" + formatMsgs(cfg.msgs)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.msgs = []
      })
      return
    }

    if (n.getText() === "锁屏") {
      let msg = "已停止当前动作" + "\n" + suspendStatus(cfg.suspend)
      console.info("停止当前动作")
      msg = msg + "\n" + formatMsgs(cfg.msgs)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.msgs = []
      })
      return
    }

    if (n.getText() === "测试") {
      console.info("测试")
      console.log(threads.currentThread())
      const t = threads.start(() => {
        console.log(threads.currentThread())
      })
      t.waitFor()
      t.setTimeout(()=>console.log("hahaha")
      , 2000)
      sleep(1000)
      console.log(t.isAlive())


      return
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
    // if (n.getText() !== "闹钟") return
    // if (n.when === 0) return

    let msg = "! 暂停打卡结束 !"
    let daka: boolean = false //执行打卡操作，或者直接输出现在状态
    if (cfg.suspend.after > 0 || cfg.suspend.count === 0) daka = true

    if (cfg.suspend.after > 0) cfg.suspend.after -= 1 //如果有延迟打卡， 延迟打卡减1次
    else if (cfg.suspend.count > 0) cfg.suspend.count = cfg.suspend.count -= 1 //如果没有延迟打卡次数，且有暂停打卡次数， 暂停打卡减1次

    clock.closeAlarm(cfg.root) //关闭闹钟
    phone.doIt(() => {
      if (daka) {
        delay(cfg.DELAY) //随机延迟打卡
        msg = dd.openAndPunchIn() + "\n" + suspendStatus(cfg.suspend)
      } else msg = msg + "\n" + suspendStatus(cfg.suspend)
      msg = msg + "\n" + formatMsgs(cfg.msgs)
      qq.openAndSendMsg(msg)
      cfg.msgs = []
    })
    return
  }

  function listenDD(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
    // if (!includes(n.getText(), "考勤打卡")) return
    // cfg.msg = n.getText().replace(/^\[.+?\]/, "")
    // const msg = cfg.msg + "\n" + showStatus(cfg.suspend)
    let msg: string = ""
    if (includes(n.getText(), "考勤打卡")) return
    else {
      cfg.msgs.push(n.getText())
      msg = msg + "\n" + formatMsgs(cfg.msgs)
    }

    phone.doIt(() => {
      qq.openAndSendMsg(msg)
      cfg.msgs = []
    })
    return
  }
})()
