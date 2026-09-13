export interface FAQItem {
  q: string;
  a: string;
  tag: 'Monetization' | 'Publishing' | 'Technical' | 'Legal';
}

export const FAQ_DATA: FAQItem[] = [
  {
    q: 'Is it completely free to publish games on Spielcade Developer Studio?',
    a: 'Yes, 100% free. There are zero upfront fees, zero hosting costs, and zero listing charges. Spielcade operates on a shared success model: we provide the platform, infrastructure, global CDN, and monetization, and pay you up to 70% of the ad revenue your game generates.',
    tag: 'Publishing'
  },
  {
    q: 'How does the 70% revenue share model work, and when do I get paid?',
    a: 'You earn up to 70% of gross ad revenue generated from pre-roll, interstitial, and rewarded video ads shown during your gameplay sessions. Payouts are distributed automatically on a Net-30 monthly schedule via Stripe, PayPal, or Direct International Bank Transfer, with a creator-friendly minimum threshold of just $50.',
    tag: 'Monetization'
  },
  {
    q: 'Do I retain 100% of my intellectual property (IP) and copyright?',
    a: 'Yes, absolutely. You retain 100% ownership, copyright, and intellectual property rights to your games, assets, source code, and branding. Publishing on Spielcade grants us a non-exclusive license to host, display, and monetize your game on our platform.',
    tag: 'Legal'
  },
  {
    q: 'Can I publish my game on other platforms like Poki, CrazyGames, or itch.io at the same time?',
    a: 'Yes! Spielcade does not require exclusivity. You are free to distribute your HTML5 or WebGL game anywhere you choose. Our non-exclusive policy empowers indie developers to maximize their global audience and aggregate multiple revenue streams simultaneously.',
    tag: 'Publishing'
  },
  {
    q: 'How long does the QA and review process take for submitted games?',
    a: 'Our review team typically reviews and tests submissions within 24 to 48 business hours. We verify that the game loads cleanly over HTTPS, maintains acceptable frame rates (target 60 FPS), supports responsive dimensions, and integrates the Spielcade SDK correctly.',
    tag: 'Publishing'
  },
  {
    q: 'What game engines and frameworks can I use to build my game?',
    a: 'Spielcade is 100% engine-agnostic. Any engine or framework capable of exporting to HTML5 or WebGL is supported, including Unity WebGL (all versions), Godot 4 & 3.x, Phaser 3, Construct 3, GameMaker Studio, Three.js, PlayCanvas, Defold, Babylon.js, or vanilla JavaScript Canvas 2D.',
    tag: 'Technical'
  },
  {
    q: 'Can I self-host my game on my own server via iframe, or upload files directly?',
    a: 'Both options are supported! You can provide a secure HTTPS source URL for your self-hosted game iframe, or upload your compiled WebGL/HTML5 zip archive directly to our Cloudflare Edge CDN for zero-latency worldwide delivery.',
    tag: 'Technical'
  },
  {
    q: 'How does Spielcade prevent unauthorized sites from stealing or hotlinking my game?',
    a: 'We implement advanced domain-locking verification, Cross-Origin-Resource-Policy (CORP), and hotlink shielding. When you configure domain locking in your Developer Studio dashboard, our platform enforces that your game only renders inside verified Spielcade domains, preventing scraper sites from re-hosting your work.',
    tag: 'Legal'
  },
  {
    q: 'What are the technical requirements for responsive aspect ratios and mobile controls?',
    a: 'We support all standard aspect ratios: 16:9 widescreen, 9:16 vertical mobile portrait, and 4:3 classic arcade. For mobile players, we recommend implementing touch controls, or enabling our built-in virtual on-screen gamepad which automatically bridges touch input to arrow/WASD keyboard events.',
    tag: 'Technical'
  },
  {
    q: 'How do leaderboards and achievements work with the Spielcade SDK?',
    a: 'The Spielcade SDK communicates with the parent window using the secure window.postMessage protocol. When you call Spielcade.submitScore(score) or Spielcade.unlockAchievement(key), the score is authenticated, verified against anti-cheat rate limiters, and posted directly to the player’s profile and global leaderboards.',
    tag: 'Technical'
  }
];
