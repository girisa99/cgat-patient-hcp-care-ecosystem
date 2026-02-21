
-- Fix estimated_size_mb for styles that have 0
UPDATE public.cast_visual_styles SET estimated_size_mb = 90 WHERE name = 'pixar_disney_character';
UPDATE public.cast_visual_styles SET estimated_size_mb = 55 WHERE name = 'cartoon_chibi_2d';
UPDATE public.cast_visual_styles SET estimated_size_mb = 95 WHERE name = 'anime_ukiyo_e';
UPDATE public.cast_visual_styles SET estimated_size_mb = 40 WHERE name = 'flat_illustration';
UPDATE public.cast_visual_styles SET estimated_size_mb = 60 WHERE name = 'isometric_3d';
UPDATE public.cast_visual_styles SET estimated_size_mb = 100 WHERE name = 'realistic_stylized';
UPDATE public.cast_visual_styles SET estimated_size_mb = 25 WHERE name = 'whiteboard';
UPDATE public.cast_visual_styles SET estimated_size_mb = 50 WHERE name = 'comic_book';
