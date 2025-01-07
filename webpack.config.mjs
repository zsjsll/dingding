/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { CleanWebpackPlugin } from "clean-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import AutoxDeployPlugin from "./webpack/autox-deploy-webpack-plugin/index.mjs"

import { posix } from "path"

/**
 * @type {import('webpack').Configuration}
 */

export default (_, a) => {
  console.log(a)

  const config = {
    //关闭 webpack 的性能提示
    performance: {
      // hints: false,
      maxEntrypointSize: 50000000,
      maxAssetSize: 30000000,
    },
    watchOptions: {},
    mode: "production",
    target: ["web", "es3"],
    entry: "./source/main.ts",
    output: {
      path: posix.resolve("dist"),
    },

    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
        protectWebpackAssets: false,
        cleanOnceBeforeBuildPatterns: [],
        cleanAfterEveryBuildPatterns: ["bundle.js"],
      }),
      new CopyPlugin({
        patterns: [
          {
            from: posix.resolve("./source"),
            to: posix.resolve("./dist"),
            globOptions: { ignore: ["**/*.js", "**/*.ts"] },
          },
        ],
      }),
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
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
      alias: {
        "@": posix.resolve("source/module"),
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

  if (a.env.WEBPACK_WATCH) {
    console.log("开启监听模式")

    config.watchOptions = {
      // aggregateTimeout: 5000,
      // poll: 1000,
      ignored: ["**/*.js", "**/*.json", "**/node_modules", "**/webpack"],
    }

    config.optimization.minimize = false
    config.plugins.push(
      new AutoxDeployPlugin({
        type: "save",
        path: "dist",
      })
    )
  }

  if (a.env.WEBPACK_BUILD) {
    console.log("开始打包")
  }

  return config
}
