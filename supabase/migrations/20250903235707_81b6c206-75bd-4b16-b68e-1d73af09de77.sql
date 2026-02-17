-- Create Social Media category
INSERT INTO workflow_node_categories (name, display_name, description, icon, color, is_active, order_index)
VALUES ('social_media', 'Social Media', 'Social media platform integrations and automations', 'Share2', '#3b82f6', true, 0);

-- Get the category ID for social media
WITH social_category AS (
  SELECT id FROM workflow_node_categories WHERE name = 'social_media'
)
-- Insert social media node types
INSERT INTO workflow_node_types (
  type_key, display_name, description, category_id, icon, color, 
  is_active, is_draggable, is_configurable, order_index,
  default_config, input_schema, output_schema, capabilities, requirements
)
SELECT 
  type_key, display_name, description, social_category.id, icon, color,
  is_active, is_draggable, is_configurable, order_index,
  default_config::jsonb, input_schema::jsonb, output_schema::jsonb, 
  capabilities::jsonb, requirements::jsonb
FROM social_category,
(VALUES
  ('twitter_post', 'Twitter/X Post', 'Post tweets and manage Twitter/X content', 'Twitter', '#1da1f2', true, true, true, 0, 
   '{"auto_thread": false, "include_media": false}', 
   '{"text": "string", "media": "array", "reply_to": "string"}', 
   '{"success": "boolean", "tweet_id": "string", "url": "string"}',
   '["text_posting", "media_upload", "threading"]', 
   '{"api_key": "required", "access_token": "required"}'),
   
  ('twitter_monitor', 'Twitter/X Monitor', 'Monitor Twitter mentions, hashtags, and trends', 'Search', '#1da1f2', true, true, true, 1,
   '{"keywords": [], "real_time": true, "sentiment_analysis": false}',
   '{"keywords": "array", "filters": "object"}',
   '{"tweets": "array", "mentions": "array", "trends": "array"}',
   '["monitoring", "sentiment_analysis", "trend_tracking"]',
   '{"api_key": "required", "bearer_token": "required"}'),
   
  ('facebook_post', 'Facebook Post', 'Create and publish Facebook posts', 'Facebook', '#1877f2', true, true, true, 2,
   '{"page_id": "", "auto_publish": true, "schedule": null}',
   '{"message": "string", "media": "array", "link": "string"}',
   '{"success": "boolean", "post_id": "string", "url": "string"}',
   '["text_posting", "media_upload", "link_sharing"]',
   '{"access_token": "required", "page_access_token": "required"}'),
   
  ('instagram_post', 'Instagram Post', 'Share photos and stories on Instagram', 'Instagram', '#e4405f', true, true, true, 3,
   '{"story_mode": false, "auto_hashtags": true}',
   '{"caption": "string", "image": "string", "hashtags": "array"}',
   '{"success": "boolean", "media_id": "string", "url": "string"}',
   '["image_posting", "story_posting", "hashtag_generation"]',
   '{"access_token": "required", "business_account": "required"}'),
   
  ('linkedin_post', 'LinkedIn Post', 'Share professional content on LinkedIn', 'Linkedin', '#0a66c2', true, true, true, 4,
   '{"visibility": "public", "include_company_page": false}',
   '{"text": "string", "media": "array", "article_url": "string"}',
   '{"success": "boolean", "post_id": "string", "url": "string"}',
   '["professional_posting", "company_sharing", "article_sharing"]',
   '{"access_token": "required", "member_id": "required"}'),
   
  ('youtube_upload', 'YouTube Upload', 'Upload videos to YouTube channel', 'Youtube', '#ff0000', true, true, true, 5,
   '{"privacy": "private", "auto_publish": false, "category": "22"}',
   '{"title": "string", "description": "string", "video_file": "string", "thumbnail": "string"}',
   '{"success": "boolean", "video_id": "string", "url": "string"}',
   '["video_upload", "metadata_management", "thumbnail_upload"]',
   '{"api_key": "required", "oauth_token": "required"}'),
   
  ('tiktok_post', 'TikTok Post', 'Upload videos to TikTok', 'Video', '#000000', true, true, true, 6,
   '{"privacy_level": "public", "auto_caption": true}',
   '{"video": "string", "caption": "string", "hashtags": "array"}',
   '{"success": "boolean", "video_id": "string", "url": "string"}',
   '["video_posting", "auto_captions", "hashtag_suggestions"]',
   '{"access_token": "required", "open_api_key": "required"}'),
   
  ('social_scheduler', 'Social Media Scheduler', 'Schedule posts across multiple platforms', 'Calendar', '#8b5cf6', true, true, true, 7,
   '{"platforms": [], "timezone": "UTC", "optimal_timing": true}',
   '{"content": "object", "schedule_time": "string", "platforms": "array"}',
   '{"scheduled": "boolean", "job_id": "string", "platforms_scheduled": "array"}',
   '["multi_platform", "scheduling", "optimal_timing"]',
   '{"platform_tokens": "required", "scheduler_service": "required"}'),
   
  ('social_analytics', 'Social Analytics', 'Track social media performance and engagement', 'BarChart3', '#10b981', true, true, true, 8,
   '{"metrics": ["engagement", "reach", "impressions"], "period": "7d"}',
   '{"platforms": "array", "date_range": "object", "metrics": "array"}',
   '{"analytics": "object", "insights": "array", "recommendations": "array"}',
   '["analytics", "engagement_tracking", "performance_insights"]',
   '{"analytics_api": "required", "platform_access": "required"}')
) AS social_nodes(type_key, display_name, description, icon, color, is_active, is_draggable, is_configurable, order_index, default_config, input_schema, output_schema, capabilities, requirements);