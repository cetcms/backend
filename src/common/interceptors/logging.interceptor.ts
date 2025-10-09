import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { BuildRequestLogPrint, JsonMask, Logger } from 'src/common';
import { ContextHandler, RequestHandler } from 'src/common/handlers';
import { RequestLog } from 'src/generated/graphql';
import { v7 as uuid } from 'uuid';

/**
 * 日志拦截器
 * 用于拦截请求并记录请求日志信息
 * 实现了 NestJS 的 NestInterceptor 接口
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * 日志记录器实例
   * 用于记录请求相关信息
   */
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * 拦截方法
   * 在每个请求处理前后执行，收集并记录请求信息
   * @param context - 执行上下文，包含请求相关信息
   * @param next - 调用处理器，用于继续执行后续逻辑
   * @returns 可观察对象，用于处理异步操作
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 排除心跳检查方法的记录
    if (context.getHandler().name === 'healthCheck') {
      return next.handle();
    }

    // 构建请求日志数据
    const data = this.buildData(context);

    // 构建日志消息数组
    const messages: string[] = [`[REQ:${data.id}]`, `${data.method}`, `${data.action}`, '{duration}', '{message}'];

    if (data.target) {
      messages.push(`${data.target}->${data.userId || data.adminId}`);
    } else {
      messages.push(`Guest->${data.fingerprint}`);
    }
    // 如果存在公司ID，则添加公司ID信息
    if (data.companyId) {
      messages.push(`COM:${data.companyId}`);
    }
    messages.push(`${data.route}`);
    messages.push(`[${data.language}]`);

    // 继续执行后续逻辑，并在完成后记录结束时间
    return next.handle().pipe(
      tap(() => {
        data.afterAt = new Date();
        data.duration = BigInt(data.afterAt.getTime() - data.beforeAt.getTime());
        this.printData(data, messages, false);
      }),
      catchError((error) => {
        data.afterAt = new Date();
        data.duration = BigInt(data.afterAt.getTime() - data.beforeAt.getTime());
        data.message = error.message;
        this.printData(data, messages, true);
        return throwError(() => error);
      })
    );
  }

  private buildData(context: ExecutionContext) {
    // 获取请求类型（HTTP或GraphQL）
    const type = ContextHandler(context).getType();
    // 获取请求对象
    const request = ContextHandler(context).getRequest();
    // 创建请求处理器实例
    const req = RequestHandler(request);
    // 获取认证信息
    const auth = req.getAuthInfo();

    // 构建请求日志数据对象
    const data: RequestLog = {
      id: uuid(), // 日志唯一标识
      subject: context.getClass().name, // 请求处理类名
      action: context.getHandler().name, // 请求处理方法名
      method: type === 'GRAPHQL' ? type : req.getMethod(), // 请求方法
      query: req.getQuery(), // 查询参数
      language: req.getLanguage(), // 请求语言
      fingerprint: req.getFingerprint(), // 设备指纹
      device: req.getDevice(), // 设备信息
      location: req.getLocation(), // 位置信息
      ip: req.getIp(), // 客户端IP
      headers: req.getHeaders(), // 请求头信息
      body: req.getBody(), // 请求体数据
      route: req.getRoute(), // 请求路由
      params: req.getParams(), // 路径参数
      target: auth?.target || null, // 认证目标
      userId: auth?.userId || null, // 用户ID
      adminId: auth?.adminId || null, // 管理员ID
      companyId: auth?.companyId || null, // 公司ID
      message: 'OK',
      recordAt: new Date(), // 记录时间
      createdAt: new Date(), // 创建时间
      updatedAt: new Date(), // 更新时间
      beforeAt: new Date(), // 请求开始时间
      afterAt: null, // 请求结束时间（初始为空）
      duration: 0n, // 请求处理耗时（初始为0）
    };

    if (!request.res) {
      data.method = 'GRAPHQL_WS';
    }

    return data;
  }

  private printData(data: RequestLog, messages: string[], isError: boolean) {
    // 构建成功日志消息
    messages = messages.map((message) => {
      if (message === '{duration}') return `${data.duration}s`;
      if (message === '{message}') return `(${data.message})`;
      return message;
    });
    // 创建日志记录器实例
    const logger = Logger.setContext(data.subject || LoggingInterceptor.name);
    if (!isError) {
      // 请求成功时使用 info 级别记录日志
      logger.info(messages.join(' '));
    } else {
      // 请求异常时使用 warn 级别记录日志
      logger.warn(messages.join(' '));
    }
    // 记录详细的请求信息日志（敏感信息会被掩码处理）
    this.logger.request(BuildRequestLogPrint(JsonMask(data)));
  }
}
