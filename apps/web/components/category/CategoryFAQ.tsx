'use client';
import React, { useState } from 'react';

interface CategoryFAQProps {
  category?: {
    title?: string;
    slug?: string;
  };
}

const CATEGORY_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  'action-games': [
    {
      q: 'What are action games?',
      a: 'Action games are high-energy video games that emphasize physical challenges, hand-eye coordination, quick reflexes, and rapid reaction time, including shooters, platformers, and fighting games.'
    },
    {
      q: 'Are these action games free to play without download?',
      a: 'Yes, every action game on Spielcade is 100% free to play directly in your web browser with zero downloads, installs, or registration required.'
    },
    {
      q: 'Can I play action games unblocked on school Chromebooks or mobile?',
      a: 'Absolutely. All games are lightweight HTML5/WebGL web apps delivered over secure HTTPS, making them responsive on mobile phones, tablets, and accessible on school Chromebooks.'
    },
    {
      q: 'How do I improve my high score in action games?',
      a: 'Master the keyboard or touch controls, learn enemy attack patterns, keep your eyes focused slightly ahead of obstacles, and practice reaction timing.'
    }
  ],
  'racing-games': [
    {
      q: 'What types of racing games can I play on Spielcade?',
      a: 'Our racing collection includes high-speed supercars, drift racing, highway motorcycle challenges, off-road 4x4 trials, and circuit time-trials.'
    },
    {
      q: 'Do I need a gaming steering wheel or controller to play?',
      a: 'No special equipment is needed. All racing games are fully playable with standard keyboard Arrow/WASD keys or responsive touch controls on mobile.'
    },
    {
      q: 'Are online racing games free?',
      a: 'Yes! All racing games are 100% free with instant in-browser play, no downloads or paid DLCs needed.'
    },
    {
      q: 'Can I save my best lap times and race records?',
      a: 'Yes, sign in to your free Spielcade account to record your top scores, track leaderboard rankings, and earn racing achievements.'
    }
  ],
  'sports-games': [
    {
      q: 'What sports are featured in the Spielcade collection?',
      a: 'You can play football (soccer), basketball shootouts, tennis, golf, cricket, bowling, pool/billiards, and baseball directly in your browser.'
    },
    {
      q: 'Can I play sports games with friends in multiplayer?',
      a: 'Many of our sports games offer local 2-player mode on the same keyboard or online multiplayer matchups against global opponents.'
    },
    {
      q: 'Are online sports games optimized for touchscreens?',
      a: 'Yes, every game features intuitive swipe, flick, or tap controls designed specifically for mobile phones and iPads.'
    },
    {
      q: 'Do sports games require downloading an app?',
      a: 'None of our sports games require an app store download. Simply click any game and start playing instantly.'
    }
  ],
  'strategy-games': [
    {
      q: 'What makes strategy games unique?',
      a: 'Strategy games test your tactical thinking, planning, resource management, and foresight rather than raw reflex speed.'
    },
    {
      q: 'What sub-genres of strategy games are available?',
      a: 'We feature tower defense, turn-based tactics, kingdom builders, real-time war simulations, and chess-like grid strategies.'
    },
    {
      q: 'Can I save my campaign progress in strategy games?',
      a: 'Yes, your progress is automatically saved to your browser cache or synced to your free Spielcade account.'
    },
    {
      q: 'Are strategy games suitable for casual gaming sessions?',
      a: 'Definitely! Many strategy games allow you to take moves at your own pace, pause anytime, and return whenever you want.'
    }
  ],
  'board-games': [
    {
      q: 'Which classic board games can I play online?',
      a: 'Our board game library includes Chess, Checkers, Solitaire, Ludo, Dominoes, Backgammon, and classic card games.'
    },
    {
      q: 'Can I play against an AI bot or real players?',
      a: 'Most board games let you choose between multiple AI difficulty levels (from beginner to grandmaster) or local/online turn-based play.'
    },
    {
      q: 'Are online board games 100% free?',
      a: 'Yes, all board games are free to enjoy with no paywalls, subscriptions, or chip purchases.'
    },
    {
      q: 'Do board games help cognitive brain function?',
      a: 'Yes, board games like Chess and Solitaire stimulate logical reasoning, pattern recognition, and long-term memory.'
    }
  ],
  'adventure-games': [
    {
      q: 'What can I expect from adventure games on Spielcade?',
      a: 'Embark on rich narrative quests, solve mystery escape rooms, explore dungeon labyrinths, and survive perilous obstacle worlds like lava jumps.'
    },
    {
      q: 'Are adventure games playable on mobile phones?',
      a: 'Yes, all adventure titles are built with HTML5 WebGL and adapt seamlessly to touch gestures on smartphones and tablets.'
    },
    {
      q: 'How long do online browser adventure games take to beat?',
      a: 'Games range from bite-sized 10-minute escape rooms to multi-level episodic quests that span several hours of exploration.'
    },
    {
      q: 'Do I need high-end computer specs to run these games?',
      a: 'No! All games run smoothly on basic laptops, Chromebooks, and mobile browsers without requiring a dedicated GPU.'
    }
  ],
  'arcade-games': [
    {
      q: 'What defines an arcade browser game?',
      a: 'Arcade games feature fast-paced, intuitive gameplay with simple rules, escalating difficulty, and an emphasis on chasing global high scores.'
    },
    {
      q: 'Can I play retro arcade classics like Snake and Neon Flyer?',
      a: 'Yes! We host remastered classics like Neon Snake and high-speed endless flyers alongside fresh modern arcade hits.'
    },
    {
      q: 'How does the global arcade leaderboard work?',
      a: 'When you finish a run, your score is submitted to our live leaderboard where you can compete for top weekly and monthly ranks.'
    },
    {
      q: 'Are arcade games free to play?',
      a: 'All arcade games are 100% free with unlimited lives and restarts—no quarters needed!'
    }
  ],
  'puzzle-games': [
    {
      q: 'What are puzzle games?',
      a: 'Puzzle games emphasize logic and problem solving, testing skills including spatial reasoning, sequence completion, arithmetic, and word matching.'
    },
    {
      q: 'Are these puzzle games free to play?',
      a: 'Yes, all puzzle games on Spielcade are 100% free to play directly in your web browser with no download required.'
    },
    {
      q: 'Can I play puzzle games on my phone?',
      a: 'Absolutely! Our puzzle games (like 2048, Sudoku, and match-3 games) are fully optimized for touch controls on mobile devices.'
    },
    {
      q: 'Do puzzle games improve brain health?',
      a: 'Studies suggest that regularly playing logic puzzles can boost working memory, problem-solving agility, and mental sharpness.'
    }
  ],
  'car-games': [
    {
      q: 'What types of car games can I play on Spielcade?',
      a: 'You can play 3D sports car racing, realistic drift simulators, city parking challenges, off-road truck trials, and highway police chases directly in your browser.'
    },
    {
      q: 'Are these car games unblocked for school Chromebooks?',
      a: 'Yes, all car games run in lightweight HTML5 WebGL with zero installation or downloads needed, making them fast and unblocked on school Chromebooks and laptops.'
    },
    {
      q: 'Can I customize and tune my cars in browser games?',
      a: 'Many of our top car games let you customize paint jobs, spoilers, rims, turbochargers, and engine tuning as you earn in-game credits.'
    },
    {
      q: 'What are the controls for online car games?',
      a: 'Standard controls use the Arrow Keys or WASD for steering, acceleration, and braking, with Spacebar for the handbrake/drift and Shift or N for Nitro boost.'
    }
  ],
  'zombie-games': [
    {
      q: 'What are the best free zombie games to play online?',
      a: 'Our zombie library features top-rated undead wave survival, tactical sniper defense, post-apocalyptic shooters, and base-building survival games.'
    },
    {
      q: 'Do I need to download or install zombie games?',
      a: 'No, every zombie game on Spielcade is 100% free and launches instantly in your web browser with zero downloads or storage required.'
    },
    {
      q: 'Can I play zombie games on mobile?',
      a: 'Yes, all zombie games feature responsive touch controls and WebGL graphics that run smoothly on iPhones, Android phones, and iPads.'
    },
    {
      q: 'How do you survive high waves in zombie survival games?',
      a: 'Aim for headshots for maximum damage, keep moving to avoid getting cornered, prioritize weapon reloads between waves, and upgrade barricades early.'
    }
  ],
  'stickman-games': [
    {
      q: 'Why are stickman games so popular?',
      a: 'Stickman games combine fluid, minimalist physics-based animations with intense combat, sniper missions, parkour acrobatics, and high-replayability gameplay.'
    },
    {
      q: 'Are stickman games free on Spielcade?',
      a: 'Yes, all stickman titles—from fighting duels to epic archery battles—are completely free to play without microtransactions or required downloads.'
    },
    {
      q: 'Can I play stickman multiplayer games with friends?',
      a: 'Yes! We host 2-player stickman fighting and racing games playable on the same keyboard or across online browser lobbies.'
    },
    {
      q: 'Which stickman genres are available?',
      a: 'We feature stickman archery, ragdoll physics brawlers, sniper assassins, motorcycle stunts, and parkour platform runners.'
    }
  ],
  '2-player-games': [
    {
      q: 'How do 2-player games work on one computer?',
      a: 'Most 2-player games use split keyboard controls—Player 1 uses WASD while Player 2 uses the Arrow Keys—allowing instant local head-to-head competition.'
    },
    {
      q: 'Are there cooperative 2-player games where we work together?',
      a: 'Yes, we have co-op adventure and puzzle games where two players must coordinate to open doors, trigger switches, and solve team challenges.'
    },
    {
      q: 'Can I play 2-player games on mobile or tablet?',
      a: 'Many 2-player games feature shared-screen touch controls on tablets and smartphones, allowing two players to tap opposite sides of the screen.'
    },
    {
      q: 'Are online 2-player games free with no download?',
      a: 'Yes, all 2-player and multiplayer games on Spielcade are completely free with zero installation required.'
    }
  ],
  'unblocked-games': [
    {
      q: 'What are unblocked games?',
      a: 'Unblocked games are browser games that can be played freely on restricted networks, such as school Wi-Fi or work offices, without firewall blocks.'
    },
    {
      q: 'Are unblocked games safe to play on school Chromebooks?',
      a: 'Yes! Spielcade uses end-to-end HTTPS encryption, contains no executable downloads or malware, and runs purely inside modern sandboxed web browsers.'
    },
    {
      q: 'What types of games are available unblocked on Spielcade?',
      a: 'Our unblocked library spans over 17,000 games including car racing, endless runners, puzzle logic, sports shootouts, and retro arcade classics.'
    },
    {
      q: 'Do I need a VPN to play unblocked games?',
      a: 'No VPN is needed. Spielcade is hosted on Cloudflare Global Edge CDN, delivering lightning-fast, firewall-friendly web access anywhere in the world.'
    }
  ],
  'shooting-games': [
    {
      q: 'What are the best free online shooting games?',
      a: 'Our collection includes first-person shooters (FPS), tactical military sniper games, retro top-down shoot-\'em-ups, and zombie gun battles.'
    },
    {
      q: 'How do I aim and shoot in browser FPS games?',
      a: 'Use your Mouse to look and aim, Left Click to shoot, Right Click to zoom or aim down sights, and WASD to move and strafe.'
    },
    {
      q: 'Do shooting games require high-end graphics cards?',
      a: 'No, all shooting games on Spielcade are optimized with WebGL hardware acceleration to run at 60 FPS even on basic Chromebooks and laptops.'
    },
    {
      q: 'Are multiplayer shooting games available?',
      a: 'Yes, you can jump into live multiplayer arena shootouts and battle royale matches directly from your browser with zero install.'
    }
  ],
  'escape-games': [
    {
      q: 'How do escape room games work?',
      a: 'You are locked in a mysterious room or facility and must inspect objects, decipher cryptic codes, find hidden keys, and solve logic puzzles to escape.'
    },
    {
      q: 'What should I do if I get stuck in an escape game?',
      a: 'Examine every object carefully, click background details for hidden drawers, write down suspicious numbers or patterns, and try combining inventory items.'
    },
    {
      q: 'Are escape games free and playable on mobile?',
      a: 'Yes! All escape room games are 100% free with point-and-click or tap controls that work seamlessly on phones, tablets, and desktop computers.'
    },
    {
      q: 'How long do online escape games take to solve?',
      a: 'Most browser escape puzzles take between 15 to 45 minutes of fun, brain-teasing problem solving.'
    }
  ],
  'runner-games': [
    {
      q: 'What are endless runner games?',
      a: 'Runner games feature a character moving forward automatically while you jump over hazards, slide under barriers, and collect bonus coins to achieve a record score.'
    },
    {
      q: 'What are the best tips to get a high score in runner games?',
      a: 'Keep your eyes looking one step ahead of your character, memorize obstacle patterns, use power-ups wisely, and stay calm as the game speed ramps up.'
    },
    {
      q: 'Can I play runner games on my phone with swipe controls?',
      a: 'Yes, our runner games fully support touchscreen swipe gestures (swipe up to jump, down to slide, left/right to change lanes).'
    },
    {
      q: 'Are runner games free to play without download?',
      a: 'Yes, all runner games are free instant-play browser games with no downloads or paid microtransactions required.'
    }
  ]
};

function generateFallbackFaqs(title: string): Array<{ q: string; a: string }> {
  return [
    {
      q: `What are ${title}?`,
      a: `${title} on Spielcade are free online browser games playable instantly without any downloads, app installs, or registration.`
    },
    {
      q: `Can I play ${title} unblocked on school Chromebooks and mobile?`,
      a: `Yes! All ${title} are built with lightweight HTML5 WebGL, ensuring fast performance, responsive touch controls, and unblocked access across school Wi-Fi and mobile devices.`
    },
    {
      q: `Are ${title} completely free?`,
      a: `Every game in the ${title} collection is 100% free to play with unlimited restarts, leaderboard tracking, and no paywalls.`
    },
    {
      q: `What controls are used to play ${title}?`,
      a: `Most games use standard Arrow Keys, WASD, or Mouse clicks on desktop, and intuitive tap and swipe gestures on mobile screens.`
    }
  ];
}

export default function CategoryFAQ({ category }: CategoryFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const slug = category?.slug || 'puzzle-games';
  const categoryTitle = category?.title || 'Games';
  const faqs = CATEGORY_FAQS[slug] || generateFallbackFaqs(categoryTitle);

  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">
        Frequently Asked Questions — {categoryTitle}
      </h3>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden transition-colors ${
              openIndex === index 
                ? 'bg-white dark:bg-[#111228] border-gray-300 dark:border-white/10' 
                : 'bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <button 
              className="w-full px-6 py-4 flex items-center justify-between text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-bold text-gray-800 dark:text-gray-300">{faq.q}</span>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#6366F1]' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
