/**
 * 日志服务模块
 * 基于 winston 实现的日志记录器，支持多种日志级别和输出方式
 */
import process from 'node:process';

import { LoggerService as NestLoggerService } from '@nestjs/common';
import chalk from 'chalk';
import { WinstonModule } from 'nest-winston';
import { JsonStringify } from 'src/common';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Winston 配置
 * 用于配置 Winston 日志记录器
 */
const { format, transports, createLogger } = winston;

/**
 * 日志级别枚举
 * 定义了应用程序中可能使用的不同日志级别
 */
const enum logs {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  REQUEST = 'request',
  VERBOSE = 'verbose',
  INFO = 'info',
  LOG = 'print',
  DEBUG = 'debug',
}

/**
 * 默认元数据配置
 */
const meta = {
  context: undefined,
  label: 'CETCMS',
};

/**
 * 日志颜色配置
 * 为不同级别的日志定义不同的颜色显示
 */
const colors = {
  [logs.FATAL]: 'red', // 致命错误 - 红色
  [logs.ERROR]: 'red', // 错误 - 红色
  [logs.WARN]: 'yellow', // 警告 - 黄色
  [logs.INFO]: 'green', // 信息 - 绿色
  [logs.REQUEST]: 'magenta', // 请求 - 洋红色
  [logs.VERBOSE]: 'blue', // 详细信息 - 蓝色
  [logs.LOG]: 'cyan', // 日志 - 青色
  [logs.DEBUG]: 'white', // 调试 - 白色
};

/**
 * 日志级别排序数组
 * 定义日志级别的优先级顺序
 */
const sorts = [logs.FATAL, logs.ERROR, logs.WARN, logs.VERBOSE, logs.INFO, logs.LOG, logs.REQUEST, logs.DEBUG];

/**
 * 日志级别配置对象
 * 将日志级别名称映射为数字优先级
 */
const levels = sorts.reduce((res, cur, i) => {
  res[cur] = i;
  return res;
}, {});

/**
 * 自定义日志配置
 * 包含日志级别和颜色配置
 */
const custom = {
  levels,
  colors,
};

/**
 * 日志记录器实例
 * 配置了多种传输方式（控制台输出、文件输出等）
 */
const instance = createLogger({
  levels: custom.levels,
  level: process.env.NODE_ENV === 'production' ? logs.INFO : logs.DEBUG,
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: {
    pid: process.pid,
  },
  transports: [
    // 控制台传输配置
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss A' }),
        format.colorize({ all: true, colors: custom.colors }),
        format.printf(({ label, timestamp, level, message, stack, context }) => {
          const info: any[] = [];
          // 定义颜色映射
          const colors = {
            label: chalk.blue,
            pid: chalk.gray,
            timestamp: chalk.white,
            context: chalk.cyan,
            message: chalk.white,
            stack: chalk.red,
          };
          // 创建信息数组
          info.push(colors.label(`[${label || meta.label}]`));
          info.push(colors.pid(process.pid));
          info.push(colors.timestamp(`[${timestamp}]`));
          info.push(`${level}`);
          if (context) info.push(colors.context(`[${context}]`));
          if (message) info.push(`${message}`);
          if (stack) info.push(colors.stack(`\n${stack}`));
          return info.join(' ');
        })
      ),
    }),
    // 请求日志文件传输
    new DailyRotateFile({
      level: logs.REQUEST,
      format: format.combine(format((info) => (info.level === logs.REQUEST ? info : false))()),
      filename: 'logs/requests/record.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '180d',
    }),
    // 错误日志文件传输
    new DailyRotateFile({
      level: logs.ERROR,
      filename: 'logs/errors/record.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '180d',
    }),
  ],
  // 异常处理传输
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions/record.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '180d',
    }),
  ],
  // 拒绝处理传输
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections/record.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '180d',
    }),
  ],
});

const handlerMessage = (message: any) => {
  if (typeof message === 'object') {
    try {
      return JsonStringify(message);
    } catch {
      return message;
    }
  }
  return message;
};

/**
 * 创建 NestJS 日志服务实例
 * @returns WinstonModule 创建的日志服务
 */
export function LoggerService() {
  return WinstonModule.createLogger({
    instance,
  });
}

/**
 * 日志记录器类
 * 实现 NestJS 的 LoggerService 接口，提供统一的日志记录方法
 */
export class Logger implements NestLoggerService {
  /**
   * 日志元数据
   * 包含上下文和标签信息
   */
  protected meta: {
    label?: string;
    context?: string;
  };

  /**
   * 构造函数
   * @param context 日志上下文
   * @param label 日志标签
   */
  constructor(context?: string, label?: string) {
    this.setMeta(context, label);
  }

  /**
   * 静态方法：设置元数据并创建 Logger 实例
   * @param context 日志上下文
   * @param label 日志标签
   * @returns 新创建的 Logger 实例
   */
  static setMeta(context?: string, label?: string) {
    return new Logger(context, label);
  }

  /**
   * 静态方法：设置上下文并创建 Logger 实例
   * @param context 日志上下文
   * @returns 新创建的 Logger 实例
   */
  static setContext(context: string) {
    return new Logger(context);
  }

  /**
   * 静态方法：设置标签并创建 Logger 实例
   * @param label 日志标签
   * @returns 新创建的 Logger 实例
   */
  static setLabel(label: string) {
    return new Logger(undefined, label);
  }

  /**
   * 设置元数据
   * @param context 日志上下文
   * @param label 日志标签
   * @returns 当前 Logger 实例（支持链式调用）
   */
  setMeta(context?: string, label?: string) {
    if (!this.meta) this.meta = {};
    this.meta.context = context || meta.context;
    this.meta.label = label || meta.label;
    return this;
  }

  /**
   * 设置日志上下文
   * @param context 日志上下文
   * @returns 当前 Logger 实例（支持链式调用）
   */
  setContext(context: string) {
    if (!this.meta) this.meta = {};
    this.meta.context = context;
    return this;
  }

  /**
   * 设置日志标签
   * @param label 日志标签
   * @returns 当前 Logger 实例（支持链式调用）
   */
  setLabel(label: string) {
    if (!this.meta) this.meta = {};
    this.meta.label = label;
    return this;
  }

  /**
   * 记录普通日志
   * @param message 日志消息
   * @param params 其他参数
   */
  log(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.LOG, handlerMessage(message), ...params);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param params 其他参数
   */
  info(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.INFO, handlerMessage(message), ...params);
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param params 其他参数
   */
  error(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.ERROR, handlerMessage(message), ...params);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param params 其他参数
   */
  warn(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.WARN, handlerMessage(message), ...params);
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param params 其他参数
   */
  debug(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.DEBUG, handlerMessage(message), ...params);
  }

  /**
   * 记录详细信息日志
   * @param message 日志消息
   * @param params 其他参数
   */
  verbose(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.VERBOSE, handlerMessage(message), ...params);
  }

  /**
   * 记录请求日志
   * @param message 日志消息
   * @param params 其他参数
   */
  request(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.REQUEST, handlerMessage(message), ...params);
  }

  /**
   * 记录致命错误日志
   * @param message 日志消息
   * @param params 其他参数
   */
  fatal(message: any, ...params: any[]) {
    instance.defaultMeta = this.meta;
    return instance.log(logs.FATAL, handlerMessage(message), ...params);
  }

  /**
   * 静态方法：记录普通日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static log(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.log(message, ...params);
  }

  /**
   * 静态方法：记录信息日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static info(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.info(message, ...params);
  }

  /**
   * 静态方法：记录错误日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static error(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.error(message, ...params);
  }

  /**
   * 静态方法：记录警告日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static warn(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.warn(message, ...params);
  }

  /**
   * 静态方法：记录调试日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static debug(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.debug(message, ...params);
  }

  /**
   * 静态方法：记录详细信息日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static verbose(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.verbose(message, ...params);
  }

  /**
   * 静态方法：记录请求日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static request(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.request(message, ...params);
  }

  /**
   * 静态方法：记录致命错误日志
   * @param message 日志消息
   * @param params 其他参数
   */
  static fatal(message: any, ...params: any[]) {
    const logger = new Logger();
    return logger.fatal(message, ...params);
  }
}
