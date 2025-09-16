import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JsonMask, Logger } from 'src/common';
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
      id: uuid(),                           // 日志唯一标识
      recordAt: new Date(),                 // 记录时间
      createdAt: new Date(),                // 创建时间
      updatedAt: new Date(),                // 更新时间
      route: req.getRoute(),                // 请求路由
      method: type === 'GRAPHQL' ? type : req.getMethod(), // 请求方法
      ip: req.getIp(),                      // 客户端IP
      subject: context.getClass().name,     // 请求处理类名
      action: context.getHandler().name,    // 请求处理方法名
      query: req.getQuery(),                // 查询参数
      language: req.getLanguage(),          // 请求语言
      fingerprint: req.getFingerprint(),    // 设备指纹
      device: req.getDevice(),              // 设备信息
      location: req.getLocation(),          // 位置信息
      target: auth?.target || null,         // 认证目标
      userId: auth?.userId || null,         // 用户ID
      adminId: auth?.adminId || null,       // 管理员ID
      companyId: auth?.companyId || null,   // 公司ID
      beforeAt: new Date(),                 // 请求开始时间
      afterAt: null,                        // 请求结束时间（初始为空）
      headers: req.getHeaders(),            // 请求头信息
      body: req.getBody(),                  // 请求体数据
      params: req.getParams(),              // 路径参数
      duration: 0n,                         // 请求处理耗时（初始为0）
    };

    // 构建日志消息数组
    const messages: string[] = [];
    messages.push(`[${data.method}]`);              // 添加请求方法
    messages.push(`[${data.action}]`);              // 添加处理方法名
    messages.push(`[${data.ip}]`);                  // 添加客户端IP
    messages.push(`[${data.language}]`);            // 添加语言信息
    messages.push(`[${data.route}]`);               // 添加路由信息
    messages.push(`[${data.target}:${data.userId || data.adminId}]`); // 添加认证信息
    // 如果存在公司ID，则添加公司ID信息
    if (data.companyId) {
      messages.push(`[${data.companyId}]`);
    }

    // 记录请求开始日志
    Logger.setContext(data.subject || LoggingInterceptor.name).info(messages.join(''));
    // 记录详细的请求信息日志（敏感信息会被掩码处理）
    this.logger.request(JsonMask(data));

    // 继续执行后续逻辑，并在完成后记录结束时间
    return next.handle().pipe(
      tap(() => {
        data.afterAt = new Date();                                    // 设置请求结束时间
        data.duration = BigInt(data.afterAt.getTime() - data.beforeAt.getTime()); // 计算处理耗时
      })
    );
  }
}