-- Switch all 1,095 entries from weekly to monthly refresh cadence (75% cost reduction)
UPDATE regional_content_cache 
SET refresh_cadence = 'monthly',
    next_refresh_at = last_refreshed_at::timestamp + interval '30 days'
WHERE refresh_cadence = 'weekly';