import axios from 'axios';

interface EbayConfig {
  clientId: string;
  clientSecret: string;
  marketplaceId: string;
  environment: 'PRODUCTION' | 'SANDBOX';
}

interface EbayToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface EbaySearchParams {
  keywords: string;
  categoryId?: string;
  sort?: 'price' | 'newlyListed' | 'endingSoon';
  limit?: number;
  offset?: number;
  filters?: {
    condition?: string[];
    location?: string;
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
}

class EbayService {
  private config: EbayConfig;
  private token: EbayToken | null = null;
  private tokenExpiry: number = 0;

  constructor(config: EbayConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    // Return existing token if it's still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token.access_token;
    }

    try {
      const response = await axios.post<EbayToken>('/api/ebay/auth');
      this.token = response.data;
      this.tokenExpiry = Date.now() + ((this.token?.expires_in || 0) * 1000);
      return this.token?.access_token || '';
    } catch (error) {
      console.error('Error getting eBay access token:', error);
      throw error;
    }
  }

  async searchItems(params: EbaySearchParams): Promise<any> {
    try {
      const response = await axios.post('/api/ebay/search', params);
      return response.data;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }

  async getItemSalesHistory(itemId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `/api/ebay/item/${itemId}/sales`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': this.config.marketplaceId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching item sales history:', error);
      throw error;
    }
  }

  async getItemPriceHistory(itemId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `/api/ebay/item/${itemId}/price`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': this.config.marketplaceId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching item price history:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const ebay = new EbayService({
  clientId: process.env.NEXT_PUBLIC_EBAY_CLIENT_ID || '',
  clientSecret: process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET || '',
  marketplaceId: process.env.NEXT_PUBLIC_EBAY_MARKETPLACE_ID || 'EBAY_US',
  environment: (process.env.NEXT_PUBLIC_EBAY_ENVIRONMENT || 'SANDBOX') as 'PRODUCTION' | 'SANDBOX'
}); 