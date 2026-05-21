import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;
    return request.headers['user-agent'];
  },
);
