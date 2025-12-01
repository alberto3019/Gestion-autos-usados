import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as https from 'https';

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateService.name);
  private usdToArs: number = 1425; // Valor por defecto inicial (dólar blue)
  private lastUpdated: Date = new Date();

  async getUsdRate(): Promise<number> {
    return this.usdToArs;
  }

  async getLastUpdated(): Promise<Date> {
    return this.lastUpdated;
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async updateExchangeRate() {
    try {
      this.logger.log('Actualizando tipo de cambio...');
      
      // Usar https nativo para hacer la petición
      const url = 'https://dolarapi.com/v1/dolares/blue';
      
      const data = await new Promise<any>((resolve, reject) => {
        https.get(url, (res) => {
          let body = '';
          
          res.on('data', (chunk) => {
            body += chunk;
          });
          
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                resolve(JSON.parse(body));
              } else {
                reject(new Error(`HTTP error! status: ${res.statusCode}`));
              }
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', (err) => {
          reject(err);
        });
      });
      
      const newRate = data.venta; // Precio de venta del dólar blue
      
      if (newRate && newRate > 0) {
        this.usdToArs = newRate;
        this.lastUpdated = new Date();
        this.logger.log(`Tipo de cambio actualizado: 1 USD = ${this.usdToArs} ARS`);
      } else {
        this.logger.warn('Respuesta inválida de la API de dólar');
      }
    } catch (error) {
      this.logger.error('Error al actualizar tipo de cambio:', error);
      // Mantener el valor anterior en caso de error
    }
  }

  // Método para inicializar el tipo de cambio al iniciar la aplicación
  async onModuleInit() {
    this.logger.log('Inicializando servicio de tipo de cambio...');
    await this.updateExchangeRate();
  }

  // Método para convertir cualquier monto a ARS
  convertToArs(amount: number, currency: string): number {
    if (currency === 'ARS') {
      return amount;
    } else if (currency === 'USD') {
      return amount * this.usdToArs;
    } else if (currency === 'EUR') {
      // Para EUR podríamos usar otra API o un valor fijo
      return amount * this.usdToArs * 1.1; // Aproximación
    }
    return amount;
  }
}

