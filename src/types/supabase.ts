export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number
          name: string
          url: string
          imageUrl: string
          sellerUrl: string
          bid: number
          currentBid: number
          market: number
          date: string
          seller: string
          archived: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          url: string
          imageUrl: string
          sellerUrl: string
          bid: number
          currentBid: number
          market: number
          date: string
          seller: string
          archived?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          url?: string
          imageUrl?: string
          sellerUrl?: string
          bid?: number
          currentBid?: number
          market?: number
          date?: string
          seller?: string
          archived?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 