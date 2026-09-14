/**
 * Custom Arcade Mixtape Manager
 * Allows players to create, curate, save, and share custom game playlists.
 * Supports zero-server viral sharing via URL-safe Base64 compression.
 */

export interface CustomMixtape {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  gameSlugs: string[];
  createdAt: number;
  curatorName: string;
}

const STORAGE_KEY = 'spielcade_custom_mixtapes';

const PRESET_GRADIENTS = [
  'from-pink-500 via-rose-500 to-amber-500',
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-cyan-500 via-blue-600 to-indigo-700',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-amber-500 via-orange-600 to-red-600',
  'from-violet-600 via-purple-700 to-indigo-950',
];

const PRESET_EMOJIS = ['🕹️', '⚡', '🔥', '☕', '🚀', '🎮', '👾', '💎', '🌟', '👑', '🎯', '✨'];

export const mixtapeManager = {
  getPresetEmojis(): string[] {
    return PRESET_EMOJIS;
  },

  getMixtapes(): CustomMixtape[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getMixtapeById(id: string): CustomMixtape | null {
    const list = this.getMixtapes();
    return list.find((m) => m.id === id) || null;
  },

  saveMixtapes(mixtapes: CustomMixtape[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mixtapes));
      window.dispatchEvent(new CustomEvent('spielcade:mixtapes-updated', { detail: { count: mixtapes.length } }));
    } catch {}
  },

  createMixtape(title: string, description = '', emoji = '🎮', initialSlug?: string): CustomMixtape {
    const randomGradient = PRESET_GRADIENTS[Math.floor(Math.random() * PRESET_GRADIENTS.length)] || PRESET_GRADIENTS[0]!;
    const id = `mix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    let curator = 'Arcade Gamer';
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('spielcade_user_profile');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.username) curator = u.username;
        }
      } catch {}
    }

    const newMixtape: CustomMixtape = {
      id,
      title: title.trim() || 'My Arcade Mixtape',
      description: description.trim() || 'A custom collection of favorite arcade games.',
      emoji: emoji || '🎮',
      gradient: randomGradient,
      gameSlugs: initialSlug ? [initialSlug] : [],
      createdAt: Date.now(),
      curatorName: curator,
    };

    const current = this.getMixtapes();
    this.saveMixtapes([newMixtape, ...current]);
    return newMixtape;
  },

  addGameToMixtape(mixtapeId: string, slug: string): boolean {
    const list = this.getMixtapes();
    const target = list.find((m) => m.id === mixtapeId);
    if (!target) return false;

    if (!target.gameSlugs.includes(slug)) {
      target.gameSlugs.push(slug);
      this.saveMixtapes(list);
      return true;
    }
    return false;
  },

  removeGameFromMixtape(mixtapeId: string, slug: string): boolean {
    const list = this.getMixtapes();
    const target = list.find((m) => m.id === mixtapeId);
    if (!target) return false;

    const initialLen = target.gameSlugs.length;
    target.gameSlugs = target.gameSlugs.filter((s) => s !== slug);
    if (target.gameSlugs.length !== initialLen) {
      this.saveMixtapes(list);
      return true;
    }
    return false;
  },

  toggleGameInMixtape(mixtapeId: string, slug: string): boolean {
    const list = this.getMixtapes();
    const target = list.find((m) => m.id === mixtapeId);
    if (!target) return false;

    if (target.gameSlugs.includes(slug)) {
      this.removeGameFromMixtape(mixtapeId, slug);
      return false; // Removed
    } else {
      this.addGameToMixtape(mixtapeId, slug);
      return true; // Added
    }
  },

  deleteMixtape(mixtapeId: string): boolean {
    const list = this.getMixtapes();
    const filtered = list.filter((m) => m.id !== mixtapeId);
    this.saveMixtapes(filtered);
    return true;
  },

  // Zero-server share URL compression
  encodeMixtapeToUrl(mixtape: CustomMixtape): string {
    try {
      const payload = {
        t: mixtape.title,
        d: mixtape.description,
        e: mixtape.emoji,
        g: mixtape.gradient,
        c: mixtape.curatorName,
        s: mixtape.gameSlugs,
      };
      const jsonStr = JSON.stringify(payload);
      const encoded = btoa(encodeURIComponent(jsonStr));
      return encoded;
    } catch {
      return '';
    }
  },

  decodeMixtapeFromUrl(encoded: string): CustomMixtape | null {
    try {
      const decodedStr = decodeURIComponent(atob(encoded));
      const payload = JSON.parse(decodedStr);
      if (!payload || !payload.t || !Array.isArray(payload.s)) return null;

      return {
        id: `shared_${Date.now()}`,
        title: String(payload.t),
        description: String(payload.d || ''),
        emoji: String(payload.e || '🎮'),
        gradient: String(payload.g || PRESET_GRADIENTS[0]),
        curatorName: String(payload.c || 'Friend'),
        gameSlugs: payload.s.map((x: any) => String(x)),
        createdAt: Date.now(),
      };
    } catch {
      return null;
    }
  },

  importSharedMixtape(shared: CustomMixtape): boolean {
    const list = this.getMixtapes();
    // Check if duplicate title
    const existing = list.find((m) => m.title.toLowerCase() === shared.title.toLowerCase());
    if (existing) {
      // Merge slugs
      const newSlugs = Array.from(new Set([...existing.gameSlugs, ...shared.gameSlugs]));
      existing.gameSlugs = newSlugs;
      this.saveMixtapes(list);
      return true;
    }

    const imported: CustomMixtape = {
      ...shared,
      id: `mix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      curatorName: `${shared.curatorName} (Shared)`,
    };
    this.saveMixtapes([imported, ...list]);
    return true;
  },
};
