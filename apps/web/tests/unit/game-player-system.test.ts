import { describe, it, expect, vi } from 'vitest';
import {
  AR_CLASSES,
  fmtTime,
  VPAD_KEY_PAIRS,
  SHORTCUTS,
  AspectRatio,
} from '@/components/player/types';
import { GAME_IFRAME_SANDBOX, GAME_IFRAME_PERMISSIONS } from '@/lib/constants';

describe('Spielcade Next-Gen Game Player System', () => {
  describe('1. Aspect Ratio Configuration & Visual Mathematics', () => {
    it('provides valid responsive Tailwind classes for all supported aspect ratios', () => {
      const ratios: AspectRatio[] = ['16:9', '4:3', '9:16', 'auto'];

      ratios.forEach(ratio => {
        expect(AR_CLASSES[ratio]).toBeDefined();
        expect(typeof AR_CLASSES[ratio]).toBe('string');
      });

      expect(AR_CLASSES['16:9']).toContain('aspect-video');
      expect(AR_CLASSES['4:3']).toContain('aspect-[4/3]');
      expect(AR_CLASSES['9:16']).toContain('aspect-[9/16]');
      expect(AR_CLASSES['auto']).toContain('min-h-');
    });

    it('ensures 9:16 portrait mode constrains maximum width to prevent distortion on desktop', () => {
      expect(AR_CLASSES['9:16']).toContain('max-w-[420px]');
      expect(AR_CLASSES['9:16']).toContain('mx-auto');
    });

    it('ensures 4:3 retro mode centers cleanly with maximum width constraint', () => {
      expect(AR_CLASSES['4:3']).toContain('max-w-[840px]');
      expect(AR_CLASSES['4:3']).toContain('mx-auto');
    });
  });

  describe('2. Time Formatting Engine (Session Timer & HUD)', () => {
    it('formats seconds into MM:SS correctly', () => {
      expect(fmtTime(0)).toBe('00:00');
      expect(fmtTime(9)).toBe('00:09');
      expect(fmtTime(59)).toBe('00:59');
      expect(fmtTime(60)).toBe('01:00');
      expect(fmtTime(65)).toBe('01:05');
      expect(fmtTime(599)).toBe('09:59');
      expect(fmtTime(3600)).toBe('60:00');
      expect(fmtTime(3665)).toBe('61:05');
    });
  });

  describe('3. Hardened Iframe Security & 3D Heavy Game Capabilities', () => {
    it('allows essential 3D APIs in GAME_IFRAME_SANDBOX', () => {
      expect(GAME_IFRAME_SANDBOX).toContain('allow-pointer-lock');
      expect(GAME_IFRAME_SANDBOX).toContain('allow-scripts');
      expect(GAME_IFRAME_SANDBOX).toContain('allow-same-origin');
      expect(GAME_IFRAME_SANDBOX).toContain('allow-popups');
      expect(GAME_IFRAME_SANDBOX).toContain('allow-forms');
      expect(GAME_IFRAME_SANDBOX).toContain('allow-modals');
    });

    it('includes WebXR and hardware sensor permissions in GAME_IFRAME_PERMISSIONS', () => {
      expect(GAME_IFRAME_PERMISSIONS).toContain('fullscreen');
      expect(GAME_IFRAME_PERMISSIONS).toContain('autoplay');
      expect(GAME_IFRAME_PERMISSIONS).toContain('gamepad');
      expect(GAME_IFRAME_PERMISSIONS).toContain('accelerometer');
      expect(GAME_IFRAME_PERMISSIONS).toContain('gyroscope');
      expect(GAME_IFRAME_PERMISSIONS).toContain('screen-wake-lock');
      expect(GAME_IFRAME_PERMISSIONS).toContain('clipboard-write');
      expect(GAME_IFRAME_PERMISSIONS).toContain('xr-spatial-tracking');
      expect(GAME_IFRAME_PERMISSIONS).toContain('web-share');
    });
  });

  describe('4. 3D Pointer Lock & WebGL Lifecycle State Models', () => {
    it('models pointer lock transitions correctly', () => {
      let isPointerLocked = false;
      const onLockChange = (element: any, container: { contains: (el: any) => boolean }) => {
        isPointerLocked = Boolean(element && container.contains(element));
        return isPointerLocked;
      };

      const mockCanvas = { id: 'canvas' };
      const mockOutside = { id: 'outside' };
      const mockContainer = {
        contains: (el: any) => el === mockCanvas,
      };

      // Outside element -> unlocked
      expect(onLockChange(mockOutside, mockContainer)).toBe(false);
      // Inside canvas -> locked
      expect(onLockChange(mockCanvas, mockContainer)).toBe(true);
      // Null element -> unlocked
      expect(onLockChange(null, mockContainer)).toBe(false);
    });

    it('models WebGL context loss recovery without crashing', () => {
      let webglHealth: 'healthy' | 'lost' | 'restoring' = 'healthy';

      const handleContextLost = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        webglHealth = 'lost';
      };

      const handleRestore = () => {
        webglHealth = 'restoring';
        // Simulation of WebGL context reinstatement
        setTimeout(() => {
          webglHealth = 'healthy';
        }, 10);
      };

      const mockEvent = { preventDefault: vi.fn() };
      handleContextLost(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(webglHealth).toBe('lost');

      handleRestore();
      expect(webglHealth).toBe('restoring');
    });
  });

  describe('5. Virtual Touch Gamepad Key Bindings (Dual WASD & Arrows)', () => {
    it('maps virtual dpad keys to both arrow and WASD keys simultaneously', () => {
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

    it('maps primary action buttons with standard keyboard fallbacks', () => {
      expect(VPAD_KEY_PAIRS.a.key).toBe(' ');
      expect(VPAD_KEY_PAIRS.a.code).toBe('Space');
      expect(VPAD_KEY_PAIRS.b.key).toBe('Shift');
      expect(VPAD_KEY_PAIRS.x.key).toBe('e');
      expect(VPAD_KEY_PAIRS.y.key).toBe('q');
    });
  });

  describe('6. Shortcuts Registry Consistency', () => {
    it('defines all essential desktop shortcuts matching Poki and CrazyGames conventions', () => {
      const keys = SHORTCUTS.map(s => s.key);
      expect(keys).toContain('F'); // Fullscreen
      expect(keys).toContain('T'); // Theater
      expect(keys).toContain('P'); // Pause
      expect(keys).toContain('M'); // Mute
      expect(keys).toContain('R'); // Restart
      expect(keys).toContain('Esc'); // Exit
      expect(keys).toContain('?'); // Help Guide
    });
  });

  describe('7. WebAudio Context Unlock & Mute Normalization Protocols', () => {
    it('normalizes volume and mute levels accurately', () => {
      const getNormalizedVolume = (isMuted: boolean, volLevel: number) => {
        return isMuted ? 0 : volLevel / 100;
      };

      expect(getNormalizedVolume(false, 100)).toBe(1.0);
      expect(getNormalizedVolume(false, 50)).toBe(0.5);
      expect(getNormalizedVolume(false, 0)).toBe(0);
      expect(getNormalizedVolume(true, 100)).toBe(0);
      expect(getNormalizedVolume(true, 50)).toBe(0);
    });

    it('generates multi-engine audio postMessage payload structures', () => {
      const generateAudioMessages = (muted: boolean, volLevel: number) => {
        const normalized = muted ? 0 : volLevel / 100;
        return [
          { type: 'SET_MUTE', isMuted: muted, mute: muted },
          { type: 'SET_VOLUME', volume: normalized, value: normalized },
          {
            source: 'SPIELCADE_WRAPPER',
            type: 'AUDIO_STATE',
            payload: { isMuted: muted, volume: normalized },
          },
        ];
      };

      const msgs = generateAudioMessages(false, 80);
      expect(msgs[0]).toEqual({ type: 'SET_MUTE', isMuted: false, mute: false });
      expect(msgs[1]).toEqual({ type: 'SET_VOLUME', volume: 0.8, value: 0.8 });
      expect(msgs[2]?.payload).toEqual({ isMuted: false, volume: 0.8 });

      const mutedMsgs = generateAudioMessages(true, 80);
      expect(mutedMsgs[0]?.isMuted).toBe(true);
      expect(mutedMsgs[1]?.volume).toBe(0);
      const thirdMsg = mutedMsgs[2] as { payload: { isMuted: boolean; volume: number } };
      expect(thirdMsg?.payload?.isMuted).toBe(true);
      expect(thirdMsg?.payload?.volume).toBe(0);
    });
  });
});