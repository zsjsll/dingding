import { ceil, floor, includes, parseInt, toNumber } from "lodash"

// -----------以下函数需要root权限-----------------

export function openScreen(opt: UnLockScreen, root: boolean = false) {
  if (root) {
    console.log("roooooooooot")
    // const ra = new RootAutomator()
    // ra.swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END)
    // ra.exit()
    keyCodeHeadsetHook()
    // Swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END, opt.TIME)
  } else {
    // swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END, opt.TIME)
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
  }

  sleep(1e3) // 等待解锁动画完成
}

export function closeScreen(root: boolean) {
  device.cancelKeepingAwake() // 取消设备常亮
  // if (isRoot()) shell("input keyevent 26", true)
  if (root) Power()
  else if (parseInt(device.release) > 9) lockScreen()
  else {
    // console.error("root手机或者提升系统版本9.0以上，还不行的话换手机或者想想其他办法吧！")
  }

  sleep(2e3)
}

export function isRoot() {
  return shell("su -v").code === 0 ? true : false
}

export function openWifi(root: boolean) {
  if (root) {
    const wifi_info = shell("settings get global wifi_on", true)
    if (wifi_info.error !== "") console.error("无法获取wifi信息")
    const r = toNumber(wifi_info.result)
    if (r === 0) {
      console.info("wifi已关闭，正在打开中，等待5s。。。")
      shell("svc wifi enable", true)
      sleep(5e3)
    } else {
      console.log("wifi已打开")
      shell("svc wifi enable", true)
    }
  } else console.warn("没有root，跳过此操作")
}

// -----------以上函数需要root权限-----------------

export function resetPhone() {
  // device.setBrightnessMode(1) // 自动亮度模式
  device.setBrightness(600)
  device.cancelKeepingAwake() // 取消设备常亮
}

export function reloadScript() {
  const exec_path: string = engines.myEngine().getSource().toString()
  engines.execScriptFile(exec_path)
}

export function onlyRunOneScript() {
  engines.all().map((ScriptEngine) => {
    if (engines.myEngine().toString() !== ScriptEngine.toString()) {
      ScriptEngine.forceStop()
    }
  })
}

// --------------------------------------------

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
 * @param {number} [limit=0.5] 最少等0.1分钟（6s）
 */
export function holdOn(delay: number, limit: number = 0.1) {
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

export function setVolume(volume: number) {
  device.setMusicVolume(volume)
  device.setNotificationVolume(volume)
  device.setAlarmVolume(volume)
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

export type Suspend = { after: number; count: number }

/**
 * 输入打卡天数，返回打卡次数
 * 先把str转为数字，整数部分乘以2
 * 小数部分向上取整，相加得到打卡次数
 *
 * @export
 * @param {string} input
 * @return {*}  {number}
 */
export function calculateDay(input: Array<number>): Suspend {
  console.log("input", input)

  const day2Times = (day: number) => floor(day) * 2 + ceil(day % 1) // 天数转换成次数
  const times = input.map(day2Times)
  const after = times[0]
  let count = times[1]
  count ??= 1

  return { after, count }
}
/**
 * 先把str转为数字，丢弃小数部分，返回数字
 *
 * @export
 * @param {string} input
 * @return {*}  {number}
 */
export function calculateCount(input: Array<number>): Suspend {
  const to_int_arr = input.map((v) => floor(v)) // 输入数组向下取整
  const after = to_int_arr[0]
  let count = to_int_arr[1]
  count ??= 1
  // const count = input[1] === undefined ? 1 : input[1]

  return { after, count }
}

export function formatSuspendInfo(input: string) {
  const a = "0" + input
  return a.match(/[\d.]+/g)?.map((v) => toNumber(v)) as number[]
}

export function showStatus(suspend?: Suspend) {
  const battery = device.getBattery()
  const charge = device.isCharging()
  const msg = `当前电量: ${battery}%\n是否充电: ${charge}`
  const line = "-----------------------------\n"
  if (suspend !== undefined) {
    const { after, count } = suspend
    if (after !== 0 && count !== 0) return line + `# 暂停设置 #\n延迟: ${after}次  ( ${after / 2}天 )\n暂停: ${count}次  ( ${count / 2}天 )\n` + line + msg
    else if (after === 0 && count !== 0) return line + `* 暂停开始 *\n剩余: ${count}次  ( ${count / 2}天 )\n` + line + msg
    else if (after !== 0 && count === 0) return `延迟: ${after}次\n暂停: ${count}次\n` + line + msg
    else if (after === 0 && count === 0) return msg
  }
  return msg
}
