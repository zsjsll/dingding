# AutoxDeployWebpackPlugin
和Vscode插件Auto.js-VSCodeExt-Fixed结合发布指令到手机上

具体用法可参考 [webpack-autojs] (https://github.com/kkevsekk1/webpack-autojs)

# 准备
 - 在vsCode中安装Auto.js-VSCodeExt-Fixed插件
 - npm install autox-deploy-webpack-plugin --save

# 参数

|name|value|desc
|--|--|--|
| type | rerun | watch模式的时候，是否自动deploy（部署）、rerun（重新运行）、none（不操作） | 


# 使用
```javascript

const WatchDeployPlugin = require('autox-deploy-webpack-plugin')
//webpack.config.js文件中引用
plugin:[
    new WatchDeployPlugin({
        type: type
      })
]

