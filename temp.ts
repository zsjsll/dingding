import fs from "fs"
import path from "path"
import readline from "readline"

const file_path = path.posix.resolve("./index.js")
const temp_file_path = path.posix.resolve("./temp_index.js")

const head = "//fix"

function fixConsoleLog() {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(file_path),
  })

  const writeInterface = fs.createWriteStream(temp_file_path)
  writeInterface.write(head + "\n")

  let out = false
  readInterface.on("line", (line) => {
    if (line === head) {
      out = true
      return
    }
    if (line.includes("console.log = () => {}")) line = ""
    writeInterface.write(line + "\n")
  })

  readInterface.on("close", () => {
    readInterface.close()
    if (out) {
      fs.unlink(temp_file_path, (e) => console.log(e))
    } else {
      fs.unlink(file_path, (e) => console.log(e))
      fs.renameSync(temp_file_path, file_path)
    }
  })

}

console.log(fixConsoleLog())
