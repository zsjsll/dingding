

import { Pause } from "@/tools"
export type Variable = {
  root: boolean
  pause: Pause
  thread: boolean
  info: string[]
}

export class Script {
  const variable: Variable
}
