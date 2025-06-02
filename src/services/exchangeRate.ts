const API_KEY = '7d4aaf09fad193ab34242556'; // You'll need to sign up for a free API key at https://www.exchangerate-api.com/
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: {
    USD: number;
    CAD: number;
  };
}

class ExchangeRateService {
  private static instance: ExchangeRateService;
  private rate: number = 0.74; // Default fallback rate
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

  private constructor() {}

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  async getExchangeRate(): Promise<number> {
    const now = Date.now();
    
    // Return cached rate if it's less than 1 hour old
    if (now - this.lastUpdate < this.CACHE_DURATION) {
      return this.rate;
    }

    try {
      const response = await fetch(`${BASE_URL}/${API_KEY}/latest/CAD`);
      const data: ExchangeRateResponse = await response.json();
      
      if (data.result === 'success') {
        this.rate = data.conversion_rates.USD;
        this.lastUpdate = now;
        return this.rate;
      }
      
      throw new Error('Failed to fetch exchange rate');
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return this.rate; // Return cached rate if fetch fails
    }
  }
}

export const exchangeRateService = ExchangeRateService.getInstance(); 