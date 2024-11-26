app.launchPackage("com.tencent.tim")
// app.launchPackage("com.alibaba.android.rimet")

// let a = text("联系人").findOne(5e3)
// let a = id("kbi").indexInParent(1).findOne(-1).parent().click()
let a = text("消息").boundsInside(0, 2189, device.width, device.height).findOne(-1).parent().click()

// let b = id("n19").indexInParent(1).findOne(3e3).child(0).click()
// let c = id("aua").descStartsWith("123_").click()
console.log(a.className())
