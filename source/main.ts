import { includes } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { calculateCount, formatSuspendInfo, onlyRunOneScript, showStatus } from "@/tools"
;(function main() {
  //停止其他脚本 ，只运行当前脚本
  onlyRunOneScript()

  auto()
  shell("", true)
  const config = new Config()
  const cfg = config.createJsonFile()
  config.createLog()
  config.information(cfg)

  const phone = new Phone(cfg)
  const listener = new Listener(cfg)
  const qq = new QQ(cfg)
  const dd = new DD(cfg)
  const clock = new Clock(cfg)
  listener.listenVolumeKey() //可以添加自己需要的调试函数
  listener.listenNotification((notification) => {
    listenMsg(notification)
    listenClock(notification)
    listenDD(notification)
  })

  function listenMsg(n: org.autojs.autojs.core.notification.Notification) {
    // if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.EMAIL && n.getPackageName() !== cfg.PACKAGE_ID_LIST.QQ) return
    if (n.getText() === "帮助") {
      const msg =
        "帮助: 显示所有指令内容\n打卡: 马上打卡\n锁屏: 停止当前动作后锁屏\n{n}暂停{m}: 延迟{n}次,暂停{m}次\n恢复: 恢复自动打卡\n状态: 显示当前状态" +
        "\n" +
        showStatus(cfg.suspend)

      phone.doIt(() => {
        qq.openAndSendMsg(msg)
      })
      return
    }
    if (n.getText() === "打卡") {
      phone.doIt(() => {
        const msg = dd.openAndPunchIn() + "\n" + showStatus(cfg.suspend)
        qq.openAndSendMsg(msg)
      })
      return
    }
    if (n.getText() === "状态") {
      const msg = showStatus(cfg.suspend)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
      })
    }
    if (includes(n.getText(), "暂停")) {
      const arr = formatSuspendInfo(n.getText()) //先把输入的字符串格式化成array<number>
      let msg = "暂停不能为0" + "\n" + showStatus(cfg.suspend)
      if (arr[1] !== 0) {
        cfg.suspend = calculateCount(arr)
        msg = showStatus(cfg.suspend)
      }
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
      })
      return
    }

    if (n.getText() === "恢复") {
      cfg.suspend = { after: 0, count: 0 }
      console.info("恢复定时打卡")
      const msg = "修改成功, 已恢复定时打卡功能" + "\n" + showStatus(cfg.suspend)
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
      })
      return
    }

    if (n.getText() === "锁屏") {
      const msg = "已停止当前动作" + "\n" + showStatus(cfg.suspend)
      console.info("停止当前动作")
      phone.doIt(() => {
        qq.openAndSendMsg(msg)
      })
      return
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
    if (n.getText() !== "闹钟") return
    if (n.when === 0) return

    let msg = "! 暂停打卡结束 !"
    let daka: boolean //执行打卡操作，或者直接输出现在状态
    if (cfg.suspend.after > 0 || cfg.suspend.count === 0) daka = true

    if (cfg.suspend.after > 0) cfg.suspend.after -= 1 //如果有延迟打卡， 延迟打卡减1次
    else if (cfg.suspend.count > 0) cfg.suspend.count = cfg.suspend.count -= 1 //如果没有延迟打卡次数，且有暂停打卡次数， 暂停打卡减1次
    // clock.closeAlarm() //关闭闹钟
    phone.doIt(() => {
      if (daka) msg = dd.openAndPunchIn() + "\n" + showStatus(cfg.suspend)
      else msg = msg + "\n" + showStatus(cfg.suspend)
      qq.openAndSendMsg(msg)
    })
    return
  }

  function listenDD(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
    if (!includes(n.getText(), "考勤打卡")) return
    cfg.msg = n.getText().replace(/^\[.+?\]/, "")
    const msg = cfg.msg + "\n" + showStatus(cfg.suspend)

    phone.doIt(() => {
      qq.openAndSendMsg(msg)
    }, cfg.DELAY) //随机延迟打卡
    return
  }
})()
