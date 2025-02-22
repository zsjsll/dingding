/**
 * 需要Android 9以上,
 * 模拟按键 电源键 锁屏
 *
 * @return {*}  {boolean}
 */
declare function lockScreen(): boolean

declare interface RootAutomator {
  exit(): void
}
declare namespace Internal {
  interface Engines {
    execScriptFile(path: string): void
  }
}

/**
 * 需要Android 12以上
 *
 * @return {*}  {boolean}
 */
declare function keyCodeHeadsetHook(): boolean
