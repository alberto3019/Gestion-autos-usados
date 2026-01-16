-- Migration: Update default billing day from 1 to 5
-- This sets the default billing day for all subscriptions to the 5th of the month

-- Update existing subscriptions that have billing_day = 1 or NULL to 5
UPDATE subscriptions 
SET billing_day = 5 
WHERE billing_day IS NULL OR billing_day = 1;

-- Note: The default value in the schema is already set to 5, so new subscriptions will use 5 by default
-- This migration ensures existing subscriptions also use 5

