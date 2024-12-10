declare function lockScreen(): void

declare interface RootAutomator {
  exit(): void
}
declare namespace Internal {
  interface Engines {
    execScriptFile(path: string): void
  }
}
