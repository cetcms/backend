import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export function ContextHandler(context: ExecutionContext) {
  const getType = () => {
    return context.getType().toUpperCase() as 'HTTP' | 'WS' | 'RPC' | 'GRAPHQL';
  };

  const getRequest = (): Request => {
    const type = getType();
    switch (type) {
      case 'HTTP':
        return context.switchToHttp().getRequest();
      case 'RPC':
        return context.switchToRpc().getContext();
      case 'WS':
        return context.switchToWs().getClient();
      case 'GRAPHQL': {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req as Request;
      }
      default:
        throw new BadRequestException({
          message: 'Invalid request type',
          variables: { contextType: type },
        });
    }
  };

  return { getRequest, getType };
}
