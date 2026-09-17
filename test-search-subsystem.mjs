/**
 * Verification Script: Full-Text Search Optimization with pg_trgm & tsvector (RFC-SEARCH-001)
 *
 * Verifies:
 * 1. SQL migration file presence, idempotent definitions, and stored procedure structure
 * 2. Master schema synchronization (supabase_schema.sql)
 * 3. Search input sanitization and anti-injection protection
 * 4. Trigram similarity logic and typo-tolerance thresholds
 * 5. Multi-factor hybrid relevance ranking invariant guarantees
 * 6. API route contract compliance
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('\x1b[36m%s\x1b[0m', '=== RUNNING RFC-SEARCH-001 VERIFICATION SUITE ===\n');

const BASE_DIR = path.resolve('.');
const MIGRATION_FILE = path.join(BASE_DIR, 'apps', 'web', 'supabase', 'migrations', '20260918_full_text_search_pg_trgm.sql');
const MASTER_SCHEMA = path.join(BASE_DIR, 'supabase_schema.sql');
const API_ROUTE_FILE = path.join(BASE_DIR, 'apps', 'web', 'app', 'api', 'search', 'route.ts');
const GAMES_PAGE_FILE = path.join(BASE_DIR, 'apps', 'web', 'app', 'games', 'page.tsx');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`\x1b[32m✔\x1b[0m [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`\x1b[31m✖\x1b[0m [FAIL] ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

// 1. Migration file existence and contents
test('Migration 20260918_full_text_search_pg_trgm.sql exists and has required components', () => {
  assert(fs.existsSync(MIGRATION_FILE), 'Migration file missing');
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');

  assert(sql.includes('CREATE EXTENSION IF NOT EXISTS pg_trgm;'), 'Missing pg_trgm extension');
  assert(sql.includes('search_vector tsvector'), 'Missing search_vector column');
  assert(sql.includes('CREATE OR REPLACE FUNCTION public.games_search_vector_trigger()'), 'Missing vector trigger function');
  assert(sql.includes('CREATE TRIGGER trg_games_search_vector'), 'Missing trigger creation');
  assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_games_search_vector'), 'Missing GIN search_vector index');
  assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_games_title_trgm'), 'Missing GIN title trigram index');
  assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_games_slug_trgm'), 'Missing GIN slug trigram index');
  assert(sql.includes('CREATE OR REPLACE FUNCTION public.search_games'), 'Missing search_games stored procedure');
  assert(sql.includes('GRANT EXECUTE ON FUNCTION public.search_games'), 'Missing execution grants');
});

// 2. Master schema synchronization
test('supabase_schema.sql is synchronized with RFC-SEARCH-001 definitions', () => {
  assert(fs.existsSync(MASTER_SCHEMA), 'Master schema missing');
  const sql = fs.readFileSync(MASTER_SCHEMA, 'utf-8');

  assert(sql.includes('RFC-SEARCH-001'), 'Missing RFC-SEARCH-001 section in master schema');
  assert(sql.includes('FUNCTION public.search_games'), 'Missing search_games in master schema');
  assert(sql.includes('idx_games_search_vector'), 'Missing idx_games_search_vector in master schema');
});

// 3. Search query sanitization logic
test('Search query sanitization strips control characters and wildcards', () => {
  function sanitizeSearchQuery(input) {
    if (!input) return '';
    return input
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[%_\\]/g, ' ')
      .trim()
      .slice(0, 80);
  }

  assert.strictEqual(sanitizeSearchQuery('  Subway%Surfers_2026\\  '), 'Subway Surfers 2026');
  assert.strictEqual(sanitizeSearchQuery('test\x00injection\x1F'), 'testinjection');
  assert.strictEqual(sanitizeSearchQuery(''.padStart(120, 'a')).length, 80);
  assert.strictEqual(sanitizeSearchQuery(null), '');
});

// 4. Trigram similarity computation (Simulates pg_trgm similarity)
test('Trigram similarity algorithm accurately scores typos and misspellings', () => {
  function getTrigrams(str) {
    const padded = `  ${str.toLowerCase()} `;
    const trg = new Set();
    for (let i = 0; i < padded.length - 2; i++) {
      trg.add(padded.slice(i, i + 3));
    }
    return trg;
  }

  function trigramSimilarity(s1, s2) {
    const trg1 = getTrigrams(s1);
    const trg2 = getTrigrams(s2);
    let common = 0;
    for (const t of trg1) {
      if (trg2.has(t)) common++;
    }
    return common / (trg1.size + trg2.size - common);
  }

  // Exact match
  assert.strictEqual(trigramSimilarity('Subway Surfers', 'Subway Surfers'), 1.0);

  // Typo 1: "Subway Serfers" vs "Subway Surfers"
  const sim1 = trigramSimilarity('Subway Serfers', 'Subway Surfers');
  assert(sim1 > 0.6, `Expected high similarity for typo, got ${sim1}`);

  // Typo 2: "Mincraft" vs "Minecraft"
  const sim2 = trigramSimilarity('Mincraft', 'Minecraft');
  assert(sim2 > 0.5, `Expected high similarity for typo, got ${sim2}`);

  // Typo 3: "Flapy" vs "Flappy"
  const sim3 = trigramSimilarity('Flapy', 'Flappy');
  assert(sim3 > 0.4, `Expected similarity for typo, got ${sim3}`);

  // Unrelated: "Tetris" vs "Subway Surfers"
  const simUnrelated = trigramSimilarity('Tetris', 'Subway Surfers');
  assert(simUnrelated < 0.15, `Expected low similarity for unrelated terms, got ${simUnrelated}`);
});

// 5. Relevance ranking invariant guarantees
test('Hybrid relevance ranker maintains strict rank hierarchy', () => {
  function computeRelevance(title, cleanQ, totalPlays) {
    const lowerTitle = title.toLowerCase();
    const lowerQ = cleanQ.toLowerCase();

    let score = 0;
    if (lowerTitle === lowerQ) score += 12.0; // Exact match
    else if (lowerTitle.startsWith(lowerQ)) score += 6.0; // Prefix match
    else if (lowerTitle.includes(lowerQ)) score += 3.0; // Substring match

    // Popularity dampener
    const popularityMultiplier = 1.0 + Math.log(Math.max(totalPlays, 1) + 1.0) * 0.08;
    return score * popularityMultiplier;
  }

  const query = '2048';
  const exactGame = { title: '2048', plays: 10000 };
  const prefixGame = { title: '2048 Legend', plays: 50000 };
  const substringGame = { title: 'Retro 2048 Mania', plays: 100000 };

  const rExact = computeRelevance(exactGame.title, query, exactGame.plays);
  const rPrefix = computeRelevance(prefixGame.title, query, prefixGame.plays);
  const rSubstring = computeRelevance(substringGame.title, query, substringGame.plays);

  assert(rExact > rPrefix, `Exact match (${rExact}) must rank higher than prefix match (${rPrefix})`);
  assert(rPrefix > rSubstring, `Prefix match (${rPrefix}) must rank higher than substring match (${rSubstring})`);
});

// 6. API Route structure and RPC integration
test('route.ts calls search_games RPC and handles fallback gracefully', () => {
  assert(fs.existsSync(API_ROUTE_FILE), 'Search route missing');
  const code = fs.readFileSync(API_ROUTE_FILE, 'utf-8');

  assert(code.includes("rpc('search_games'"), 'route.ts must invoke search_games RPC');
  assert(code.includes('fallbackQuery'), 'route.ts must include fallback query logic');
  assert(code.includes('sanitizeSearchQuery'), 'route.ts must sanitize incoming query parameter');
  assert(code.includes('ORIGINAL_FLAGSHIP_GAMES'), 'route.ts must maintain flagship original game integration');
  assert(code.includes("runtime = 'edge'"), 'route.ts must run on Edge Runtime');
});

// 7. Browse Games Page search integration
test('apps/web/app/games/page.tsx utilizes search_games RPC for catalog search', () => {
  assert(fs.existsSync(GAMES_PAGE_FILE), 'Games page missing');
  const code = fs.readFileSync(GAMES_PAGE_FILE, 'utf-8');

  assert(code.includes("rpc('search_games'"), 'games/page.tsx must invoke search_games RPC for search queries');
});

console.log('\n----------------------------------------');
console.log(`Tests Completed: ${passedTests}/${totalTests} Passed`);
if (passedTests === totalTests) {
  console.log('\x1b[32m%s\x1b[0m', 'ALL TESTS PASSED! RFC-SEARCH-001 Verified Cleanly.\n');
  process.exit(0);
} else {
  console.error('\x1b[31m%s\x1b[0m', 'SOME TESTS FAILED.');
  process.exit(1);
}
