-- ==============================================================================
-- Migration: 20261104_adsense_policy_cleanup.sql
-- Description: Google AdSense & Publisher Policy Compliance Cleanup
-- 1. Sets status = 'rejected' for games infringing corporate trademarks (Mario, Minecraft, GTA, etc.)
-- 2. Sets status = 'rejected' for games with missing/empty source URLs (no content / under construction)
-- Note: Allowed statuses in schema are: ('active', 'draft', 'maintenance', 'pending', 'rejected')
-- Note: 'updated_at' column does NOT exist on 'games' table.
-- ==============================================================================

BEGIN;

-- 1. Deactivate games infringing major corporate intellectual property / trademarks
UPDATE public.games
SET status = 'rejected'
WHERE status = 'active' AND (
  title ILIKE '%mario%' OR slug ILIKE '%mario%' OR
  title ILIKE '%pokemon%' OR slug ILIKE '%pokemon%' OR
  title ILIKE '%minecraft%' OR slug ILIKE '%minecraft%' OR
  title ILIKE 'gta %' OR title ILIKE '% gta %' OR title ILIKE '% gta' OR title ILIKE 'gta' OR
  slug ILIKE 'gta-%' OR slug ILIKE '%-gta-%' OR slug ILIKE '%-gta' OR slug = 'gta' OR
  title ILIKE '%grand theft auto%' OR slug ILIKE '%grand-theft-auto%' OR
  title ILIKE '%subway surfers%' OR title ILIKE '%subway surfer%' OR slug ILIKE '%subway-surfer%' OR
  title ILIKE 'sonic %' OR title ILIKE '% sonic %' OR title ILIKE '% sonic' OR title ILIKE 'sonic' OR
  slug ILIKE 'sonic-%' OR slug ILIKE '%-sonic-%' OR slug ILIKE '%-sonic' OR slug = 'sonic' OR
  title ILIKE '%spider-man%' OR title ILIKE '%spiderman%' OR slug ILIKE '%spiderman%' OR
  title ILIKE '%batman%' OR slug ILIKE '%batman%' OR
  title ILIKE '%roblox%' OR slug ILIKE '%roblox%' OR
  title ILIKE '%among us%' OR slug ILIKE '%among-us%' OR
  title ILIKE '%fortnite%' OR slug ILIKE '%fortnite%' OR
  title ILIKE '%brawl stars%' OR slug ILIKE '%brawl-stars%' OR
  title ILIKE '%clash royale%' OR slug ILIKE '%clash-royale%' OR
  title ILIKE '%clash of clans%' OR slug ILIKE '%clash-of-clans%' OR
  title ILIKE '%pubg%' OR slug ILIKE '%pubg%' OR
  title ILIKE '%call of duty%' OR slug ILIKE '%call-of-duty%' OR
  title ILIKE '%geometry dash%' OR slug ILIKE '%geometry-dash%' OR
  title ILIKE '%five nights at freddy%' OR slug ILIKE '%five-nights-at-freddy%' OR
  title ILIKE '%fnaf%' OR slug ILIKE '%fnaf%' OR
  title ILIKE '%poppy playtime%' OR slug ILIKE '%poppy-playtime%' OR
  title ILIKE '%skibidi%' OR slug ILIKE '%skibidi%' OR
  title ILIKE '%squid game%' OR slug ILIKE '%squid-game%' OR
  title ILIKE '%angry birds%' OR slug ILIKE '%angry-birds%'
);

-- 2. Deactivate games with empty or broken source_url (excluding official built-in WebGL games)
UPDATE public.games
SET status = 'rejected'
WHERE status = 'active'
  AND (source_url IS NULL OR TRIM(source_url) = '')
  AND slug NOT IN (
    'snake',
    '2048',
    'chess',
    'minesweeper',
    'solitaire',
    'sudoku',
    'tic-tac-toe',
    'flappy-bird'
  );

COMMIT;
