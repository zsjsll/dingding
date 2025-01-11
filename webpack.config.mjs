import { CleanWebpackPlugin } from "clean-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import AutoxDeployPlugin from "./webpack/autox-deploy-webpack-plugin/index.js"
import MomentLocalesPlugin from "moment-locales-webpack-plugin"
import path from "path"

const entry_path = "./src"
const entry_file = path.join(entry_path, "main.ts")
const alias_path = "./src/module"

const output_path = "./dist"

/** @type {import("webpack").Configuration} */
const config = {
  watchOptions: {},
  mode: "production",
  target: ["web", "es3"],
  entry: path.posix.resolve(entry_file),
  output: {
    path: path.posix.resolve(output_path),
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
          from: path.posix.resolve(entry_path),
          to: path.posix.resolve(output_path),
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
            loader: "swc-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
    alias: {
      "@": path.posix.resolve(alias_path),
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

    // @ts-expect-error config.optimization.minimize
    config.optimization.minimize = false
  } else {
    console.log("开始打包")

    // @ts-expect-error config.optimization.minimize
    config.optimization.minimize = true
  }

  // if (a.env.WEBPACK_BUILD) {
  // }
  return config
}
