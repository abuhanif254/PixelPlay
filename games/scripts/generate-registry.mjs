import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gamesDir = path.resolve(__dirname, '..');

// Get all directories inside games/ (excluding scripts and node_modules)
const gameFolders = fs.readdirSync(gamesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'scripts' && dirent.name !== 'node_modules' && !dirent.name.startsWith('.'))
  .map(dirent => dirent.name);

let registryContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run 'pnpm run generate-registry' in the games/ package to update this file.

import dynamic from 'next/dynamic';

export interface GameConfig {
  title: string;
  category: string;
  rating?: number;
  description?: string;
  image?: string;
  history?: string;
  strategy?: string;
  tips?: string[];
  keyboardControls?: Record<string, string>;
  touchControls?: Record<string, string>;
  faqs?: {q: string, a: string}[];
  tags?: string[];
  screenshots?: string[];
  trailerUrl?: string;
  developer?: string;
  releaseDate?: string;
  platform?: string;
}

export const gamesRegistry: Record<string, { config: GameConfig, component: any }> = {
`;

gameFolders.forEach((slug) => {
  const configPath = path.join(gamesDir, slug, 'config.json');
  
  if (fs.existsSync(configPath)) {
    const configRaw = fs.readFileSync(configPath, 'utf-8');
    // Ensure we can safely embed it in the TS file
    const configObj = JSON.parse(configRaw);
    
    registryContent += `  "${slug}": {
    config: ${JSON.stringify(configObj, null, 6).trim()},
    // Note: We use ssr: false because game engines rely on the browser's window and canvas
    component: dynamic(() => import('./${slug}/Game'), { ssr: false })
  },
`;
  }
});

registryContent += `};
`;

const outputPath = path.join(gamesDir, 'registry.ts');
fs.writeFileSync(outputPath, registryContent);

console.log(`✅ Generated registry.ts with ${gameFolders.length} games.`);
