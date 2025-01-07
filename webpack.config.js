// @ts-nocheck
// Generated using webpack-cli https://github.com/webpack/webpack-cli

const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const AutoDeployPlugin = require("./webpack/autox-deploy-webpack-plugin")

const path = require("path")
const fs = require("fs")
const readline = require("readline")

const header = fs.readFileSync(path.posix.resolve("header.js"), "utf8").trim()

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
      from: path.posix.resolve("./source"),
      to: path.posix.resolve("./dist"),
      globOptions: { ignore: ["**/*.js", "**/*.ts"] },
    },
  ],
}

const autoDeployConfig = {
  type: "save",
  path: "dist",
}

module.exports = (_, a) => {
  console.log(a)
  let watchOptions = {}

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
      // Add your plugins here
      // Learn more about plugins from https://webpack.js.org/configuration/plugins/

      // new AutoxHeaderWebpackPlugin(headerConfig),
      new CleanWebpackPlugin(cleanConfig),
      new CopyPlugin(copyConfig),
    ],

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
      minimize: true,
      minimizer: [
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

  if (a.watch) {
    config.optimization.minimize = false
    config.plugins.push(new AutoDeployPlugin(autoDeployConfig))
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
    // config.plugins.unshift(new JavascriptObfuscator())
  }

  if (a.nodeEnv === "ui") {
    config.plugins.unshift(new AutoxHeaderWebpackPlugin(headerConfig))
    // config.plugins.unshift(new JavascriptObfuscator())
  }

  return config
}
