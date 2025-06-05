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
    // Helper function to remove Chinese characters
    const removeChineseCharacters = (text: string): string => {
      // Remove Chinese characters (Unicode range for Chinese characters)
      return text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\uff00-\uffef]/g, '')
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Trim spaces
        .trim();
    };

    // Card Hobby Scraper
    this.scrapers.set('cardhobby', {
      name: 'Card Hobby',
      urlPattern: /cardhobby\.com\/#\/carddetails\/\d+/,
      rateLimit: {
        maxRequests: 10,
        timeWindow: 1000 * 60 // 1 minute
      },
      validateData: (data: any) => {
        console.log('🔍 [Scraper] Validating Card Hobby data:', data);
        const isValid = data?.data?.TitImg != null && 
               typeof data?.data?.USD_Price === 'string' &&
               typeof data?.data?.Title === 'string';
        console.log('✅ [Scraper] Validation result:', isValid);
        return isValid;
      },
      extractData: async (url: string, data: any) => {
        console.log('🔍 [Scraper] Extracting Card Hobby data:', data);
        console.log('🔍 [Scraper] Full API response structure:', JSON.stringify(data, null, 2));
        console.log('🔍 [Scraper] Data object keys:', Object.keys(data.data || {}));
        
        const imageUrl = data.data?.TitImg || '';
        const currentBid = parseFloat(data.data?.USD_Price) || 0;
        const bid = parseFloat(data.data?.USD_HighestPrice) || 0;
        const rawTitle = data.data?.Title || 'Unknown Item';
        console.log('📝 [Scraper] Raw title:', rawTitle);
        
        const name = removeChineseCharacters(rawTitle);
        console.log('📝 [Scraper] Cleaned title:', name);
        
        const sellerUrl = data.data?.SellRealName ? `https://www.cardhobby.com/#/shop/${data.data.SellRealName}` : window.location.origin;

        // Get the date from EffectiveTime
        let formattedDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
        if (data.data?.EffectiveTime) {
          console.log('📅 [Scraper] Raw EffectiveTime:', data.data.EffectiveTime);
          // Parse the date string (format: "2025/6/5 20:23:30")
          const [datePart, timePart] = data.data.EffectiveTime.split(' ');
          const [year, month, day] = datePart.split('/');
          const [hours, minutes] = timePart.split(':');
          
          // Subtract 12 hours
          let adjustedHours = parseInt(hours) - 12;
          if (adjustedHours < 0) {
            adjustedHours += 24;
          }
          
          // Format as YYYY-MM-DDThh:mm
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(adjustedHours).padStart(2, '0')}:${minutes}`;
          console.log('📅 [Scraper] Formatted date (12h subtracted):', formattedDate);
        } else {
          console.log('⚠️ [Scraper] No EffectiveTime found in response');
        }

        const result = {
          name,
          url,
          imageUrl,
          sellerUrl,
          bid,
          currentBid,
          market: 0,
          date: formattedDate,
        };
        console.log('✅ [Scraper] Extracted data:', result);
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
    console.log('🔍 [Scraper] Starting Card Hobby scrape for URL:', url);
    // Extract card ID from URL like https://www.cardhobby.com/#/carddetails/67180979
    const cardId = url.match(/carddetails\/(\d+)/)?.[1];
    if (!cardId) {
      console.error('❌ [Scraper] Invalid URL format - could not extract card ID');
      throw new Error('Invalid URL format');
    }
    console.log('✅ [Scraper] Extracted card ID:', cardId);

    await this.waitForRateLimit('cardhobby');

    // Get the specific card details using the direct API endpoint
    const apiUrl = `https://gatewayapi.cardhobby.com/card/Commodity/DetailCommodity/?memberid=499559&token=b9e22c0e118ce211f9611a818cc5c0b0&operator_id=499559&CommodityID=${cardId}&buyerSource=CA&lag=en&device=Web&version=1&appname=Card+Hobby`;
    console.log('🌐 [Scraper] Fetching card details from:', apiUrl);
    
    try {
      console.log('📡 [Scraper] Sending API request...');
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
        console.error('❌ [Scraper] API request failed with status:', response.status);
        if (response.status === 404) {
          throw new Error('Card not found. Please verify the card ID is correct.');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      console.log('✅ [Scraper] API request successful, parsing response...');
      const data = await response.json();
      console.log('📦 [Scraper] Raw API response:', data);

      // Check if the response contains valid data
      if (!data?.data) {
        console.error('❌ [Scraper] Invalid response format - missing data field');
        throw new Error('Invalid response format from API');
      }

      console.log('✅ [Scraper] Successfully parsed API response');
      return data;
    } catch (error) {
      console.error('❌ [Scraper] Error fetching card details:', error);
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

export const scraper = ScraperService.getInstance(); 