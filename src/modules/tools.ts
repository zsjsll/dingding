import { every, floor, head, includes, isEmpty, last, parseInt, some, toNumber } from "lodash"
import moment from "moment"
import { SwipeScreen, Delay, Pause, AppPackages, Info, BlackListOptions, FilterStates, Package } from "@/types"

// -----------以下函数需要root权限-----------------

export const system = {
  swipeScreen,
  closeScreen,
  isRoot,
  openWifi,
  resetPhone,
  backHome,
  openApp,
  brightScreen,
  isDeviceLocked,
  setVolume,
}

function swipeScreen(opt: SwipeScreen, root: boolean) {
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

function closeScreen(root: boolean) {
  device.cancelKeepingAwake() // 取消设备常亮
  // if (isRoot()) shell("input keyevent 26", true)
  if (root) Power()
  else if (parseInt(device.release) > 9) lockScreen()
  else {
    // console.error("root手机或者提升系统版本9.0以上，还不行的话换手机或者想想其他办法吧！")
  }

  sleep(1e3)
}

function isRoot() {
  return !shell("su -v").code
}

function openWifi(root: boolean) {
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

function resetPhone() {
  // device.setBrightnessMode(1) // 自动亮度模式
  device.setBrightness(600)
  device.cancelKeepingAwake() // 取消设备常亮
}

function backHome(home_id: string) {
  for (let i = 0; i < 10; i++) {
    if (currentPackage() === home_id) break
    back()
    sleep(200)
  }
  // 再点击home键
  home()
  sleep(1e3)
}

function openApp(package_id: string) {
  app.launchPackage(package_id)
  return !!packageName(package_id).findOne(20e3)
}

function brightScreen(brightness: number) {
  device.wakeUpIfNeeded() // 唤醒设备
  if (brightness >= 0) {
    device.keepScreenOn() // 保持亮屏
    device.setBrightnessMode(0) // 手动亮度模式
    device.setBrightness(brightness)
  }
  device.cancelVibration() //取消震动

  return !!device.isScreenOn()
}

function isDeviceLocked() {
  importClass(android.app.KeyguardManager)
  importClass(android.content.Context)
  const km = context.getSystemService(Context.KEYGUARD_SERVICE)
  return km.isKeyguardLocked()
}

function setVolume(volume: number) {
  device.setMusicVolume(volume)
  device.setNotificationVolume(volume)
  device.setAlarmVolume(volume)
}

function reloadScript() {
  const exec_path: string = engines.myEngine().getSource().toString()
  engines.execScriptFile(exec_path)
}

function onlyRunOneScript() {
  engines.all().map((ScriptEngine) => {
    if (engines.myEngine().toString() !== ScriptEngine.toString()) {
      ScriptEngine.forceStop()
    }
  })
}

function delay([min, max]: Delay = [0, 0]) {
  if (max <= 0 || min >= max) {
    return
  } else {
    const randomTime = random(min * 1e3, max * 1e3)
    toastLog(Math.floor(randomTime / 1000) + "秒后启动程序" + "...")
    sleep(randomTime)
  }
}

function isDrop(filter_switch = true, info: Info, app_packages: AppPackages): FilterStates {
  const filterBlackList = (text: string, black_list: BlackListOptions): FilterStates => {
    if (isEmpty(black_list?.keywords)) {
      console.warn("√ 放行，黑名单为空")
      return FilterStates.pass
    }
    const ct = every(black_list?.keywords, (kw) => includes(text, kw))
    if (ct) {
      if (isEmpty(black_list?.except)) {
        console.error("× 丢弃，黑名单 √")
        return FilterStates.drop
      }
      for (const except of black_list.except as string[]) {
        if (includes(text, except)) {
          console.warn("√ 放行，黑名单 √，排除名单 √")
          return FilterStates.pass
        }
      }
      console.error("× 丢弃，黑名单 √，排除名单 ×")
      return FilterStates.drop
    }
    return FilterStates.continue
  }

  if (!filter_switch) {
    console.warn("√ 放行，已关闭过滤")
    return FilterStates.pass
  }
  // 先过滤包id
  let is_in_packages = false
  for (const app_package of Object.values(app_packages) as Package[]) {
    if (app_package.NAME === info.PACKAGENAME) {
      if (isEmpty(app_package.BLACKLISTS)) {
        console.warn("√ 放行，没有黑名单")
        return FilterStates.pass
      }
      is_in_packages = true

      for (const black_list of app_package.BLACKLISTS as BlackListOptions[]) {
        console.log(black_list)

        const r = filterBlackList(info.TEXT, black_list)
        if (r !== FilterStates.continue) {
          return r
        }
      }
    }
  }
  if (is_in_packages) {
    console.error("√ 放行，在包中")
    return FilterStates.pass
  }
  console.error("× 丢弃，不在包中")
  return FilterStates.drop
}

function setStorageData(name: string, key: string, value: unknown) {
  const storage = storages.create(name) // 创建storage对象
  value ??= ""
  storage.put(key, value)
}

function getStorageData(name: string, key: string) {
  const storage = storages.create(name)
  if (storage.contains(key)) {
    return storage.get(key, "")
  }
  // 默认返回undefined
}

function formatTime(style: string, timestamp?: number) {
  if (timestamp) return moment(timestamp).format(style)
  else return moment().format(style)
}

function formatPauseInput(input: string): Pause {
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

const line = "-----------------------------"
const wn = "!+!+!+!+!+!+!+!+!+!+!+!+!+!+!"

function pauseStatus(pause: Pause) {
  if (pause !== undefined) {
    const [after, count] = pause
    if (count === 0) return []
    else if (after !== 0) return [line, "# 暂停设置 #", `延迟: ${after}次  ( ${after / 2}天 )`, `暂停: ${count}次  ( ${count / 2}天 )`, line]
    else return [line, "* 暂停开始 *", `剩余: ${count}次  ( ${count / 2}天 )`, line]
  }
  return ["好像出错了"]
}

function changePause(pause: Pause) {
  if (pause[0] > 0) pause[0] -= 1 //如果有延迟打卡， 延迟打卡减1次
  else if (pause[1] > 0) pause[1] -= 1 //如果没有延迟打卡次数，且有暂停打卡次数， 暂停打卡减1次
  return pause
}

function formatNotification(n: org.autojs.autojs.core.notification.Notification): string {
  const text = n.getText().replace(/^\[\d+条\]\s*/g, "") //去除前面的 [number条]
  const msgs = `${formatTime("HH:mm")} ${n.getTitle()}: ${text}`
  return msgs
}

function formatMsgs(msgs: string[]): string {
  const base_msgs = `\n当前电量: ${device.getBattery()}%\n是否充电: ${device.isCharging()}`
  const findSomething = (list: string[], val: string) => some(list, (v) => includes(v, val))
  const del_head_line = head(msgs) === line || head(msgs) === "\n"
  const del_last_line = last(msgs) === "\n"
  const add_warn = findSomething(msgs, "无效") || findSomething(msgs, "失败")
  if (del_head_line) msgs.shift()
  if (del_last_line) msgs.pop()
  if (add_warn) msgs.unshift(wn)
  return [...msgs, base_msgs].join("\n")

  // message = message.replace(/^[\n-]+|[\n]+$/g, "") //如果开头有很多的-或者\n，则去掉  如果结尾有\n 去除
}

export const script = {
  reloadScript,
  onlyRunOneScript,
  delay,
  isDrop,
  setStorageData,
  getStorageData,
  formatTime,
  formatPauseInput,
  pauseStatus,
  changePause,
  formatNotification,
  formatMsgs,
}
