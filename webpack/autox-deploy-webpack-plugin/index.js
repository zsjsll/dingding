var http = require("http")
var path = require("path")
class WatchDeployPlugin {
  sendCmd(cmd, path) {
    console.error("执行命令：", cmd)
    path = encodeURI(path)
    var req = http.get("http://127.0.0.1:9317/exec?cmd=" + cmd + "&path=" + path, (res) => {
      res.setEncoding("utf8")
      res
        .on("data", (data) => {
          console.error(data)
        })
        .on("error", () => {
          console.error("返回数据错误")
        })
    })
    req.on("error", function (err) {
      console.error("watch模式，自动" + cmd + "失败,autox.js服务未启动")
      console.error("请使用 ctrl+shift+p 快捷键，启动auto.js服务")
    })
  }
  constructor(options = {}) {
    this.options = options
    this.changFile = undefined
  }
  apply(compiler) {
    if (this.options.type != null && this.options.type != "none") {
      compiler.hooks.watchRun.tap("WatchDeployPlugin", (compiler) => {
        this.changFile ??= compiler?.modifiedFiles?.values()?.next()?.value
        if (this.changFile) this.changFile = path.posix.normalize(this.changFile)
        console.log("重新编译，改变的文件：", this.changFile)
      })
      compiler.hooks.done.tap("WatchDeployPlugin", (stats) => {
        const compilation = stats.compilation
        // console.log("----->[compilation] =", compilation.moduleGraph._moduleMap)

        compilation.moduleGraph._moduleMap.forEach((_,k) => {
        console.log(Object.keys(k))
        })

        // if (this.changFile != "") {
        //   compilation.chunks.forEach((chunk) => {
        //     var modules = chunk.getModules()
        //     modules.forEach((module) => {
        //       //   console.error("r---c", module.userRequest,this.changFile);
        //       let userRequest = module.userRequest.replaceAll("\\", "/")
        //       this.changFile = this.changFile.replaceAll("\\", "/")
        //       if (userRequest == this.changFile) {
        //         //  console.error("chunk", chunk.files);
        //         chunk.files.forEach((file) => {
        //           var projectName = path.posix.normalize(file).split(path.posix.sep)[1]
        //           var outProjecPath = path.resolve(compiler.outputPath, projectName)
        //           var outFilePath = path.resolve(compiler.outputPath, projectName, this.options.projects[projectName])
        //           //  console.error("projectName", projectName,outProjecPath);
        //           //  console.error("outFilePath", outFilePath);
        //           switch (this.options.type) {
        //             case "deploy":
        //               this.sendCmd("save", "/" + outProjecPath)
        //               break
        //             case "rerun":
        //               this.sendCmd("rerun", "/" + outFilePath)
        //               break
        //             default:
        //               console.error("重新编译后,不进行任何操作")
        //               break
        //           }
        //         })
        //       }
        //     })
        //   })
        // }
      })
    }
  }
}
module.exports = WatchDeployPlugin
