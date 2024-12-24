# dingding

## 介绍

打卡

- MI 9 MIUI 10 9.8.2 开发版

适用版本：

- [autox](https://github.com/kkevsekk1/AutoX)
  - 6.4.3 稳定 可以打包
  - 6.5.8 未测试 但应该是可以用的
  - **6.6.0** 稳定，兼容小米权限设置
  - 6.6.7 测试中，无法打包 app，使用应该是没问题的
- 钉钉 [7.0.42.11](https://github.com/zsjsll/js_dingding/releases/download/0.0.1/dingding-7.0.42.11-1068.apk)
- TIM
  - [3.5.6](https://github.com/zsjsll/js_dingding/releases/download/0.0.1/TIM-3.5.6-lspatched.apk) 只支持华为的推送服务
  - [4.0.95](https://github.com/zsjsll/js_dingding/releases/download/0.0.1/TIM-4.0.95-4008.apk) 最新的版本支持了其他手机的推送服务
  - 4.0.98

本项目使用 typescript

### 手机设置

- 取消锁屏界面
- 熄屏时间 5min
- 闹钟

### 使用

`pnpm i`

`pnpm add -g @swc/cli @swc/core`

### 打包

`pnpm run build`

打包文件存放于 `dist/`

### ps

使用时，会自动生成 config.json 根据需要自行修改。

TIM 要发送的人的 qq 必须在消息的第一个（置顶）。

仅研究学习使用。
