import { Cfg } from "@/config"
import { getCurrentDate, getStorageData, setStorageData } from "@/tools"

export type BASE_CONFIG = {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID?: string
}

export class Init {
    cfg: Cfg
    db_name: string
    constructor(cfg: Cfg, db_name: string) {
        this.cfg = cfg
        this.db_name = db_name
    }

    setConfig() {
        let account = getStorageData(this.db_name, "ACCOUNT")
        let passwd = getStorageData(this.db_name, "PASSWD")
        let qq = getStorageData(this.db_name, "QQ")
        let corp_id = getStorageData(this.db_name, "CORP_ID")

        const saveBaseData = () => {
            account = dialogs.rawInput("输入钉钉账号", account) ?? ""
            setStorageData(this.db_name, "ACCOUNT", account)
            passwd = dialogs.rawInput("输入钉钉密码", passwd) ?? ""
            setStorageData(this.db_name, "PASSWD", passwd)
            qq = dialogs.rawInput("输入QQ号", qq) ?? ""
            setStorageData(this.db_name, "QQ", qq)
            corp_id = dialogs.rawInput("输入钉钉corp_id(多个公司填写)", corp_id) ?? ""
            setStorageData(this.db_name, "CORP_ID", corp_id)
        }

        if (account && passwd && qq) {
            const lock = threads.lock()
            const chose = lock.newCondition()
            let c: boolean = false
            const d = dialogs.build({
                title: "是否重置信息?",
                content: "3秒后自动跳过",
                positive: "是",
                cancelable: false,
                canceledOnTouchOutside: false,
            })
            d.on("positive", () => {
                c = true
                lock.lock()
                chose.signal()
                lock.unlock()
            })

            d.show()
            threads.start(() => {
                sleep(3000)
                d.dismiss()
                lock.lock()
                chose.signal()
                lock.unlock()
            })
            lock.lock()
            chose.await()
            lock.unlock()
            if (c) saveBaseData()
        } else saveBaseData()
        this.cfg.ACCOUNT = account
        this.cfg.PASSWD = passwd
        this.cfg.QQ = qq
        this.cfg.CORP_ID = corp_id

        return this.cfg
    }
    setlog() {
        auto()
        // 创建运行日志
        const log = files.join(this.cfg.GLOBAL_LOG_FILE_DIR, `${getCurrentDate()}.log`)
        console.setGlobalLogConfig({ file: log })
    }
}

// TODO
