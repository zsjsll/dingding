class Test {
    name: string
    constructor(name: string) {
        this.name = name
    }
    out() {
        return this.name
    }
}

let n = "hello"

const t = new Test(n)
console.log(t.out())

n = "world"
console.log(t.out())
