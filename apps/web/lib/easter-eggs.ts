/**
 * Secret Arcade Vault & Konami Code Easter Egg Engine
 * Detects classic retro cheat codes:
 * - Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
 * - Secret Words: "matrix", "retro", "godmode", "arcade"
 */

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

const CHEAT_WORDS = ['matrix', 'retro', 'godmode', 'arcade'];

class EasterEggEngine {
  private keyHistory: string[] = [];
  private letterBuffer: string = '';
  private isInitialized: boolean = false;
  private isCrtActive: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Check saved CRT filter preference
    try {
      this.isCrtActive = localStorage.getItem('spielcade_crt_filter') === 'true';
      if (this.isCrtActive) {
        document.documentElement.classList.add('crt-filter');
      }
    } catch {}

    window.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ignore input fields
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
      return;
    }

    // 1. Check Konami Code
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    this.keyHistory.push(key);
    if (this.keyHistory.length > KONAMI_SEQUENCE.length) {
      this.keyHistory.shift();
    }

    if (this.matchesKonami()) {
      this.triggerUnlock('konami');
      this.keyHistory = [];
      return;
    }

    // 2. Check Secret Words
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      this.letterBuffer += e.key.toLowerCase();
      if (this.letterBuffer.length > 15) {
        this.letterBuffer = this.letterBuffer.slice(-15);
      }

      for (const word of CHEAT_WORDS) {
        if (this.letterBuffer.endsWith(word)) {
          this.triggerUnlock(word);
          this.letterBuffer = '';
          return;
        }
      }
    }
  };

  private matchesKonami(): boolean {
    if (this.keyHistory.length !== KONAMI_SEQUENCE.length) return false;
    return KONAMI_SEQUENCE.every((k, i) => {
      const target = k.length === 1 ? k.toLowerCase() : k;
      return this.keyHistory[i] === target;
    });
  }

  public triggerUnlock(source: string) {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('spielcade_vault_unlocked', 'true');
    } catch {}

    window.dispatchEvent(
      new CustomEvent('spielcade:secret-vault-unlocked', {
        detail: { code: source },
      })
    );

    window.dispatchEvent(
      new CustomEvent('spielcade:award-xp', {
        detail: { amount: 250, reason: 'Unlocked the Secret Vault!' },
      })
    );
  }

  public isCrtEnabled(): boolean {
    return this.isCrtActive;
  }

  public toggleCrtFilter(): boolean {
    this.isCrtActive = !this.isCrtActive;
    if (typeof document !== 'undefined') {
      if (this.isCrtActive) {
        document.documentElement.classList.add('crt-filter');
      } else {
        document.documentElement.classList.remove('crt-filter');
      }
    }
    try {
      localStorage.setItem('spielcade_crt_filter', String(this.isCrtActive));
    } catch {}
    return this.isCrtActive;
  }
}

export const easterEggEngine = new EasterEggEngine();
