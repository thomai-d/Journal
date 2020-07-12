import { appConfig } from '../appConfig';

export enum LogLevel {
  Perf = 'Verbose',
  Debug = 'Debug',
  Info = 'Information',
  Warn = 'Warning',
  Error = 'Error'
}

function logToConsole(level: LogLevel, date: Date, msgTemplate: string, props?: any, additional?: any): void {
  const propRx = /\{.*?\}/g;
  const timestr = date.toLocaleTimeString() + '.' + date.getMilliseconds();
  const message = `[${level.substr(0, 1)}] ` + msgTemplate.replace(propRx, r => {
    const propName = r.substr(1, r.length - 2);
    return props?.[propName] ?? `{${propName}?}`;
  });

  if (additional)
    console.log(timestr, message, '\n', additional);
  else
    console.log(timestr, message);
}

function log(level: LogLevel, msgTemplate: string, props?: any, add?: any): void {
  const date = new Date();

  if (appConfig.logToConsole) {
    logToConsole(level, date, msgTemplate, props, add);
  }
}

export const logger = {
  debug: (msg: string, props?: any) => log(LogLevel.Debug, msg, props),
  info: (msg: string, props?: any) => log(LogLevel.Info, msg, props),
  warn: (msg: string, props?: any) => log(LogLevel.Warn, msg, props),
  err: (msg: string, props?: any, err?:any) => log(LogLevel.Error, msg, props, err),
};