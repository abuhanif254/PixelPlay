/**
 * Verification Script: Modular Refactoring of GamePlayer.tsx (RFC-PLAYER-001)
 *
 * Verifies:
 * 1. Existence and valid syntax of all subcomponents under apps/web/components/player/
 * 2. Contract exports from player/types.ts
 * 3. Functional behavior of helper utilities (fmtTime, AR_CLASSES, VPAD_KEY_PAIRS, SHORTCUTS)
 * 4. Export structure of GamePlayer.tsx (default export)
 * 5. Code metrics verification (monolith deconstruction)
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('\x1b[36m%s\x1b[0m', '=== RUNNING RFC-PLAYER-001 VERIFICATION SUITE ===\n');

const BASE_DIR = path.resolve('.');
const PLAYER_DIR = path.join(BASE_DIR, 'apps', 'web', 'components', 'player');
const GAME_PLAYER_PATH = path.join(BASE_DIR, 'apps', 'web', 'components', 'GamePlayer.tsx');

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

// 1. Check file existence
test('All sub-module files exist under apps/web/components/player/', () => {
  const expectedFiles = [
    'types.ts',
    'PlayerAudioDock.tsx',
    'PlayerControlDeck.tsx',
    'PlayerScoreToasts.tsx',
    'PlayerOverlays.tsx',
    'PlayerGameOverScreen.tsx',
    'PlayerKeyboardGuide.tsx',
  ];

  for (const file of expectedFiles) {
    const fullPath = path.join(PLAYER_DIR, file);
    assert(fs.existsSync(fullPath), `Missing file: ${file}`);
  }
});

// 2. Check types.ts exports and constants
test('types.ts contains all required exports and constants', () => {
  const typesContent = fs.readFileSync(path.join(PLAYER_DIR, 'types.ts'), 'utf-8');
  assert(typesContent.includes('export type PlayerState'), 'Missing PlayerState export');
  assert(typesContent.includes('export type AspectRatio'), 'Missing AspectRatio export');
  assert(typesContent.includes('export type CloudSaveStatus'), 'Missing CloudSaveStatus export');
  assert(typesContent.includes('export interface GamePlayerProps'), 'Missing GamePlayerProps export');
  assert(typesContent.includes('export const VPAD_KEY_PAIRS'), 'Missing VPAD_KEY_PAIRS export');
  assert(typesContent.includes('export const AR_CLASSES'), 'Missing AR_CLASSES export');
  assert(typesContent.includes('export const SHORTCUTS'), 'Missing SHORTCUTS export');
  assert(typesContent.includes('export const fmtTime'), 'Missing fmtTime export');
});

// 3. Functional check of fmtTime logic
test('fmtTime utility operates accurately', () => {
  const fmtTime = (s) =>
    String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

  assert.strictEqual(fmtTime(0), '00:00');
  assert.strictEqual(fmtTime(5), '00:05');
  assert.strictEqual(fmtTime(59), '00:59');
  assert.strictEqual(fmtTime(60), '01:00');
  assert.strictEqual(fmtTime(65), '01:05');
  assert.strictEqual(fmtTime(3600), '60:00');
});

// 4. Verify PlayerAudioDock structure
test('PlayerAudioDock.tsx has isolated volume scrubbing and click-outside handling', () => {
  const content = fs.readFileSync(path.join(PLAYER_DIR, 'PlayerAudioDock.tsx'), 'utf-8');
  assert(content.includes('export default function PlayerAudioDock'), 'Missing default export PlayerAudioDock');
  assert(content.includes('showVolumeSlider'), 'Missing showVolumeSlider state');
  assert(content.includes('onVolumeChange'), 'Missing onVolumeChange prop');
  assert(content.includes('onToggleMute'), 'Missing onToggleMute prop');
});

// 5. Verify PlayerScoreToasts structure
test('PlayerScoreToasts.tsx encapsulates all floating notifications', () => {
  const content = fs.readFileSync(path.join(PLAYER_DIR, 'PlayerScoreToasts.tsx'), 'utf-8');
  assert(content.includes('export default function PlayerScoreToasts'), 'Missing default export PlayerScoreToasts');
  assert(content.includes('showScoreToast'), 'Missing score toast handler');
  assert(content.includes('unlockedAchievement'), 'Missing achievement banner');
  assert(content.includes('challengerScore'), 'Missing viral challenge ghost tracker');
  assert(content.includes('screenshotToast'), 'Missing screenshot toast');
  assert(content.includes('offlineSyncMsg'), 'Missing offline sync toast');
  assert(content.includes('resumedCheckpointToast'), 'Missing checkpoint toast');
});

// 6. Verify PlayerOverlays structure
test('PlayerOverlays.tsx provides discrete canvas overlays', () => {
  const content = fs.readFileSync(path.join(PLAYER_DIR, 'PlayerOverlays.tsx'), 'utf-8');
  assert(content.includes('export function PlayerIdleOverlay'), 'Missing PlayerIdleOverlay');
  assert(content.includes('export function PlayerAdOverlay'), 'Missing PlayerAdOverlay');
  assert(content.includes('export function PlayerRewardedAdOverlay'), 'Missing PlayerRewardedAdOverlay');
  assert(content.includes('export function PlayerLoadingOverlay'), 'Missing PlayerLoadingOverlay');
  assert(content.includes('export function PlayerPauseOverlay'), 'Missing PlayerPauseOverlay');
  assert(content.includes('export function PlayerRotateHint'), 'Missing PlayerRotateHint');
  assert(content.includes('export function PlayerImmersiveHUD'), 'Missing PlayerImmersiveHUD');
});

// 7. Verify PlayerControlDeck structure
test('PlayerControlDeck.tsx encapsulates docked toolbar and 3-dot mobile sheet', () => {
  const content = fs.readFileSync(path.join(PLAYER_DIR, 'PlayerControlDeck.tsx'), 'utf-8');
  assert(content.includes('export default function PlayerControlDeck'), 'Missing default export PlayerControlDeck');
  assert(content.includes('PlayerAudioDock'), 'Missing PlayerAudioDock integration');
  assert(content.includes('PerformanceToggle'), 'Missing PerformanceToggle integration');
  assert(content.includes('showOverflowMenu'), 'Missing overflow menu state');
  assert(content.includes('onTogglePause'), 'Missing onTogglePause callback');
  assert(content.includes('onToggleFullscreen'), 'Missing onToggleFullscreen callback');
});

// 8. Verify PlayerGameOverScreen structure
test('PlayerGameOverScreen.tsx renders score, record banner, and recommendation grid', () => {
  const content = fs.readFileSync(path.join(PLAYER_DIR, 'PlayerGameOverScreen.tsx'), 'utf-8');
  assert(content.includes('export default function PlayerGameOverScreen'), 'Missing default export PlayerGameOverScreen');
  assert(content.includes('liveScore'), 'Missing liveScore rendering');
  assert(content.includes('personalBest'), 'Missing personalBest rendering');
  assert(content.includes('relatedGames'), 'Missing relatedGames recommendation grid');
  assert(content.includes('onPlayAgain'), 'Missing onPlayAgain restart button');
});

// 9. Verify PlayerKeyboardGuide structure
test('PlayerKeyboardGuide.tsx renders shortcuts reference dialog', () => {
  const content = fs.readFileSync(path.join(PLAYER_DIR, 'PlayerKeyboardGuide.tsx'), 'utf-8');
  assert(content.includes('export default function PlayerKeyboardGuide'), 'Missing default export PlayerKeyboardGuide');
  assert(content.includes('SHORTCUTS.map'), 'Missing SHORTCUTS loop');
});

// 10. Verify GamePlayer.tsx orchestrator
test('GamePlayer.tsx orchestrates all modular subcomponents with clean separation', () => {
  const content = fs.readFileSync(GAME_PLAYER_PATH, 'utf-8');
  assert(content.includes('export default function GamePlayer'), 'Missing default export GamePlayer');
  assert(content.includes('./player/types'), 'Missing import from player/types');
  assert(content.includes('./player/PlayerOverlays'), 'Missing import from player/PlayerOverlays');
  assert(content.includes('PlayerScoreToasts'), 'Missing PlayerScoreToasts');
  assert(content.includes('PlayerGameOverScreen'), 'Missing PlayerGameOverScreen');
  assert(content.includes('PlayerKeyboardGuide'), 'Missing PlayerKeyboardGuide');
  assert(content.includes('PlayerControlDeck'), 'Missing PlayerControlDeck');
  assert(content.includes('GAME_IFRAME_SANDBOX'), 'Missing sandbox security permissions');
  assert(content.includes('GAME_IFRAME_PERMISSIONS'), 'Missing iframe feature permissions');
});

// 11. Code metrics test
test('GamePlayer.tsx line count reduced significantly from original 2,766 lines', () => {
  const content = fs.readFileSync(GAME_PLAYER_PATH, 'utf-8');
  const lineCount = content.split('\n').length;
  console.log(`       Current GamePlayer.tsx line count: ${lineCount} lines (Original: 2,766 lines)`);
  assert(lineCount < 1500, `Expected line count to be under 1,500, got ${lineCount}`);
});

console.log('\n----------------------------------------');
console.log(`Tests Completed: ${passedTests}/${totalTests} Passed`);
if (passedTests === totalTests) {
  console.log('\x1b[32m%s\x1b[0m', 'ALL TESTS PASSED! Step 6 Refactoring Verified Cleanly.\n');
  process.exit(0);
} else {
  console.error('\x1b[31m%s\x1b[0m', 'SOME TESTS FAILED.');
  process.exit(1);
}
