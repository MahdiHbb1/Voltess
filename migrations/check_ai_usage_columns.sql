-- Check ai_usage current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_usage' 
ORDER BY ordinal_position;
