export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4
}

export async function getLogLevel(): Promise<LogLevel> {
  const result = await browser.storage.local.get('debugLogLevel');
  return (result.debugLogLevel as LogLevel | undefined) ?? LogLevel.WARN;
}

export async function setLogLevel(level: LogLevel): Promise<void> {
  await browser.storage.local.set({ debugLogLevel: level });
}

export class Logger {
  constructor(private prefix: string) {}

  async debug(message: string, data?: any): Promise<void> {
    const level = await getLogLevel();
    if (level <= LogLevel.DEBUG) {
      console.log(`[${this.prefix}] ${message}`, data !== undefined ? data : '');
    }
  }

  async info(message: string, data?: any): Promise<void> {
    const level = await getLogLevel();
    if (level <= LogLevel.INFO) {
      console.log(`[${this.prefix}] ${message}`, data !== undefined ? data : '');
    }
  }

  async warn(message: string, data?: any): Promise<void> {
    const level = await getLogLevel();
    if (level <= LogLevel.WARN) {
      console.warn(`[${this.prefix}] ${message}`, data !== undefined ? data : '');
    }
  }

  async error(message: string, data?: any): Promise<void> {
    const level = await getLogLevel();
    if (level <= LogLevel.ERROR) {
      console.error(`[${this.prefix}] ${message}`, data !== undefined ? data : '');
    }
  }
}
