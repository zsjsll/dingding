import { includes } from "lodash"

export function backHome(home_id: string) {
    for (let i = 0; i < 10; i++) {
        if (currentPackage() === home_id) {
            sleep(1e3)
            return
        }
        back()
        sleep(200)
    }
    // 再点击home键
    home()
    sleep(1e3)
    return
}

export function openApp(package_id: string) {
    app.launchPackage(package_id)
    if (packageName(package_id).findOne(20e3) === null) return false
    else return true
}

function formatDateDigit(num: number) {
    return num < 10 ? "0" + num.toString() : num.toString()
}

export function getCurrentTime() {
    const currentDate = new Date()
    const hours = formatDateDigit(currentDate.getHours())
    const minute = formatDateDigit(currentDate.getMinutes())
    // let second = formatDateDigit(currentDate.getSeconds())
    const formattedTimeString = hours + ":" + minute
    return formattedTimeString
}

export function getCurrentDate() {
    const WEEK_DAY = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
    const currentDate = new Date()
    const year = formatDateDigit(currentDate.getFullYear())
    const month = formatDateDigit(currentDate.getMonth() + 1)
    const date = formatDateDigit(currentDate.getDate())
    const week = currentDate.getDay()
    const formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
    return formattedDateString
}

/**
 * @export
 * @param {number} delay 小于等于0的时候，没有延时
 * @param {number} [limit=0.5] 最少等0.5分钟（30s）
 */
export function holdOn(delay: number, limit: number = 0.5) {
    if (delay <= 0) {
        return
    } else {
        const randomTime = random(limit * 1e3 * 60, delay * 1e3 * 60)
        toastLog(Math.floor(randomTime / 1000) + "秒后启动程序" + "...")
        sleep(randomTime)
    }
}

export function brightScreen(brightness: number) {
    device.wakeUpIfNeeded() // 唤醒设备
    if (brightness >= 0) {
        device.keepScreenOn() // 保持亮屏
        device.setBrightnessMode(0) // 手动亮度模式
        device.setBrightness(brightness)
    }
    device.cancelVibration() //取消震动

    return device.isScreenOn() ? true : false
}

export function isDeviceLocked() {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    const km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
}

export type UnLockScreen = {
    TIME: number
    START: number
    END: number
}

export function openScreen(opt: UnLockScreen) {
    gesture(
        opt.TIME, // 滑动时间：毫秒 320
        [
            device.width * 0.5, // 滑动起点 x 坐标：屏幕宽度的一半
            device.height * opt.START, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些
        ],
        [
            device.width * 0.5, // 滑动终点 x 坐标：屏幕宽度的一半
            device.height * opt.END, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置
        ]
    )

    sleep(1e3) // 等待解锁动画完成
}

export function setVolume(volume: number) {
    device.setMusicVolume(volume)
    device.setNotificationVolume(volume)
    device.setAlarmVolume(volume)
}

export function resetPhone() {
    device.setBrightness(50)
    device.setBrightnessMode(1) // 自动亮度模式
    device.cancelKeepingAwake() // 取消设备常亮
}

export function closeScreen() {
    device.cancelKeepingAwake() // 取消设备常亮
    // if (isRoot()) shell("input keyevent 26", true)
    if (isRoot()) Power()
    else if (parseInt(device.release) > 9) lockScreen()
    sleep(2e3)
}

function isRoot() {
    return shell("su -v").code === 0 ? true : false
}

export type White_list = {
    [k: string]: string
}
export function inWhiteList(filter_switch: boolean = true, white_list: White_list, package_name: string) {
    if (filter_switch === false) {
        console.log("放行")
        return true
    }
    const r = includes(white_list, package_name)
    if (r) console.info("放行")
    else console.info("丢弃")
    return r
}

export function setStorageData(name: string, key: string, value: unknown) {
    const storage = storages.create(name) // 创建storage对象
    value ??= ""
    storage.put(key, value)
}

export function getStorageData(name: string, key: string) {
    const storage = storages.create(name)
    if (storage.contains(key)) {
        return storage.get(key, "")
    }
    // 默认返回undefined
}
