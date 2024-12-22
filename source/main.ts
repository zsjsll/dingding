import { includes, isEmpty } from "lodash"
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

  //构造默认函数
  const sendMsg = (final_msg: Msgs) => {
    qq.openAndSendMsg(final_msg)
    cfg.info = []
    if (isEmpty(cfg.info)) return phone.next
    else return phone.exit
  }

  function listenMsg(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getText() === "帮助") {
      threads.shutDownAll()
      const default_msg = ["帮助: 显示所有指令内容", "打卡: 马上打卡", "锁屏: 停止当前动作后锁屏", "{n}暂停{m}: 延迟{n}次,暂停{m}次", "恢复: 恢复自动打卡"]
      const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? [] : pauseStatus(cfg.pause)
      const msg = [...default_msg, ...pause_tatus]
      cfg.thread = phone.doIt(() => sendMsg(msg))

      return
    }

    if (n.getText() === "打卡") {
      threads.shutDownAll()
      cfg.thread = phone.doIt(() => sendMsg(dd.openAndPunchIn()))
      return
    }

    if (includes(n.getText(), "暂停")) {
      threads.shutDownAll()
      cfg.pause = formatPauseInfo(n.getText())
      const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? ["暂停0次, 恢复定时打卡"] : pauseStatus(cfg.pause)
      cfg.thread = phone.doIt(() => sendMsg(pause_tatus))
      return
    }

    if (n.getText() === "恢复") {
      threads.shutDownAll()
      cfg.pause = [0, 0]
      const msg = ["恢复定时打卡成功"]
      cfg.thread = phone.doIt(() => sendMsg(msg))
      return
    }

    if (n.getText() === "锁屏") {
      threads.shutDownAll()
      const msg = ["已停止当前动作", ...pauseStatus(cfg.pause)]
      cfg.thread = phone.doIt(() => sendMsg(msg))
      return
    }

    if (n.getText() === "测试") {
      console.info("测试")
      const t = threads.start(() => {
        for (let i = 0; i < 10; i++) {
          console.log(i)
          sleep(500)
        }
      })
      threads.start(() => {
        console.log("开机")
        t.join(0)

        for (let i = 10; i > 10; i--) {
          console.log(i)
          sleep(500)
        }
      })
      return
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
    // if (n.getText() !== "闹钟") return
    // if (n.when === 0) return
    clock.closeAlarm(cfg.ROOT)
    threads.shutDownAll()
    let msg: Msgs
    const daka = cfg.pause[0] > 0 || cfg.pause[1] === 0 ? true : false //执行打卡操作，或者直接输出现在状态
    cfg.pause = changePause(cfg.pause) //修改pause参数
    const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? ["! 暂停打卡结束 !"] : pauseStatus(cfg.pause)
    cfg.thread = phone.doIt(() => {
      if (daka) {
        delay(cfg.DELAY) //随机延迟打卡
        msg = dd.openAndPunchIn()
      } else msg = pause_tatus
      return sendMsg(msg)
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
      //FIX 这个地方有问题，不能在线程的中间join进去，这样会导致2个线程同时执行
      cfg.thread = phone.doIt(() => {
        old_thread?.join(0)
        if (isEmpty(cfg.info)) return phone.exit
        return sendMsg(cfg.info)
      })
    } else cfg.thread = phone.doIt(() => sendMsg(cfg.info))

    // if (cfg.thread?.isAlive()) {
    //   console.log("alive")
    //   const old_thread = cfg.thread
    //   if (isEmpty(cfg.info)) return
    //   cfg.thread = threads.start(() => {})
    // }
    return
  }
})()
