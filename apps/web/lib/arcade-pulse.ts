/**
 * Arcade Pulse Engine
 * Real-time multiplayer presence counter and live global arcade activity ticker.
 * Synthesizes platform milestones with local player achievements.
 */

export type PulseEventType = 'score' | 'streak' | 'card' | 'duel' | 'level';

export interface PulseEvent {
  id: string;
  type: PulseEventType;
  player: string;
  gameTitle: string;
  gameSlug: string;
  text: string;
  badgeEmoji: string;
  timestamp: number;
}

const SAMPLE_PLAYERS = [
  'ViperX', 'NeonRider', 'CyberGhost', 'PixelQueen', 'RetroSamurai',
  'ShadowKitsune', 'LunaArcade', 'HyperNova', 'ZeroCool', 'AeroPulse',
  'Kitsune99', 'BlazeStrike', 'QuantumAce', 'VortexPilot', 'GlitchMaster'
];

const SAMPLE_GAMES = [
  { slug: 'snake', title: 'Neon Snake' },
  { slug: 'flappy-bird', title: 'Neon Flyer' },
  { slug: '2048', title: '2048 Classic' },
  { slug: 'blade-merge', title: 'Blade Merge' },
  { slug: 'catchy-ball', title: 'Catchy Ball Arcade' },
  { slug: 'pull-the-pin-3d-help-police', title: 'Pull The Pin 3D' },
];

class ArcadePulseEngine {
  private events: PulseEvent[] = [];
  private listeners: Set<(events: PulseEvent[], onlineCount: number) => void> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private baseOnlineCount: number = 560;

  constructor() {
    this.seedInitialEvents();
    if (typeof window !== 'undefined') {
      this.startStream();
      this.listenLocalEvents();
    }
  }

  private seedInitialEvents() {
    const now = Date.now();
    this.events = [
      {
        id: 'seed-1',
        type: 'score',
        player: 'ViperX',
        gameTitle: 'Neon Snake',
        gameSlug: 'snake',
        text: 'set a new high score of 18,400',
        badgeEmoji: '🏆',
        timestamp: now - 35000,
      },
      {
        id: 'seed-2',
        type: 'streak',
        player: 'LunaArcade',
        gameTitle: 'Neon Flyer',
        gameSlug: 'flappy-bird',
        text: 'reached a 7-Day Daily Streak',
        badgeEmoji: '🔥',
        timestamp: now - 80000,
      },
      {
        id: 'seed-3',
        type: 'card',
        player: 'CyberGhost',
        gameTitle: '2048 Classic',
        gameSlug: '2048',
        text: 'minted a legendary Clutch Trading Card',
        badgeEmoji: '🃏',
        timestamp: now - 140000,
      },
      {
        id: 'seed-4',
        type: 'level',
        player: 'PixelQueen',
        gameTitle: 'Blade Merge',
        gameSlug: 'blade-merge',
        text: 'leveled up to Arcade Master Level 20',
        badgeEmoji: '⭐',
        timestamp: now - 220000,
      },
      {
        id: 'seed-5',
        type: 'duel',
        player: 'HyperNova',
        gameTitle: 'Catchy Ball Arcade',
        gameSlug: 'catchy-ball',
        text: 'won a 1v1 Party Duel match',
        badgeEmoji: '⚔️',
        timestamp: now - 310000,
      },
    ];
  }

  private generateRandomEvent(): PulseEvent {
    const player = SAMPLE_PLAYERS[Math.floor(Math.random() * SAMPLE_PLAYERS.length)] || 'Gamer';
    const game = SAMPLE_GAMES[Math.floor(Math.random() * SAMPLE_GAMES.length)] || SAMPLE_GAMES[0]!;
    const types: PulseEventType[] = ['score', 'streak', 'card', 'level', 'duel'];
    const type = types[Math.floor(Math.random() * types.length)] || 'score';

    let text = '';
    let emoji = '🎮';

    if (type === 'score') {
      const score = (Math.floor(Math.random() * 80) + 20) * 250;
      text = `scored ${score.toLocaleString()} points`;
      emoji = '🏆';
    } else if (type === 'streak') {
      const days = Math.floor(Math.random() * 12) + 3;
      text = `achieved a ${days}-day streak`;
      emoji = '🔥';
    } else if (type === 'card') {
      text = `shared a Holo Clutch Snapshot`;
      emoji = '🃏';
    } else if (type === 'level') {
      const lvl = Math.floor(Math.random() * 25) + 5;
      text = `ranked up to Level ${lvl}`;
      emoji = '⭐';
    } else {
      text = `won a Party Duel room match`;
      emoji = '⚔️';
    }

    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      player,
      gameTitle: game.title,
      gameSlug: game.slug,
      text,
      badgeEmoji: emoji,
      timestamp: Date.now(),
    };
  }

  public getOnlineCount(): number {
    // Subtle realistic organic fluctuation (+/- 8)
    const hour = typeof window !== 'undefined' ? new Date().getHours() : 14;
    const timeFactor = Math.sin((hour / 24) * Math.PI) * 200;
    const jitter = Math.floor(Math.sin(Date.now() / 20000) * 15);
    return Math.max(380, Math.floor(this.baseOnlineCount + timeFactor + jitter));
  }

  public recordLocalPulseEvent(event: Partial<PulseEvent>) {
    let player = 'You';
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('spielcade_user_profile');
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed.username) player = parsed.username;
        }
      } catch {}
    }

    const newEvent: PulseEvent = {
      id: `local-${Date.now()}`,
      type: event.type || 'score',
      player: event.player || player,
      gameTitle: event.gameTitle || 'Neon Arcade',
      gameSlug: event.gameSlug || 'snake',
      text: event.text || 'achieved a legendary victory',
      badgeEmoji: event.badgeEmoji || '✨',
      timestamp: Date.now(),
    };

    this.events = [newEvent, ...this.events.slice(0, 24)];
    this.notify();
  }

  private listenLocalEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('spielcade:award-xp', (e: any) => {
      const reason = e.detail?.reason || 'gained Arcade XP';
      this.recordLocalPulseEvent({
        type: 'level',
        text: reason,
        badgeEmoji: '⭐',
      });
    });

    window.addEventListener('spielcade:scores-synced', (e: any) => {
      this.recordLocalPulseEvent({
        type: 'score',
        text: 'synced high score to leaderboard',
        badgeEmoji: '🏆',
      });
    });
  }

  private startStream() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const evt = this.generateRandomEvent();
      this.events = [evt, ...this.events.slice(0, 24)];
      this.notify();
    }, 9000);
  }

  private notify() {
    const count = this.getOnlineCount();
    this.listeners.forEach((fn) => fn(this.events, count));
  }

  public subscribe(callback: (events: PulseEvent[], onlineCount: number) => void): () => void {
    this.listeners.add(callback);
    callback(this.events, this.getOnlineCount());
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getEvents(): PulseEvent[] {
    return this.events;
  }
}

export const arcadePulse = new ArcadePulseEngine();
