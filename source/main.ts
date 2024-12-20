import { includes, isEmpty, join } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { formatPauseInfo, delay, onlyRunOneScript, pauseStatus, changePause, Msgs, formatInfo } from "@/tools"
;(function main() {
  //初始化脚本
  onlyRunOneScript() //停止其他脚本，只运行当前脚本
  setScreenMetrics(device.width, device.height)
  auto()
  shell("", true)
  console.log("完成初始化脚本")
  let t: org.autojs.autojs.core.looper.TimerThread
  let k: org.autojs.autojs.core.looper.TimerThread

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
      phone.doIt(cfg, () => {
        const default_msg = ["帮助: 显示所有指令内容", "打卡: 马上打卡", "锁屏: 停止当前动作后锁屏", "{n}暂停{m}: 延迟{n}次,暂停{m}次", "恢复: 恢复自动打卡"]

        const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? [] : pauseStatus(cfg.pause)
        const msg = [...default_msg, ...pause_tatus]
        qq.openAndSendMsg(msg)
      })
      return
    }
    if (n.getText() === "打卡") {
      phone.doIt(cfg, () => {
        const msg = dd.openAndPunchIn()
        qq.openAndSendMsg(msg)
      })
      return
    }

    if (includes(n.getText(), "暂停")) {
      phone.doIt(cfg, () => {
        cfg.pause = formatPauseInfo(n.getText())
        const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? ["暂停0次, 恢复定时打卡"] : pauseStatus(cfg.pause)
        const msg = pause_tatus
        qq.openAndSendMsg(msg)
      })
      return
    }

    if (n.getText() === "恢复") {
      phone.doIt(cfg, () => {
        cfg.pause = [0, 0]
        const msg = ["恢复定时打卡成功"]
        qq.openAndSendMsg(msg)
      })
      return
    }

    if (n.getText() === "锁屏") {
      phone.doIt(cfg, () => {
        const msg = ["已停止当前动作", ...pauseStatus(cfg.pause)]
        qq.openAndSendMsg(msg)
      })
      return
    }

    if (n.getText() === "测试") {
      console.info("测试")

      cfg.info = ["123123123123123123123"]
      if (cfg.thread?.isAlive()) {
        console.log("alive")
        const old_thread = cfg.thread
        if (isEmpty(cfg.info)) return
        phone.doIt(
          cfg,
          () => {
            for (let a = 0; a < 5; a++) {
              console.log(a)
              sleep(1000)
            }
          },
          () => {
            old_thread?.join(0)
            if (isEmpty(cfg.info)) return true
            return false
          },
          false
        )
      } else {
        phone.doIt(cfg, () => {
          for (let a = 0; a < 5; a++) {
            console.log(a)
            sleep(1000)
          }
        })
      }

      // t.interrupt()
      // if (t.isAlive() && c) t.interrupt()

      return
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
    // if (n.getText() !== "闹钟") return
    // if (n.when === 0) return
    clock.closeAlarm(cfg.root)

    phone.doIt(cfg, () => {
      let msg: Msgs
      const daka = cfg.pause[0] > 0 || cfg.pause[1] === 0 ? true : false //执行打卡操作，或者直接输出现在状态
      cfg.pause = changePause(cfg.pause) //修改pause参数
      const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? ["! 暂停打卡结束 !"] : pauseStatus(cfg.pause)
      if (daka) {
        delay(cfg.DELAY) //随机延迟打卡
        msg = dd.openAndPunchIn()
      } else msg = pause_tatus

      qq.openAndSendMsg(msg)
    })
    return
  }

  function listenDD(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
    if (includes(n.getText(), "考勤打卡")) return

    cfg.info.push(formatInfo(n))
    if (cfg.thread?.isAlive()) {
      console.log("alive")
      const old_thread = cfg.thread
      if (isEmpty(cfg.info)) return
      phone.doIt(
        cfg,
        () => qq.openAndSendMsg(cfg.info),
        () => {
          old_thread?.join(0)
          if (isEmpty(cfg.info)) return true
          return false
        },
        false
      )
    } else phone.doIt(cfg, () => qq.openAndSendMsg(cfg.info))

    // if (cfg.thread?.isAlive()) {
    //   console.log("alive")
    //   const old_thread = cfg.thread
    //   if (isEmpty(cfg.info)) return
    //   cfg.thread = threads.start(() => {})
    // }
    return
  }
})()
