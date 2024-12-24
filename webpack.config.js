// @ts-nocheck
// Generated using webpack-cli https://github.com/webpack/webpack-cli

const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const JavascriptObfuscator = require("webpack-obfuscator")
const AutoxHeaderWebpackPlugin = require("autox-header-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

const CopyPlugin = require("copy-webpack-plugin")

const path = require("path")
const fs = require("fs")

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
      from: path.posix.resolve("./source").replace(/\\/g, "/") + "",
      to: path.posix.resolve("./dist").replace(/\\/g, "/") + "",
      globOptions: { ignore: ["**/*.js", "**/*.ts"] },
    },
  ],
}

let plugins = [
  // new AutoxHeaderWebpackPlugin(headerConfig),

  new CleanWebpackPlugin(cleanConfig),
  new CopyPlugin(copyConfig),
]

module.exports = (_, a) => {
  console.log(a)
  let mode

  if (a.nodeEnv === "obfuscator") {
    plugins.unshift(new JavascriptObfuscator())
  }

  if (a.nodeEnv === "default" || a.nodeEnv === undefined) {
  }

  if (a.nodeEnv === "ui") {
    plugins.unshift(new AutoxHeaderWebpackPlugin(headerConfig))
    plugins.unshift(new JavascriptObfuscator())
  }

  const config = {
    target: "node",
    entry: "./source/main.ts",
    output: {
      path: path.posix.resolve("dist"),
    },

    plugins,
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/

    module: {
      rules: [
        {
          test: /\.ts$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "webpack-autojs-loader",
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

  return config
}
