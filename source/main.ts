import {  includes, } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import {  calculateDay } from "@/tools"
;(function main() {
    //停止其他脚本 ，只运行当前脚本
    engines.all().map((ScriptEngine) => {
        if (engines.myEngine().toString() !== ScriptEngine.toString()) {
            ScriptEngine.forceStop()
        }
    })

    auto()
    // VolumeDown()
    shell("", true)
    const config = new Config()
    const cfg = config.createJsonFile()
    config.createLog()
    config.information(cfg)

    const qq = new QQ(cfg)
    const dd = new DD(cfg)
    const clock = new Clock(cfg)
    const phone = new Phone(cfg)
    const listener = new Listener(cfg)
    listener.listenVolumeKey()
    listener.listenNotification((notification) => {
        listenQQ(notification)
        listenClock(notification)
        listenDD(notification)
    })

    function listenQQ(n: org.autojs.autojs.core.notification.Notification) {
        // if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.EMAIL) return

        if (n.getText() === "帮助") {
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg(
                    `帮助: 显示所有指令内容\n打卡: 马上打卡\n锁屏: 停止当前动作后锁屏\n恢复: 恢复自动打卡\n暂停{m=1}: 停止自动打卡{m}次\n-----------------------------\n目前剩余: ${
                        cfg.suspend.count / 2
                    }天\n-----------------------------`
                )
                phone.turnOff()
            })
            return
        }
        if (n.getText() === "打卡") {
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                cfg.msg = dd.openAndPunchIn(-1)
                qq.openAndSendMsg(cfg.msg)
                phone.turnOff()
            })
            return
        }
        if (includes(n.getText(), "暂停")) {
            cfg.suspend.count = calculateDay(n.getText())

            const msg = `*已暂停定时打卡*\n剩余${cfg.suspend.count}次\n${cfg.suspend.count / 2}天`
            console.info(`暂停定时打卡${cfg.suspend.count}次`)

            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg(msg)
                phone.turnOff()
            })
            return
        }
        if (n.getText() === "恢复") {
            cfg.suspend.count = 0
            console.info("恢复定时打卡")
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg("修改成功, 已恢复定时打卡功能")
                phone.turnOff()
            })
            return
        }
        if (n.getText() === "锁屏") {
            console.info("停止当前动作")
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg("已停止当前动作")
                phone.turnOff()
            })
            return
        }
    }

    function listenClock(n: org.autojs.autojs.core.notification.Notification) {
        if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
        if (cfg.suspend.count > 0) {
            cfg.suspend.count -= 1
            console.warn("已暂停定时打卡! 剩余次数:" + cfg.suspend.count)
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg(`*定时打卡已暂停*\n剩余${cfg.suspend.count}次\n${cfg.suspend.count / 2}天`)
                phone.turnOff()
            })
            return
        }

        clock.closeAlarm()

        threads.shutDownAll()
        threads.start(() => {
            phone.turnOn()
            cfg.msg = dd.openAndPunchIn()
            qq.openAndSendMsg(cfg.msg)
            phone.turnOff()
        })
    }

    function listenDD(n: org.autojs.autojs.core.notification.Notification) {
        if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
        if (!includes(n.getText(), "考勤打卡")) return
        cfg.msg = n.getText().replace(/^\[.+?\]/, "")

        setTimeout(() => {
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg(cfg.msg)
                phone.turnOff()
            })
        }, 1000) //等待，这样可以打断锁屏，并且让console.log()输出完整

        return
    }
})()
