import { floor, head, includes, isString, last, parseInt, some, toNumber } from "lodash"

// -----------以下函数需要root权限-----------------

export function swipeScreen(opt: SwipeScreen, root: boolean) {
  if (root) Swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END, opt.TIME)
  else swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END, opt.TIME)
  // gesture(
  //   opt.TIME, // 滑动时间：毫秒 320
  //   [
  //     device.width * 0.5, // 滑动起点 x 坐标：屏幕宽度的一半
  //     device.height * opt.START, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些
  //   ],
  //   [
  //     device.width * 0.5, // 滑动终点 x 坐标：屏幕宽度的一半
  //     device.height * opt.END, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置
  //   ]
  // )

  sleep(1500) // 等待解锁动画完成
}

export function closeScreen(root: boolean) {
  device.cancelKeepingAwake() // 取消设备常亮
  // if (isRoot()) shell("input keyevent 26", true)
  if (root) Power()
  else if (parseInt(device.release) > 9) lockScreen()
  else {
    // console.error("root手机或者提升系统版本9.0以上，还不行的话换手机或者想想其他办法吧！")
  }

  sleep(1e3)
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
    if (currentPackage() === home_id) break
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
  //TODO 可以枚举一下
  const currentDate = new Date()
  const year = formatDateDigit(currentDate.getFullYear())
  const month = formatDateDigit(currentDate.getMonth() + 1)
  const date = formatDateDigit(currentDate.getDate())
  const week = currentDate.getDay()
  const formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
  return formattedDateString
}
// export type Delay = { min: number; max: number }
export type Delay = [number, number]

export function delay([min, max]: Delay = [0, 0]) {
  if (max <= 0 || min >= max) {
    return
  } else {
    const randomTime = random(min * 1e3, max * 1e3)
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

export type SwipeScreen = {
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

export type Pause = [number, number]

export function formatPauseInfo(input: string): Pause {
  input = "0" + input //在字符串前面添加一个0
  //匹配所有数字，包括小数
  const pause = input.match(/[\d.]+/g)?.map((v) => {
    let num = floor(toNumber(v)) //变成数字，向下取整
    if (isNaN(num)) num = 1 //判断NaN，如果是 变成1
    return num
  }) ?? [0, 1]

  pause[1] ??= 1 //默认 暂停1次
  pause[0] = pause[1] === 0 ? 0 : pause[0]

  return [pause[0], pause[1]]
}

export function pauseStatus(pause: Pause) {
  const line = "-----------------------------"
  if (pause !== undefined) {
    const [after, count] = pause
    if (count === 0) return []
    else if (after !== 0) return [line, "# 暂停设置 #", `延迟: ${after}次  ( ${after / 2}天 )`, `暂停: ${count}次  ( ${count / 2}天 )`, line]
    else return [line, "* 暂停开始 *", `剩余: ${count}次  ( ${count / 2}天 )`, line]
  }
  return ["好像出错了"]
}

export function changePause(pause: Pause) {
  if (pause[0] > 0) pause[0] -= 1 //如果有延迟打卡， 延迟打卡减1次
  else if (pause[1] > 0) pause[1] -= 1 //如果没有延迟打卡次数，且有暂停打卡次数， 暂停打卡减1次
  return pause
}

export type Info = Array<string>

export function formatInfo(n: org.autojs.autojs.core.notification.Notification) {
  // const line = "============================="
  return n.getText()
}

export type Msgs = string[] | string
export function formatMsgsToString(msgs: Msgs): string {
  if (isString(msgs)) msgs = [msgs]
  const wn = "!+!+!+!+!+!+!+!+!+!+!+!+!+!+!"
  const base_msgs = [`当前电量: ${device.getBattery()}%`, `是否充电: ${device.isCharging()}`]
  const findSomething = (list: string[], val: string) => some(list, (v) => includes(v, val))
  const del_head_line = includes(head(msgs), "-") || includes(head(msgs), "\n")
  const del_last_line = includes(last(msgs), "\n")
  const add_warn = findSomething(msgs, "无效") || findSomething(msgs, "失败")
  if (del_head_line) msgs.shift()
  if (del_last_line) msgs.pop()
  if (add_warn) msgs.unshift(wn)
  return [...msgs, ...base_msgs].join("\n")

  // message = message.replace(/^[\n-]+|[\n]+$/g, "") //如果开头有很多的-或者\n，则去掉  如果结尾有\n 去除
}
