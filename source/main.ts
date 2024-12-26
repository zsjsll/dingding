import { includes, isEmpty } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { formatPause, delay, onlyRunOneScript, pauseStatus, changePause, formatNotification } from "@/tools"
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
  const sendMsg = (final_msg: string[]) => {
    qq.openAndSendMsg(final_msg)
    cfg.info = []
    if (isEmpty(cfg.info)) return phone.next
    else return phone.exit
  }
// const doIt=(default_msg,info_msg,pause_status_msg)=>{
//   threads.shutDownAll()


// }




  function listenMsg(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getText() === "帮助") {
      threads.shutDownAll()
      const default_msg = ["帮助: 显示所有指令内容", "打卡: 马上打卡", "锁屏: 停止当前动作后锁屏", "{n}暂停{m}: 延迟{n}次,暂停{m}次", "恢复: 恢复自动打卡"]
      const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? [] : pauseStatus(cfg.pause)
      const msg = [...default_msg, ...cfg.info, ...pause_tatus]
      cfg.thread = threads.start(() => {
        phone.turnOn(cfg.ROOT)
        if (sendMsg(msg) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })

      return
    }

    if (n.getText() === "打卡") {
      threads.shutDownAll()
      const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? [] : pauseStatus(cfg.pause)
      cfg.thread = threads.start(() => {
        phone.turnOn(cfg.ROOT)
        const msg = [...dd.openAndPunchIn(), ...cfg.info, ...pause_tatus]
        if (sendMsg(msg) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })
      return
    }

    if (includes(n.getText(), "暂停")) {
      threads.shutDownAll()
      cfg.pause = formatPause(n.getText())
      const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? ["暂停0次, 恢复定时打卡"] : pauseStatus(cfg.pause)
      const msg = [...cfg.info, ...pause_tatus]
      cfg.thread = threads.start(() => {
        phone.turnOn(cfg.ROOT)
        if (sendMsg(msg) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })
      return
    }

    if (n.getText() === "恢复") {
      threads.shutDownAll()
      cfg.pause = [0, 0]
      const msg = ["恢复定时打卡成功"]
      cfg.thread = threads.start(() => {
        phone.turnOn(cfg.ROOT)
        if (sendMsg(msg) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })
      return
    }

    if (n.getText() === "锁屏") {
      threads.shutDownAll()
      const msg = ["已停止当前动作", ...pauseStatus(cfg.pause)]
      cfg.thread = threads.start(() => {
        phone.turnOn(cfg.ROOT)
        if (sendMsg(msg) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })
      return
    }

    if (n.getText() === "测试") {
      console.info("测试")
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
    // if (n.getText() !== "闹钟") return
    // if (n.when === 0) return
    threads.shutDownAll()
    clock.closeAlarm(cfg.ROOT)
    let msg: string[]
    const daka = cfg.pause[0] > 0 || cfg.pause[1] === 0 ? true : false //执行打卡操作，或者直接输出现在状态
    cfg.pause = changePause(cfg.pause) //修改pause参数
    const pause_tatus = isEmpty(pauseStatus(cfg.pause)) ? ["! 暂停打卡结束 !"] : pauseStatus(cfg.pause)

    cfg.thread = threads.start(() => {
      phone.turnOn(cfg.ROOT)
      if (daka) {
        delay(cfg.DELAY) //随机延迟打卡
        msg = dd.openAndPunchIn()
      } else msg = pause_tatus
      if (sendMsg(msg) === phone.exit) return
      phone.turnOff(cfg.ROOT)
    })

    return
  }

  function listenDD(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
    if (includes(n.getText(), "考勤打卡")) return

    cfg.info.push(formatNotification(n))
    if (cfg.thread?.isAlive()) {
      console.log("alive")
      const old_thread = cfg.thread
      if (isEmpty(cfg.info)) return
      cfg.thread = threads.start(() => {
        old_thread?.join(0)
        phone.turnOn(cfg.ROOT)
        if (isEmpty(cfg.info)) return
        if (sendMsg(cfg.info) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })
    } else
      cfg.thread = threads.start(() => {
        phone.turnOn(cfg.ROOT)
        if (sendMsg(cfg.info) === phone.exit) return
        phone.turnOff(cfg.ROOT)
      })

    return
  }
})()
