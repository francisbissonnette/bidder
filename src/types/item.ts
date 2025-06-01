export interface Item {
  id?: number;
  name: string;
  url: string;
  imageUrl: string;
  sellerUrl: string;
  bid: number;
  currentBid?: number;
  market: number;
  date: string;
  archived?: boolean;
  subItems?: Item[]; // Optional array of sub-items with the same structure
} 