export const homepageFaqs = [
  {
    q: "Are the games on Spielcade really free?",
    a: "Yes! Every single game on Spielcade is 100% free to play. We sustain our platform through non-intrusive advertising so you never have to pay to enjoy your favorite games."
  },
  {
    q: "Do I need to download or install anything?",
    a: "No downloads or installations are required. All of our games are built using web technologies like HTML5 and WebGL, meaning they run directly inside your web browser."
  },
  {
    q: "Can I play on my mobile phone or tablet?",
    a: "Absolutely. Spielcade is fully optimized for mobile devices. Our responsive design ensures that most games will automatically adapt to your screen size for a perfect touch-screen experience."
  },
  {
    q: "Do I need to create an account to play?",
    a: "You can play most games without an account. However, creating a free account allows you to save your progress in the cloud, track your achievements, and maintain a customized list of favorite games."
  }
];

export const gameCollections = [
  {
    title: "5-Minute Break Games",
    description: "Quick, satisfying games perfect for a short coffee break or commute.",
    imageUrls: ["/images/games/snake.svg", "/images/games/flappy-bird.svg", "/images/games/2048.svg"],
    href: "/playlists/coffee-break"
  },
  {
    title: "Hardest Reflex Gauntlet",
    description: "High-APM reflex test for competitive speedrunners.",
    imageUrls: ["/images/games/flappy-bird.svg", "/images/games/snake.svg", "/images/games/2048.svg"],
    href: "/playlists/hardcore-reflexes"
  },
  {
    title: "Zen Mind & Chill Logic",
    description: "Relaxing spatial puzzles with zero timers and ambient bliss.",
    imageUrls: ["/images/games/2048.svg", "/images/games/snake.svg", "/images/games/flappy-bird.svg"],
    href: "/playlists/zen-mind"
  }
];

/**
 * Hardened Least-Privilege Iframe Sandbox Policy (SEC-07)
 * Strictly blocks drive-by downloads and un-sandboxed popups.
 */
export const GAME_IFRAME_SANDBOX = 
  'allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-modals';

/**
 * Hardened Feature / Permissions Policy (SEC-07)
 * Permits essential gaming APIs (WebGL, audio, gamepad, orientation)
 * while revoking camera, microphone, payment, and clipboard-read.
 */
export const GAME_IFRAME_PERMISSIONS = 
  'fullscreen; autoplay; gamepad; accelerometer; gyroscope; screen-wake-lock; clipboard-write';

