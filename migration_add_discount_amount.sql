-- Migration: Add discountAmount field to payment_records table
-- This adds support for bonuses/discounts that reduce the total payment amount

-- Add discount_amount column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_records' 
    AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE payment_records 
    ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
    
    -- Update existing records to have 0 discount
    UPDATE payment_records 
    SET discount_amount = 0 
    WHERE discount_amount IS NULL;
    
    -- Make the column NOT NULL after setting defaults
    ALTER TABLE payment_records 
    ALTER COLUMN discount_amount SET NOT NULL;
    
    -- Update total_amount for existing records that might need recalculation
    UPDATE payment_records 
    SET total_amount = GREATEST(0, amount + COALESCE(extra_amount, 0) - COALESCE(discount_amount, 0));
  END IF;
END $$;

