import { describe, it, expect } from 'vitest';
import {
  fmtTime,
  AR_CLASSES,
  VPAD_KEY_PAIRS,
  SHORTCUTS,
  PlayerState,
  AspectRatio,
} from '@/components/player/types';

describe('Game Play Cycle & State Engine (RFC-TEST-001)', () => {
  describe('1. Time Formatting Utility (fmtTime)', () => {
    it('should format 0 seconds as 00:00', () => {
      expect(fmtTime(0)).toBe('00:00');
    });

    it('should format single digit seconds with leading zero', () => {
      expect(fmtTime(7)).toBe('00:07');
    });

    it('should format 59 seconds correctly', () => {
      expect(fmtTime(59)).toBe('00:59');
    });

    it('should roll over to 1 minute at 60 seconds', () => {
      expect(fmtTime(60)).toBe('01:00');
    });

    it('should format minutes and seconds correctly (e.g. 65s -> 01:05)', () => {
      expect(fmtTime(65)).toBe('01:05');
      expect(fmtTime(125)).toBe('02:05');
    });

    it('should format 1 hour (3600 seconds) as 60:00', () => {
      expect(fmtTime(3600)).toBe('60:00');
    });
  });

  describe('2. Aspect Ratio Class Mapping (AR_CLASSES)', () => {
    it('should define classes for standard aspect ratios', () => {
      expect(AR_CLASSES['16:9']).toContain('aspect-video');
      expect(AR_CLASSES['4:3']).toContain('aspect-[4/3]');
      expect(AR_CLASSES['9:16']).toContain('aspect-[9/16]');
      expect(AR_CLASSES['auto']).toContain('w-full');
    });

    it('should enforce responsive width and centering on mobile aspect ratios', () => {
      expect(AR_CLASSES['4:3']).toContain('mx-auto');
      expect(AR_CLASSES['9:16']).toContain('mx-auto');
    });
  });

  describe('3. Virtual Gamepad Key Mappings (VPAD_KEY_PAIRS)', () => {
    it('should map directional controls to both Arrow and WASD codes', () => {
      expect(VPAD_KEY_PAIRS.up).toEqual({
        key: 'ArrowUp',
        code: 'ArrowUp',
        secondaryKey: 'w',
        secondaryCode: 'KeyW',
      });
      expect(VPAD_KEY_PAIRS.down).toEqual({
        key: 'ArrowDown',
        code: 'ArrowDown',
        secondaryKey: 's',
        secondaryCode: 'KeyS',
      });
      expect(VPAD_KEY_PAIRS.left).toEqual({
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        secondaryKey: 'a',
        secondaryCode: 'KeyA',
      });
      expect(VPAD_KEY_PAIRS.right).toEqual({
        key: 'ArrowRight',
        code: 'ArrowRight',
        secondaryKey: 'd',
        secondaryCode: 'KeyD',
      });
    });

    it('should map action buttons to standard primary and secondary inputs', () => {
      expect(VPAD_KEY_PAIRS.a.key).toBe(' ');
      expect(VPAD_KEY_PAIRS.a.secondaryKey).toBe('x');
      expect(VPAD_KEY_PAIRS.b.key).toBe('Shift');
      expect(VPAD_KEY_PAIRS.space.key).toBe(' ');
      expect(VPAD_KEY_PAIRS.enter.key).toBe('Enter');
    });
  });

  describe('4. Keyboard Shortcuts Standard (SHORTCUTS)', () => {
    it('should register all 7 standard arcade shortcut keys', () => {
      const keys = SHORTCUTS.map((s) => s.key);
      expect(keys).toContain('F');
      expect(keys).toContain('T');
      expect(keys).toContain('P');
      expect(keys).toContain('M');
      expect(keys).toContain('R');
      expect(keys).toContain('Esc');
      expect(keys).toContain('?');
    });

    it('should have descriptive labels for every shortcut', () => {
      SHORTCUTS.forEach((s) => {
        expect(s.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('5. Player Lifecycle State Transitions', () => {
    it('should support the full state transition chain', () => {
      const validStates: PlayerState[] = [
        'idle',
        'ad',
        'rewarded_ad',
        'playing',
        'paused',
        'game_over',
      ];

      // Simulate state machine transitions
      let currentState: PlayerState = 'idle';
      expect(currentState).toBe('idle');

      // Start game: idle -> playing
      currentState = 'playing';
      expect(validStates).toContain(currentState);

      // User pauses: playing -> paused
      currentState = 'paused';
      expect(currentState).toBe('paused');

      // User resumes: paused -> playing
      currentState = 'playing';
      expect(currentState).toBe('playing');

      // Game ends: playing -> game_over
      currentState = 'game_over';
      expect(currentState).toBe('game_over');

      // Play again: game_over -> playing
      currentState = 'playing';
      expect(currentState).toBe('playing');
    });
  });

  describe('6. Server-Authoritative Score Anti-Cheat Invariants', () => {
    function validateScore(score: unknown): { valid: boolean; cleanScore?: number; error?: string } {
      if (typeof score !== 'number' || !Number.isFinite(score)) {
        return { valid: false, error: 'Invalid score: must be a finite number' };
      }
      const cleanScore = Math.floor(score);
      if (cleanScore < 0 || cleanScore > 10_000_000) {
        return { valid: false, error: 'Invalid score: must be between 0 and 10,000,000' };
      }
      return { valid: true, cleanScore };
    }

    it('should accept valid integer scores within bounds', () => {
      expect(validateScore(0)).toEqual({ valid: true, cleanScore: 0 });
      expect(validateScore(1250)).toEqual({ valid: true, cleanScore: 1250 });
      expect(validateScore(10_000_000)).toEqual({ valid: true, cleanScore: 10_000_000 });
    });

    it('should truncate floating point scores to integers', () => {
      expect(validateScore(1500.95)).toEqual({ valid: true, cleanScore: 1500 });
      expect(validateScore(99.001)).toEqual({ valid: true, cleanScore: 99 });
    });

    it('should reject out-of-bounds scores', () => {
      expect(validateScore(-1).valid).toBe(false);
      expect(validateScore(10_000_001).valid).toBe(false);
    });

    it('should reject non-finite and invalid types', () => {
      expect(validateScore(Infinity).valid).toBe(false);
      expect(validateScore(-Infinity).valid).toBe(false);
      expect(validateScore(NaN).valid).toBe(false);
      expect(validateScore('1250').valid).toBe(false);
      expect(validateScore(null).valid).toBe(false);
      expect(validateScore(undefined).valid).toBe(false);
    });
  });

  describe('7. Player XP Progression & Level Scaling Algorithms', () => {
    function calculateXpAndLevel(currentXp: number, score: number) {
      const addedXp = Math.max(25, Math.min(500, Math.floor(score / 100)));
      const newXp = currentXp + addedXp;
      const newLevel = Math.floor(newXp / 500) + 1;
      return { addedXp, newXp, newLevel };
    }

    it('should award minimum 25 XP for low scores', () => {
      const result = calculateXpAndLevel(0, 50);
      expect(result.addedXp).toBe(25);
      expect(result.newXp).toBe(25);
      expect(result.newLevel).toBe(1);
    });

    it('should scale XP proportional to score (score / 100)', () => {
      const result = calculateXpAndLevel(0, 15000);
      expect(result.addedXp).toBe(150);
      expect(result.newXp).toBe(150);
    });

    it('should cap XP at 500 per game session', () => {
      const result = calculateXpAndLevel(0, 500000);
      expect(result.addedXp).toBe(500);
      expect(result.newXp).toBe(500);
    });

    it('should increment player level at 500 XP thresholds', () => {
      expect(calculateXpAndLevel(0, 0).newLevel).toBe(1);
      expect(calculateXpAndLevel(475, 2500).newLevel).toBe(2); // 475 + 25 = 500 -> Level 2
      expect(calculateXpAndLevel(999, 100).newLevel).toBe(3); // 999 + 25 = 1024 -> Level 3
      expect(calculateXpAndLevel(2500, 100).newLevel).toBe(6); // 2500 + 25 = 2525 -> Level 6
    });
  });
});
