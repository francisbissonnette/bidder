import { Item } from '@/types/item';

interface ScraperConfig {
  name: string;
  urlPattern: RegExp;
  extractData: (url: string, data: any) => Promise<Omit<Item, 'id'>>;
}

class ScraperService {
  private static instance: ScraperService;
  private scrapers: Map<string, ScraperConfig> = new Map();

  private constructor() {
    this.initializeScrapers();
  }

  private initializeScrapers() {
    // Card Hobby Scraper
    this.scrapers.set('cardhobby', {
      name: 'Card Hobby',
      urlPattern: /cardhobby\.com\.cn/,
      extractData: async (url: string, data: any) => {
        const imageUrl = data.data?.imageUrl || '';
        const currentBid = data.data?.price || 0;
        const name = data.data?.title || 'Unknown Item';
        const sellerUrl = data.data?.sellerUrl || window.location.origin;

        return {
          name,
          url,
          imageUrl,
          sellerUrl,
          bid: 0,
          currentBid,
          market: 0,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      }
    });

    // Add more scrapers here as needed
  }

  static getInstance(): ScraperService {
    if (!ScraperService.instance) {
      ScraperService.instance = new ScraperService();
    }
    return ScraperService.instance;
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  private async handleCardHobbyScrape(url: string): Promise<any> {
    const cardId = url.split('/').pop();
    if (!cardId) {
      throw new Error('Invalid URL format');
    }

    // First, negotiate with the SignalR hub
    const negotiateUrl = `https://socket.cardhobby.com.cn/hubs/negotiate?cId=${cardId}`;
    const negotiateResponse = await this.fetchWithTimeout(negotiateUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'text/plain;charset=UTF-8',
        'Origin': 'https://www.cardhobby.com',
        'Referer': 'https://www.cardhobby.com/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!negotiateResponse.ok) {
      throw new Error(`SignalR negotiation failed: ${negotiateResponse.status}`);
    }

    const negotiateData = await negotiateResponse.json();

    // Get the specific card details
    const apiUrl = `https://gatewayapi.cardhobby.com/card/NewMyCommodity/GetCardDetail?cardId=${cardId}&lag=en&device=Web&version=1&appname=Card+Hobby`;
    const response = await this.fetchWithTimeout(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.cardhobby.com',
        'Referer': 'https://www.cardhobby.com/'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async scrapeItem(url: string): Promise<Omit<Item, 'id'>> {
    try {
      // Find the appropriate scraper for the URL
      const scraper = Array.from(this.scrapers.values()).find(s => s.urlPattern.test(url));
      
      if (!scraper) {
        throw new Error('No scraper available for this URL');
      }

      let data;
      if (scraper.name === 'Card Hobby') {
        data = await this.handleCardHobbyScrape(url);
      } else {
        throw new Error('Unsupported website');
      }

      // Extract data using the scraper's extractData function
      return await scraper.extractData(url, data);
    } catch (error) {
      console.error('Error scraping item:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to scrape item details: ${error.message}`);
      }
      throw new Error('Failed to scrape item details');
    }
  }
}

export const scraperService = ScraperService.getInstance(); 