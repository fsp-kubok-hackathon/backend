import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserClaims } from '../dto/user-claims.dto';

export const User = createParamDecorator(
  (key: keyof UserClaims, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    return key ? user[key] : user;
  },
);
