// @ts-nocheck
// Generated using webpack-cli https://github.com/webpack/webpack-cli

const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const JavascriptObfuscator = require("webpack-obfuscator")
const AutoxHeaderWebpackPlugin = require("autox-header-webpack-plugin")

const CopyPlugin = require("copy-webpack-plugin")

const path = require("path")
const fs = require("fs")

const header = fs.readFileSync(path.resolve(__dirname, "header.js"), "utf8").trim()

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

    if (a.nodeEnv === "p") {
        plugins.unshift(new JavascriptObfuscator())
    }

    if (a.nodeEnv === "d") {
    }

    if (a.nodeEnv === "pui") {
        plugins.unshift(new AutoxHeaderWebpackPlugin(headerConfig))
        plugins.unshift(new JavascriptObfuscator())
    }


    const config = {
        target: "node",
        entry: "./source/main.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
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
        },
    }

    return config
}
