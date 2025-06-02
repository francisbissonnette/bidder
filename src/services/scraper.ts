import { Item } from '@/types/item';

interface ScraperConfig {
  name: string;
  urlPattern: RegExp;
  extractData: (url: string, data: any) => Promise<Omit<Item, 'id'>>;
  validateData: (data: any) => boolean;
  rateLimit?: {
    maxRequests: number;
    timeWindow: number; // in milliseconds
  };
}

interface CacheEntry {
  data: Omit<Item, 'id'>;
  timestamp: number;
}

class ScraperService {
  private static instance: ScraperService;
  private scrapers: Map<string, ScraperConfig> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private requestCounts: Map<string, number[]> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {
    this.initializeScrapers();
  }

  private initializeScrapers() {
    // Card Hobby Scraper
    this.scrapers.set('cardhobby', {
      name: 'Card Hobby',
      urlPattern: /cardhobby\.com\/#\/carddetails\/\d+/,
      rateLimit: {
        maxRequests: 10,
        timeWindow: 1000 * 60 // 1 minute
      },
      validateData: (data: any) => {
        console.log('Validating Card Hobby data:', data);
        const isValid = data?.data?.imageUrl != null && 
               typeof data?.data?.price === 'number' &&
               typeof data?.data?.title === 'string';
        console.log('Validation result:', isValid);
        return isValid;
      },
      extractData: async (url: string, data: any) => {
        console.log('Extracting Card Hobby data:', data);
        const imageUrl = data.data?.imageUrl || '';
        const currentBid = data.data?.price || 0;
        const name = data.data?.title || 'Unknown Item';
        const sellerUrl = data.data?.sellerUrl || window.location.origin;

        const result = {
          name,
          url,
          imageUrl,
          sellerUrl,
          bid: 0,
          currentBid,
          market: 0,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        console.log('Extracted data:', result);
        return result;
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

  private async waitForRateLimit(scraperName: string): Promise<void> {
    const scraper = this.scrapers.get(scraperName);
    if (!scraper?.rateLimit) return;

    const now = Date.now();
    const requests = this.requestCounts.get(scraperName) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < scraper.rateLimit!.timeWindow);
    
    if (validRequests.length >= scraper.rateLimit!.maxRequests) {
      const oldestRequest = validRequests[0];
      const waitTime = oldestRequest + scraper.rateLimit!.timeWindow - now;
      console.log(`Rate limit reached for ${scraperName}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Update request count
    this.requestCounts.set(scraperName, [...validRequests, now]);
  }

  private async fetchWithRetry(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`Fetch attempt ${attempt + 1} for ${url}`);
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(id);
        console.log(`Fetch successful for ${url}, status: ${response.status}`);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`Fetch attempt ${attempt + 1} failed:`, error);
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.RETRY_DELAY * Math.pow(2, attempt);
          console.log(`Waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to fetch after retries');
  }

  private async handleCardHobbyScrape(url: string): Promise<any> {
    console.log('Starting Card Hobby scrape for URL:', url);
    // Extract card ID from URL like https://www.cardhobby.com/#/carddetails/67180979
    const cardId = url.match(/carddetails\/(\d+)/)?.[1];
    if (!cardId) {
      throw new Error('Invalid URL format');
    }
    console.log('Extracted card ID:', cardId);

    await this.waitForRateLimit('cardhobby');

    // Get the specific card details using the direct API endpoint
    const apiUrl = `https://gatewayapi.cardhobby.com/card/NewMyCommodity/GetCardDetail?cardId=${cardId}&lag=en&device=Web&version=1&appname=Card+Hobby`;
    console.log('Fetching card details from:', apiUrl);
    
    try {
      const response = await this.fetchWithRetry(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000',
          'Referer': 'http://localhost:3000/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:139.0) Gecko/20100101 Firefox/139.0',
          'Accept-Language': 'en-CA,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Card not found. Please verify the card ID is correct.');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Card details response:', data);

      // Check if the response contains valid data
      if (!data?.data) {
        throw new Error('Invalid response format from API');
      }

      return data;
    } catch (error) {
      console.error('Error fetching card details:', error);
      throw error;
    }
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  async scrapeItem(url: string): Promise<Omit<Item, 'id'>> {
    console.log('Starting scrape for URL:', url);
    try {
      // Check cache first
      const cachedEntry = this.cache.get(url);
      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        console.log('Returning cached data for:', url);
        return cachedEntry.data;
      }

      // Find the appropriate scraper for the URL
      const scraper = Array.from(this.scrapers.values()).find(s => s.urlPattern.test(url));
      
      if (!scraper) {
        console.error('No scraper found for URL:', url);
        throw new Error('No scraper available for this URL');
      }

      console.log('Found scraper:', scraper.name);

      let data;
      if (scraper.name === 'Card Hobby') {
        data = await this.handleCardHobbyScrape(url);
      } else {
        console.error('Unsupported website:', url);
        throw new Error('Unsupported website');
      }

      // Validate the data
      if (!scraper.validateData(data)) {
        console.error('Invalid data received:', data);
        throw new Error('Invalid data received from scraper');
      }

      // Extract data using the scraper's extractData function
      const extractedData = await scraper.extractData(url, data);

      // Cache the result
      this.cache.set(url, {
        data: extractedData,
        timestamp: Date.now()
      });

      console.log('Successfully scraped and cached data for:', url);
      return extractedData;
    } catch (error) {
      console.error('Error scraping item:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to scrape item details: ${error.message}`);
      }
      throw new Error('Failed to scrape item details');
    }
  }

  // Method to clear cache for a specific URL or all URLs
  clearCache(url?: string): void {
    if (url) {
      this.cache.delete(url);
      console.log('Cleared cache for URL:', url);
    } else {
      this.cache.clear();
      console.log('Cleared all cache');
    }
  }
}

export const scraperService = ScraperService.getInstance(); 