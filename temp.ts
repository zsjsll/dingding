import moment from "moment"

const k = new Date()

function formatTime(style: string, timestamp?: number) {
  if (timestamp) return moment(timestamp).format(style)
  else return moment().format(style)
}

const t = formatTime("YYYY-MM-DD-(d)")
console.log(t)
