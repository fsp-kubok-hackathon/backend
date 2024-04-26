import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private logger = new Logger('RedisService');

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    this.client = createClient({
      url: `redis://@${host}:${port}/0`,
    });
  }

  async set(key: string, value: string) {
    this.logger.verbose(`setting key`, {
      key,
      value,
    });
    return this.client.set(key, value);
  }

  async clear(key: string) {
    this.logger.verbose(`clear key`, { key });
    return this.client.del(key);
  }

  async get<T>(key: string): Promise<T> {
    const value = await this.client.get(key);
    this.logger.verbose('get value', { key, value });
    return value as T;
  }

  async onModuleInit() {
    return await this.client.connect();
  }

  async onModuleDestroy() {
    return await this.client.quit();
  }
}
