import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export function ContextHandler(context: ExecutionContext) {
  const getRequest = (): Request => {
    switch (context.getType()) {
      case 'http':
        return context.switchToHttp().getRequest();
      case 'rpc':
        return context.switchToRpc().getContext();
      case 'ws':
        return context.switchToWs().getClient();
      default:
        if (String(context.getType()) === 'graphql') {
          const ctx = GqlExecutionContext.create(context);
          return ctx.getContext().req as Request;
        }
        throw new BadRequestException({
          message: 'Invalid request type',
          variables: { contextType: context.getType() },
        });
    }
  };

  return { getRequest };
}
