

function f(o) {
  o.before()
  console.log(1)

  console.log(2)

}

f({
  before: () => console.log("bbbb"),
})
