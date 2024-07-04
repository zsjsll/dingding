import { includes } from "lodash"
import { QQ, DD, Clock } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { calculateCount, formatSuspendInfo, status } from "@/tools"
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
            const msg =
                "帮助: 显示所有指令内容\n打卡: 马上打卡\n锁屏: 停止当前动作后锁屏\n{n}暂停{m}: 延迟{n}次,暂停{m}次\n恢复: 恢复自动打卡\n状态: 显示当前状态" +
                "\n" +
                status(cfg.suspend)

            phone.doIt(() => {
                qq.openAndSendMsg(msg)
            })
            return
        }
        if (n.getText() === "打卡") {
            phone.doIt(() => {
                cfg.msg = dd.openAndPunchIn(-1)
                const msg = cfg.msg + "\n" + status(cfg.suspend)
                qq.openAndSendMsg(msg)
            })
            return
        }
        if (n.getText() === "状态") {
            const msg = status(cfg.suspend)
            phone.doIt(() => {
                qq.openAndSendMsg(msg)
            })
        }
        if (includes(n.getText(), "暂停")) {
            const arr = formatSuspendInfo(n.getText()) //先把输入的字符串格式化成array<number>
            let msg = "暂停次数不能为0, 请重新设置!"
            if (arr[1] === 0) console.info(msg)
            else {
                cfg.suspend = calculateCount(arr)
                msg = status(cfg.suspend)
                console.info(msg)
            }

            phone.doIt(() => {
                qq.openAndSendMsg(msg)
            })
            return
        }

        if (n.getText() === "恢复") {
            cfg.suspend = { after: 0, count: 0 }
            console.info("恢复定时打卡")
            const msg = "修改成功, 已恢复定时打卡功能" + "\n" + status(cfg.suspend)
            phone.doIt(() => {
                qq.openAndSendMsg(msg)
            })
            return
        }

        if (n.getText() === "锁屏") {
            const msg = "已停止当前动作" + "\n" + status(cfg.suspend)
            console.info("停止当前动作")
            phone.doIt(() => {
                qq.openAndSendMsg(msg)
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

        phone.doIt(() => {
            cfg.msg = dd.openAndPunchIn()
            const msg = cfg.msg + "\n" + status(cfg.suspend)
            qq.openAndSendMsg(msg)
        })
        return
    }

    function listenDD(n: org.autojs.autojs.core.notification.Notification) {
        if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
        if (!includes(n.getText(), "考勤打卡")) return
        cfg.msg = n.getText().replace(/^\[.+?\]/, "")
        const msg = cfg.msg + "\n" + status(cfg.suspend)

        phone.doIt(() => {
            qq.openAndSendMsg(msg)
        }, 1000) //等待，这样可以打断锁屏，并且让console.log()输出完整
        return
    }
})()
