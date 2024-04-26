import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private readonly logger = new Logger('AuthGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.verbose('checking auth');

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    this.logger.verbose('extracted token', { token });

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const claims = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request['user'] = claims;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
