// @ts-nocheck
// Generated using webpack-cli https://github.com/webpack/webpack-cli

const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const JavascriptObfuscator = require("webpack-obfuscator")
const AutoxHeaderWebpackPlugin = require("./webpack/autox-header-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const WatchDeployPlugin = require("./webpack/autox-deploy-webpack-plugin")

// const { EsbuildPlugin } = require("esbuild-loader")
// const esbuild = require("esbuild")

const path = require("path")
const fs = require("fs")
const readline = require("readline")

const header = fs.readFileSync(path.posix.resolve("header.js"), "utf8").trim()

const fix_webpack_autojs_loader = () => {
  const file_path = path.posix.resolve("node_modules\\webpack-autojs-loader\\index.js")
  const temp_file_path = path.posix.resolve("node_modules\\webpack-autojs-loader\\temp.js")
  const head = "//fix"

  const readInterface = readline.createInterface({
    input: fs.createReadStream(file_path),
  })

  const writeInterface = fs.createWriteStream(temp_file_path)
  writeInterface.write(head + "\n")

  let out = false
  readInterface.on("line", (line) => {
    if (line === head) {
      out = true
      return
    }
    if (line.includes("console.log = () => {}")) line = ""
    writeInterface.write(line + "\n")
  })

  readInterface.on("close", () => {
    readInterface.close()
    if (out) {
      fs.unlink(temp_file_path, (e) => {
        if (e) console.log(e)
      })
    } else {
      fs.unlink(file_path, (e) => {
        if (e) console.log(e)
      })
      fs.renameSync(temp_file_path, file_path)
    }
  })
}


const headerConfig = { base64: false, advancedEngines: true, header: header }
const cleanConfig = {
  cleanStaleWebpackAssets: false,
  protectWebpackAssets: false,
  cleanOnceBeforeBuildPatterns: [],
  cleanAfterEveryBuildPatterns: ["bundle.js"],
}
const copyConfig = {
  patterns: [
    {
      from: path.posix.resolve("./source").replace(/\\/g, "/") + "",
      to: path.posix.resolve("./dist").replace(/\\/g, "/") + "",
      globOptions: { ignore: ["**/*.js", "**/*.ts"] },
    },
  ],
}

module.exports = (_, a) => {
  console.log(a)
  let watchOptions = {}
  let is_mini = true

  if (a.watch) {
    is_mini = false
    watchOptions = {
      // aggregateTimeout: 5000,
      // poll: 1000,
      ignored: ["**/*.js", "**/node_modules"],
    }
    console.log("开启监听模式")
  }

  if (a.nodeEnv === "default" || a.nodeEnv === undefined) {
  }

  if (a.nodeEnv === "obfuscator") {
    plugins.unshift(new JavascriptObfuscator())
  }

  if (a.nodeEnv === "ui") {
    plugins.unshift(new AutoxHeaderWebpackPlugin(headerConfig))
    plugins.unshift(new JavascriptObfuscator())
  }

  const config = {
    //关闭 webpack 的性能提示
    performance: {
      // hints: false,
      maxEntrypointSize: 50000000,
      maxAssetSize: 30000000,
    },

    mode: "production",
    watchOptions,
    target: ["web", "es3"],
    entry: "./source/main.ts",
    output: {
      path: path.posix.resolve("dist"),
    },

    plugins: [
      // new AutoxHeaderWebpackPlugin(headerConfig),
      new CleanWebpackPlugin(cleanConfig),
      new CopyPlugin(copyConfig),
      new WatchDeployPlugin({
        type: "rerun",
        projects: { projectName: "/dist/main.js" },
      }),
    ],
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/

    module: {
      rules: [
        {
          test: /\.ts$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: "./webpack/webpack-autojs-loader",
            },
            {
              loader: "swc-loader",
              // options: {
              //   jsc: {
              //     output: { charset: "ascii" },
              //   },
              // },
            },
          ],
        },

        // Add your rules for custom modules here
        // Learn more about loaders from https://webpack.js.org/loaders/
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
      alias: {
        "@": path.posix.resolve("source/module"),
      },
    },
    optimization: {
      minimize: is_mini,
      minimizer: [
        // new EsbuildPlugin({
        //   // target: "es6",
        //   legalComments: "none", // 去除注释
        //   minify: true,
        //   minifyWhitespace: false, // 去掉空格
        //   minifyIdentifiers: false, // 缩短标识符
        //   minifySyntax: false, // 缩短语法
        //   // implementation: esbuild, // 自定义 esbuild instance 实现
        // }),

        new TerserPlugin({
          extractComments: false, //不将注释提取到单独的文件中
          terserOptions: {
            format: {
              comments: false, //删除注释
            },
          },
        }),
      ],
    },
  }

  return config
}
