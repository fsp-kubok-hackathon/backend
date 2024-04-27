import { Injectable, Logger } from '@nestjs/common';
import { RecieptInfo, RecieptInfoDto } from './dto/reciept-info.dto';
import { RecieptInfoCode } from './enum/reciept-code.enum';

@Injectable()
export class RecieptCheckerService {
  private readonly logger = new Logger('RecieptCheckerService');

  private readonly baseUrl;
  private readonly apiKey;

  constructor() {
    this.baseUrl = 'https://proverkacheka.com/api/v1';
    this.apiKey = process.env.RECEIPT_CHECKER_API_KEY;
  }

  async check(imageUrl: string): Promise<RecieptInfoDto> {
    const request = {
      token: this.apiKey,
      qrurl: imageUrl,
    };

    this.logger.verbose('Checking reciept for', request);
    const response = await fetch(this.baseUrl + '/check/get', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      },
    });

    const info: RecieptInfo = await response.json();

    if (info.code !== RecieptInfoCode.SUCCESS) {
      this.logger.error('Reciept check failed', { request, response: info });
    }

    return { info, ok: info.code === RecieptInfoCode.SUCCESS };
  }
}
