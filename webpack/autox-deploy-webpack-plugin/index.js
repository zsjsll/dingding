import { posix } from "path"
import { get } from "http"

export default class AutoxDeployPlugin {

  /**
   * @param {string} cmd
   * @param {string} path
   */
  sendCmd(cmd, path) {
    console.error("执行命令：", cmd)
    path = encodeURI(path)
    const req = get("http://127.0.0.1:9317/exec?cmd=" + cmd + "&path=" + path, (res) => {
      res.setEncoding("utf8")
      res
        .on("data", (data) => {
          console.error(data)
        })
        .on("error", () => {
          console.error("返回数据错误")
        })
    })
    req.on("error", () => {
      console.error("watch模式，自动" + cmd + "失败,autox.js服务未启动")
      console.error("请使用 ctrl+shift+p 快捷键，启动auto.js服务")
    })
  }

  opt = { type: undefined, path: undefined }
  /**
   * Creates an instance of AutoxDeployPlugin.
   * @param {object} [options={ type: undefined, path: undefined }]
   * @param {"rerun"|"save"} [options.type=undefined]
   * @param {string} [options.path=undefined]
   * @memberof AutoxDeployPlugin
   */
  constructor(options = this.opt) {
    this.options = options
    this.changFile = undefined
  }

  /**
   * @param {{ hooks: { done: { tap: (arg0: string, arg1: () => void) => void; }; }; }} compiler
   */
  apply(compiler) {
    if (this.options === this.opt) return console.log("没有options，不进行任何操作！")

    // compiler.hooks.watchRun.tap("AutoxDeployPlugin", () => {
    //   this.changFile ??= compiler?.modifiedFiles?.values()?.next()?.value
    //   if (this.changFile) this.changFile = path.posix.normalize(this.changFile)
    //   console.log("重新编译，改变的文件：", this.changFile)
    // })
    compiler.hooks.done.tap("AutoxDeployPlugin", () => {
      if (typeof this.options.path !== "string") {
        throw new Error("必须提供一个有效的相对路径")
      }
      const out = posix.resolve(this.options.path)
      console.log("----->[out_file_path] =", out)

      switch (this.options.type) {
        case "rerun":
          this.sendCmd("rerun", out)
          break
        case "save":
          this.sendCmd("save", out)
          break
        default:
          console.error("重新编译后,不进行任何操作")
          break
      }
    })
  }
}
