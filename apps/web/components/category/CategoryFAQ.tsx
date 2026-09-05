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
  ]
};

export default function CategoryFAQ({ category }: CategoryFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const slug = category?.slug || 'puzzle-games';
  const categoryTitle = category?.title || 'Games';
  const faqs = CATEGORY_FAQS[slug] || CATEGORY_FAQS['puzzle-games'];

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
