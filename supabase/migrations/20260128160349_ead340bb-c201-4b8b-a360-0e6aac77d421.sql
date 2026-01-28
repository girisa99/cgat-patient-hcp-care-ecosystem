-- Update payment methods for each region using correct text[] array syntax
UPDATE genie_regional_pricing 
SET payment_methods = ARRAY['card', 'sepa_debit', 'ideal', 'bancontact', 'giropay', 'sofort', 'link'],
    updated_at = now()
WHERE region_code = 'europe';

UPDATE genie_regional_pricing 
SET payment_methods = ARRAY['card', 'alipay', 'wechat_pay'],
    updated_at = now()
WHERE region_code = 'cjk';

UPDATE genie_regional_pricing 
SET payment_methods = ARRAY['card', 'grabpay'],
    updated_at = now()
WHERE region_code = 'sea';

UPDATE genie_regional_pricing 
SET payment_methods = ARRAY['card', 'link'],
    updated_at = now()
WHERE region_code IN ('india', 'global');