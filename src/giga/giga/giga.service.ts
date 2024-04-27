import { Injectable, OnModuleInit } from '@nestjs/common';
import { GigaChat } from 'gigachat-node';

@Injectable()
export class GigaService implements OnModuleInit {
  private readonly client: GigaChat;
  private readonly model: string;
  private readonly prompt: string =
    'Отвечай как zero-shot-classifier. На мое сообщение ты должен ответить одной из категорий:';
  constructor() {
    this.client = new GigaChat(process.env.GIGA_CREDS);
    this.model = process.env.GIGA_MODEL;
  }

  async onModuleInit() {
    await this.client.createToken();
  }

  async getCategory(query: string, categories: string[]): Promise<string[]> {
    const response = await this.client.completion({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `${this.prompt} ${categories.join()}`,
        },
        {
          role: 'user',
          content: query.trim().toLowerCase(),
        },
      ],
    });

    return response.choices.map((c) => c.message.content);
  }
}
