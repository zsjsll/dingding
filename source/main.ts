import { includes, isEmpty } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { formatPauseInfo, delay, onlyRunOneScript, pauseStatus, formatMsgsToString, changePause, Msgs } from "@/tools"
;(function main() {
  //初始化脚本
  onlyRunOneScript() //停止其他脚本，只运行当前脚本
  setScreenMetrics(device.width, device.height)
  auto()
  shell("", true)
  console.log("完成初始化脚本")

  //初始化设置
  const config = new Config()
  const cfg = config.initCfg()
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
      const default_msg = ["帮助: 显示所有指令内容", "打卡: 马上打卡", "锁屏: 停止当前动作后锁屏", "{n}暂停{m}: 延迟{n}次,暂停{m}次", "恢复: 恢复自动打卡"]

      const pause_tatus = isEmpty(pauseStatus(cfg.var.pause)) ? [] : pauseStatus(cfg.var.pause)
      const msg = [...default_msg, ...pause_tatus]
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.var.info = []
      })
      return
    }
    if (n.getText() === "打卡") {
      phone.doIt(() => {
        const msg = dd.openAndPunchIn()
        qq.openAndSendMsg(msg)
        cfg.var.info = []
      })
      return
    }

    if (includes(n.getText(), "暂停")) {
      cfg.var.pause = formatPauseInfo(n.getText())
      const pause_tatus = isEmpty(pauseStatus(cfg.var.pause)) ? ["暂停0次, 恢复定时打卡"] : pauseStatus(cfg.var.pause)
      const msg = pause_tatus
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.var.info = []
      })
      return
    }

    if (n.getText() === "恢复") {
      cfg.var.pause = [0, 0]
      const msg = ["恢复定时打卡成功"]
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.var.info = []
      })
      return
    }

    if (n.getText() === "锁屏") {
      const msg = ["已停止当前动作", ...pauseStatus(cfg.var.pause)]
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
        cfg.var.info = []
      })
      return
    }

    if (n.getText() === "测试") {
      console.info("测试")
      const lock = threads.lock()
      threads.start(() => {
        lock.lock()
        let k = 50
        while (k > 0) {
          console.log(k)
          k--
        }
        lock.unlock()
      })
      threads.start(() => {
        lock.lock()
        let k = 0
        while (k < 50) {
          console.log(k)
          k++
        }
        lock.unlock()
      })
      console.log(cfg.var.thread)

      return
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
    // if (n.getText() !== "闹钟") return
    // if (n.when === 0) return

    let msg: Msgs = "! 暂停打卡结束 !"

    const daka = cfg.var.pause[0] > 0 || cfg.var.pause[1] === 0 ? true : false //执行打卡操作，或者直接输出现在状态
    cfg.var.pause = changePause(cfg.var.pause) //修改pause参数
    const pause_tatus = isEmpty(pauseStatus(cfg.var.pause)) ? ["! 暂停打卡结束 !"] : pauseStatus(cfg.var.pause)
    clock.closeAlarm() //关闭闹钟

    phone.doIt(() => {
      if (daka) {
        delay(cfg.DELAY) //随机延迟打卡
        msg = dd.openAndPunchIn()
      } else msg = pause_tatus

      qq.openAndSendMsg(msg)
      cfg.var.info = []
    })
    return
  }

  function listenDD(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
    // if (!includes(n.getText(), "考勤打卡")) return
    // cfg.msg = n.getText().replace(/^\[.+?\]/, "")
    // const msg = cfg.msg + "\n" + showStatus(init.pause)
    let msg: string = ""
    if (includes(n.getText(), "考勤打卡")) return
    else {
      cfg.var.info.push(n.getText())
      msg = msg + "\n" + formatMsgsToString(cfg.var.info)
    }

    phone.doIt(() => {
      qq.openAndSendMsg(msg)
      cfg.var.info = []
    })
    return
  }
})()
