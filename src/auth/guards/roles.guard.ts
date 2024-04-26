import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_METADATA } from '../decorators/auth.decorator';
import { UserClaims } from '../dto/user-claims.dto';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger('RoleGuard');

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      this.logger.verbose('roles dont specified');
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request['user'] as UserClaims;

    this.logger.verbose('checking role permissions', {
      requiredRoles,
      userRole: user.role,
    });
    return requiredRoles.includes(user.role);
  }
}
