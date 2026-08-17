const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  path.join(__dirname, 'apps/web/app/games/new/NewGamesClient.tsx'),
  path.join(__dirname, 'apps/web/app/popular/PopularGamesClient.tsx'),
];

const replacements = [
  // text colors
  { regex: /text-gray-400(?!\s*dark:)/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { regex: /text-gray-300(?!\s*dark:)/g, replacement: 'text-gray-700 dark:text-gray-300' },
  { regex: /text-gray-200(?!\s*dark:)/g, replacement: 'text-gray-800 dark:text-gray-200' },
  { regex: /text-white(?!\s*dark:)/g, replacement: 'text-gray-900 dark:text-white' },
  
  // backgrounds
  { regex: /bg-\[#111221\]/g, replacement: 'bg-white dark:bg-[#111221]' },
  { regex: /bg-\[#1A1B2E\]/g, replacement: 'bg-gray-100 dark:bg-[#1A1B2E]' },
  { regex: /bg-black\/40/g, replacement: 'bg-gray-100 dark:bg-black/40' },
  
  // borders
  { regex: /border-white\/5/g, replacement: 'border-gray-200 dark:border-white/5' },
  { regex: /border-white\/10/g, replacement: 'border-gray-300 dark:border-white/10' },
  { regex: /border-white\/20/g, replacement: 'border-gray-300 dark:border-white/20' },
  
  // hovers
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-gray-100 dark:hover:bg-white/5' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-gray-200 dark:hover:bg-white/10' },
  
  // Specific hero banners
  { regex: /bg-gradient-to-r from-\[#1E1235\] to-\[#120B21\]/g, replacement: 'bg-gradient-to-r from-purple-50 dark:from-[#1E1235] to-white dark:to-[#120B21]' },
  { regex: /bg-gradient-to-r from-\[#140F2D\] via-\[#100D28\] to-\[#0D1022\]/g, replacement: 'bg-gradient-to-r from-purple-50 dark:from-[#140F2D] via-white dark:via-[#100D28] to-indigo-50 dark:to-[#0D1022]' },
  { regex: /bg-gradient-to-br from-\[#23153c\] to-\[#120B21\]/g, replacement: 'bg-gradient-to-br from-purple-100 dark:from-[#23153c] to-white dark:to-[#120B21]' },
  { regex: /bg-\[#140C24\]/g, replacement: 'bg-purple-50 dark:bg-[#140C24]' },
  
  // Right sidebar image backgrounds
  { regex: /bg-\[#05050F\]/g, replacement: 'bg-gray-100 dark:bg-[#05050F]' },
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Quick fix for the specific banner texts to not get replaced to "text-gray-900" inside the banner where they need to stay white,
    // wait, actually in light mode the text in the banner could be gray-900 because the banner background is now purple-50/white.
    
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    // Exception for the NEW badge text, the "Subscribe" buttons and pagination active buttons
    // where they have solid colored backgrounds (e.g. bg-purple-600) and MUST stay text-white always.
    content = content.replace(/bg-purple-600 text-gray-900 dark:text-white/g, 'bg-purple-600 text-white');
    content = content.replace(/bg-gradient-to-r from-pink-500 to-purple-500 text-gray-900 dark:text-white/g, 'bg-gradient-to-r from-pink-500 to-purple-500 text-white');
    content = content.replace(/text-gray-900 dark:text-white font-bold text-\[9px\]/g, 'text-white font-bold text-[9px]'); // GameCard NEW badge in NewGamesClient if it existed
    content = content.replace(/text-gray-900 dark:text-white text-xs font-bold font-mono/g, 'text-white text-xs font-bold font-mono');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.basename(file)}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
