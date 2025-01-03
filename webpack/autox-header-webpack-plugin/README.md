## autox-header-webpack-plugin


### 描述：
在打包后的文件中加入标识头，注释，选项：jsjiami.com.v6加密，base64编码


### 参数：


| 参数名        | 参数类型   |  参数作用  |
| --------   | -----:  | :----:  | 
| base64      | Boolean   |   是否开启base64编码    |
| advancedEngines        |  Boolean   |  是否开启加密    |
| header        |       | 添加到文件开头的注释<br>你可以直接使用fs.readFileSync(headerFile, "utf8").trim()读取txt文件  |

安装插件

```
npm install autox-header-webpack-plugin -D

```
使用插件

```javascript
//path txt文件路径
const headerFile = path.resolve(__dirname, path);
const headerText = fs.readFileSync(headerFile, "utf8").trim();
const AutoxHeaderWebpackPlugin = require("autox-header-webpack-plugin");

//在webpack插件中添加
    plugins: [
 new AutoxHeaderWebpackPlugin({
        base64: true,
        advancedEngines: true,
        header: headerText
      }),
    ]

```
