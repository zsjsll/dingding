import { CleanWebpackPlugin } from "clean-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import AutoxDeployPlugin from "./webpack/autox-deploy-webpack-plugin/index.js"
import MomentLocalesPlugin from "moment-locales-webpack-plugin"
import { posix } from "path"

const entry_path = "./source/main.ts"
const output_path = "./dist"

/** @type {import("webpack").Configuration} */
const config = {
  watchOptions: {},
  mode: "production",
  target: ["web", "es3"],
  entry: entry_path,
  output: {
    path: posix.resolve(output_path),
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
          to: posix.resolve(output_path),
          globOptions: { ignore: ["**/*.js", "**/*.ts"] },
        },
      ],
    }),
    new MomentLocalesPlugin({
      localesToKeep: ["zh-cn"],
    }),
    new AutoxDeployPlugin({
      type: "save",
      path: output_path,
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

export default (_, a) => {
  console.log(a)

  if (a.env.WEBPACK_WATCH) {
    console.log("开启监听模式")

    config.watchOptions = {
      ignored: ["**/*.js", "**/*.json", "**/node_modules", "**/webpack"],
    }

    // @ts-expect-error kkkk
    config.optimization.minimize = false
  }

  if (a.env.WEBPACK_BUILD) {
    console.log("开始打包")

    // @ts-expect-error kkkk
    config.optimization.minimize = true
  }
  return config
}
