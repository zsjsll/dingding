const 替换双花括号 = function () {
  let str = arguments[0]

  for (;;) {
    if (/\{\{(?!this).*?\}\}/.test(str)) {
      str = str.replace(/\{\{(?!this)(.*?)\}\}/, "$${$1}")
    } else {
      break
    }
  }
  return str
}
const 替换双花括号_xml添加反引号 = function () {
  let str = arguments[0]

  for (;;) {
    if (/<.*\/>(?!`)/.test(str)) {
      str = str.replace(/(<.*\/>)/, "`$1`")
    } else {
      break
    }
  }

  // process.exit()
  return str
}
const 去掉单引号 = function () {
  let str = arguments[0]

  for (;;) {
    if (/'/.test(str)) {
      str = str.replace(/'/g, "")
    } else {
      break
    }
  }
  for (;;) {
    if (/['"]\s*<.*?>\s*['"]/.test(str)) {
      str = str.replace(/['"]\s*(<.*?>)\s*['"]/g, "$1")
    } else {
      break
    }
  }
  return str
}

const xml添加反引号 = function (content) {
  // return content.replace(/ui.layout\((.*?)\)/g, "ui.layout(`$1`)")

  let result = content

  result = result.replace(/ui\.layout\([^()]*?\)/gm, 替换双花括号)
  result = result.replace(/floaty\.rawWindow\([^()]*?\)/gm, 替换双花括号)
  result = result.replace(/floaty\.window\([^()]*?\)/gm, 替换双花括号)
  result = result.replace(/ui\.inflate\(([^()]+?),([^()]+?)\)/gm, 替换双花括号)
  result = result.replace(/ui\.inflate\(([^(,)]+?)\)/gm, 替换双花括号)
  result = result.replace(/\.prototype\.render ?= ?function ?\(\) ?{([\s\S]*?)}/gm, 替换双花括号_xml添加反引号)

  result = result.replace(/ui\.layout\(([^()]+?)\)/gm, "ui.layout(`$1`)")
  result = result.replace(/floaty\.rawWindow\(([^()]+?)\)/gm, "floaty.rawWindow(`$1`)")
  result = result.replace(/floaty\.window\(([^()]+?)\)/gm, "floaty.window(`$1`)")
  result = result.replace(/ui\.inflate\(([^()]+?),([^()]+?)\)/gm, "ui.inflate(`$1`,$2)")
  result = result.replace(/ui\.inflate\(([^(,)]+?)\)/gm, "ui.inflate(`$1`)")

  const reg = /(ui\.inflate\(`\s*['"][^()]*?)'\s*\+\s*([a-zA-Z_]+)\s*\+\s*'([^()]*?['"]\s*`,[^()]+?\))/
  for (;;) {
    if (reg.test(result)) {
      result = result.replace(/(ui\.inflate\(`\s*['"][^()]*?)'\s*\+\s*([a-zA-Z_]+)\s*\+\s*'([^()]*?['"]\s*`,[^()]+?\))/gm, "$1$${$2}$3")
    } else {
      result = result.replace(/ui\.inflate\(`\s*['"][^()]*?`,[^()]+?\)/gm, 去掉单引号)

      break
    }
  }

  return result
}

const someAsyncOperation = function (content, callback) {
  let err = ""
  try {
    content = xml添加反引号(content)
  } catch (e) {
    err = e
  }
  callback(err, content)
}

export default function (content, map, meta) {
  const callback = this.async()
  someAsyncOperation(content, (err, result) => {
    if (err) return callback(err)
    callback(null, result, map, meta)
  })
}