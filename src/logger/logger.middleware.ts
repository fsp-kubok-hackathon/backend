import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: () => void) {
    const { ip, method, originalUrl } = req;
    const start = new Date().getTime();

    res.on('finish', async () => {
      const { statusCode, statusMessage } = res;

      const delta = new Date().getTime() - start;

      if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(
          `${method} | ${delta}ms | ${ip} | ${statusCode} | ${originalUrl} | ${statusMessage}`,
        );
      } else {
        this.logger.log(
          `${method} | ${delta}ms | ${ip} | ${statusCode} | ${originalUrl}`,
        );
        // this.logger.verbose(await res.json());
      }
    });

    next();
  }
}
