/**
 * Bulk IndexNow Submitter for Spielcade
 * Pushes all active games, category hubs, alphabetical directories, and static pages
 * to IndexNow (Bing, Yandex, Seznam, Naver) in compliant 10,000 URL batches.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const INDEXNOW_HOST = 'spielcade.com';
const INDEXNOW_KEY = 'c64b58e7a6374f1797c271e89cf29bb8';
const KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
const BATCH_SIZE = 10000;

// Read .env.local
const envPath = path.resolve('.env.local');
const env = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        acc[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      return acc;
    }, {})
  : {};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchAllActiveGameSlugs() {
  console.log('Fetching all active game slugs from Supabase...');
  const slugs = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('games')
      .select('slug')
      .eq('status', 'active')
      .range(from, from + pageSize - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error querying games range ${from}-${from + pageSize}:`, error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      for (const item of data) {
        if (item.slug) slugs.push(item.slug);
      }
      from += pageSize;
      if (data.length < pageSize) {
        hasMore = false;
      }
    }
  }

  console.log(`Successfully fetched ${slugs.length} active game slugs.`);
  return slugs;
}

async function sendBatch(batchUrls, batchNum, totalBatches) {
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: batchUrls,
  };

  console.log(`Submitting Batch ${batchNum}/${totalBatches} (${batchUrls.length} URLs) to api.indexnow.org...`);

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`Batch ${batchNum} SUCCESS! HTTP ${res.status}`);
      return { success: true, count: batchUrls.length };
    } else {
      const errText = await res.text();
      console.warn(`Batch ${batchNum} returned HTTP ${res.status}: ${errText}`);
      return { success: false, status: res.status, error: errText };
    }
  } catch (err) {
    console.error(`Batch ${batchNum} network exception:`, err);
    return { success: false, error: err.message };
  }
}

async function run() {
  const gameSlugs = await fetchAllActiveGameSlugs();

  const staticUrls = [
    `https://${INDEXNOW_HOST}/`,
    `https://${INDEXNOW_HOST}/games`,
    `https://${INDEXNOW_HOST}/games/new`,
    `https://${INDEXNOW_HOST}/popular`,
    `https://${INDEXNOW_HOST}/categories`,
    `https://${INDEXNOW_HOST}/playlists`,
    `https://${INDEXNOW_HOST}/leaderboard`,
    `https://${INDEXNOW_HOST}/tournaments`,
    `https://${INDEXNOW_HOST}/quests`,
    `https://${INDEXNOW_HOST}/achievements`,
    `https://${INDEXNOW_HOST}/blog`,
    `https://${INDEXNOW_HOST}/about`,
    `https://${INDEXNOW_HOST}/developers`,
    `https://${INDEXNOW_HOST}/help`,
    `https://${INDEXNOW_HOST}/contact`,
    `https://${INDEXNOW_HOST}/privacy`,
    `https://${INDEXNOW_HOST}/terms`,
    `https://${INDEXNOW_HOST}/cookies`,
  ];

  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0-9'];
  const alphabetUrls = letters.map((l) => `https://${INDEXNOW_HOST}/games/alphabetical/${l}`);

  const gameUrls = gameSlugs.map((s) => `https://${INDEXNOW_HOST}/games/${s}`);

  const allUrls = Array.from(new Set([...staticUrls, ...alphabetUrls, ...gameUrls]));
  console.log(`Total URLs prepared for IndexNow submission: ${allUrls.length}`);

  const totalBatches = Math.ceil(allUrls.length / BATCH_SIZE);
  console.log(`Splitting into ${totalBatches} batch(es) of <= ${BATCH_SIZE} URLs...`);

  for (let i = 0; i < totalBatches; i++) {
    const chunk = allUrls.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    await sendBatch(chunk, i + 1, totalBatches);
  }

  console.log('IndexNow Bulk Transmission sequence completed.');
}

run().catch(console.error);
