export interface Item {
  id?: number;
  name: string;
  url: string;
  imageUrl: string;
  sellerUrl: string;
  seller?: string;
  bid: number;
  currentBid?: number;
  market: number; // Market value in currency (e.g., USD)
  date: string;
  archived?: boolean;
  subItems?: Item[]; // Optional array of sub-items with the same structure
  auctions?: number; // Number of auctions from the seller
} 