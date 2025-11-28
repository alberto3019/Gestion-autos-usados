import { Controller, Get } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('usd')
  async getUsdRate() {
    const rate = await this.exchangeRateService.getUsdRate();
    const lastUpdated = await this.exchangeRateService.getLastUpdated();
    
    return {
      currency: 'USD',
      rate,
      lastUpdated,
    };
  }
}

