declare global {
  type SocketLibCallback = (...args: any[]) => any
  interface SocketlibSocket {
    register(handler: string, func: SocketLibCallback)

    executeAsGM(handler: string, ...parameters: any[]): Promise<any>
    executeAsUser(handler: string, userId: any, ...parameters: any[]): Promise<any>
    executeForAllGMs(handler: string, ...parameters: any[]): Promise<any>
    executeForOtherGMs(handler: string, ...parameters: any[]): Promise<any>
    executeForEveryone(handler: string, ...parameters: any[]): Promise<any>
    executeForOthers(handler: string, ...parameters: any[]): Promise<any>
    executeForUsers(handler: string, recipients: any[], ...parameters: any[]): Promise<any>
  }

  interface Socketlib {
    registerModule(moduleName: string): SocketlibSocket
  }

  const socketlib: Socketlib
}

export {}
