const { startsWith } = require("lodash")

app.launchPackage("com.tencent.tim")
// let b = descStartsWith("123_").boundsInside(0, 351, device.width, 545).findOne(10e3).click()
const a = descStartsWith("123_").boundsInside(0, 351, device.width, 545).findOne(10e3).click()
console.log(a)
