-- Update users to verified status (assuming the 12 users you mentioned are verified)
-- This updates all users to verified for now, but you can adjust the WHERE clause as needed
UPDATE profiles 
SET is_email_verified = true, updated_at = now() 
WHERE is_email_verified = false;