-- Add auctions column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS auctions integer DEFAULT 0; 