/**
 * Universal Hardware Gamepad Controller Bridge for Spielcade
 * Translates physical Xbox, PlayStation, Nintendo Switch, and Bluetooth controllers
 * into synthetic KeyboardEvents dispatched to the active game iframe.
 */

export type ControllerBrand = 'xbox' | 'playstation' | 'switch' | 'generic';

export interface GamepadButtonState {
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  leftStickX: number;
  leftStickY: number;
  lb: boolean;
  rb: boolean;
  lt: boolean;
  rt: boolean;
  start: boolean;
  select: boolean;
}

export interface GamepadInfo {
  id: string;
  brand: ControllerBrand;
  index: number;
  connected: boolean;
}

type ButtonListener = (state: GamepadButtonState, info: GamepadInfo | null) => void;

class GamepadEngine {
  private activeGamepadIndex: number | null = null;
  private animationFrameId: number | null = null;
  private listeners: Set<ButtonListener> = new Set();
  private targetWindow: Window | null = null;
  private deadzone: number = 0.28;

  // Active key press tracking to avoid stuck keys
  private activeKeys: Set<string> = new Set();

  // Current controller brand & info
  private currentInfo: GamepadInfo | null = null;

  // Previous button states for transition detection
  private prevButtonState: Record<string, boolean> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.handleConnected);
      window.addEventListener('gamepaddisconnected', this.handleDisconnected);
    }
  }

  public setTargetWindow(win: Window | null) {
    this.targetWindow = win;
  }

  public simulateKey(type: 'keydown' | 'keyup', key: string, code: string) {
    if (type === 'keydown') {
      this.activeKeys.add(key);
    } else {
      this.activeKeys.delete(key);
    }
    this.dispatchKeyEvent(type, key, code);
  }

  public subscribe(listener: ButtonListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state if available
    if (this.currentInfo) {
      listener(this.getEmptyButtonState(), this.currentInfo);
    }
    return () => this.listeners.delete(listener);
  }

  public vibrate(weakMagnitude = 0.4, strongMagnitude = 0.6, durationMs = 120) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (this.activeGamepadIndex === null) return;
    const gp = gamepads[this.activeGamepadIndex];
    if (gp && 'vibrationActuator' in gp && (gp as any).vibrationActuator) {
      try {
        (gp as any).vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude,
          strongMagnitude,
        });
      } catch {
        // Vibration not permitted or supported
      }
    }
  }

  private detectBrand(idString: string): ControllerBrand {
    const s = idString.toLowerCase();
    if (s.includes('xbox') || s.includes('x-box') || s.includes('045e')) {
      return 'xbox';
    }
    if (s.includes('dualshock') || s.includes('dualsense') || s.includes('playstation') || s.includes('sony') || s.includes('054c')) {
      return 'playstation';
    }
    if (s.includes('switch') || s.includes('nintendo') || s.includes('joy-con') || s.includes('057e')) {
      return 'switch';
    }
    return 'generic';
  }

  private handleConnected = (e: GamepadEvent) => {
    const gp = e.gamepad;
    this.activeGamepadIndex = gp.index;
    this.currentInfo = {
      id: gp.id,
      brand: this.detectBrand(gp.id),
      index: gp.index,
      connected: true,
    };
    this.startPolling();
    this.vibrate(0.3, 0.5, 100);
  };

  private handleDisconnected = (e: GamepadEvent) => {
    if (this.activeGamepadIndex === e.gamepad.index) {
      this.releaseAllKeys();
      this.activeGamepadIndex = null;
      this.currentInfo = null;
      this.stopPolling();
      this.notifyListeners(this.getEmptyButtonState(), null);
    }
  };

  private startPolling() {
    if (this.animationFrameId !== null) return;
    const poll = () => {
      this.pollGamepad();
      this.animationFrameId = requestAnimationFrame(poll);
    };
    this.animationFrameId = requestAnimationFrame(poll);
  }

  private stopPolling() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private pollGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (this.activeGamepadIndex === null) {
      // Check if any gamepad is connected
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          this.activeGamepadIndex = i;
          this.currentInfo = {
            id: gamepads[i]!.id,
            brand: this.detectBrand(gamepads[i]!.id),
            index: i,
            connected: true,
          };
          break;
        }
      }
      if (this.activeGamepadIndex === null) return;
    }

    const gp = gamepads[this.activeGamepadIndex];
    if (!gp || !gp.connected) return;

    // Standard Gamepad Mapping
    const b = gp.buttons;
    const axes = gp.axes;

    const leftX = axes[0] ?? 0;
    const leftY = axes[1] ?? 0;

    // D-Pad + Analog Left Stick normalized direction
    const up = (b[12]?.pressed ?? false) || leftY < -this.deadzone;
    const down = (b[13]?.pressed ?? false) || leftY > this.deadzone;
    const left = (b[14]?.pressed ?? false) || leftX < -this.deadzone;
    const right = (b[15]?.pressed ?? false) || leftX > this.deadzone;

    // Action Buttons
    const btnA = b[0]?.pressed ?? false; // Space / Jump / Action
    const btnB = b[1]?.pressed ?? false; // Shift / Dash / Back
    const btnX = b[2]?.pressed ?? false; // KeyE / Interact
    const btnY = b[3]?.pressed ?? false; // KeyQ / Special
    const btnLB = b[4]?.pressed ?? false;
    const btnRB = b[5]?.pressed ?? false;
    const btnLT = b[6]?.pressed ?? false;
    const btnRT = b[7]?.pressed ?? false;
    const btnSelect = b[8]?.pressed ?? false;
    const btnStart = b[9]?.pressed ?? false; // Enter / Pause

    const buttonState: GamepadButtonState = {
      a: btnA,
      b: btnB,
      x: btnX,
      y: btnY,
      dpadUp: up,
      dpadDown: down,
      dpadLeft: left,
      dpadRight: right,
      leftStickX: leftX,
      leftStickY: leftY,
      lb: btnLB,
      rb: btnRB,
      lt: btnLT,
      rt: btnRT,
      start: btnStart,
      select: btnSelect,
    };

    // Translate to synthetic keyboard events
    this.syncKey('ArrowUp', 'KeyW', up);
    this.syncKey('ArrowDown', 'KeyS', down);
    this.syncKey('ArrowLeft', 'KeyA', left);
    this.syncKey('ArrowRight', 'KeyD', right);
    this.syncKey(' ', 'Space', btnA);
    this.syncKey('Shift', 'ShiftLeft', btnB);
    this.syncKey('e', 'KeyE', btnX);
    this.syncKey('q', 'KeyQ', btnY);
    this.syncKey('Enter', 'Enter', btnStart);
    this.syncKey('Escape', 'Escape', btnSelect);

    this.notifyListeners(buttonState, this.currentInfo);
  }

  private syncKey(key: string, code: string, isPressed: boolean) {
    const wasPressed = this.prevButtonState[key] ?? false;
    this.prevButtonState[key] = isPressed;

    if (isPressed && !wasPressed) {
      this.dispatchKeyEvent('keydown', key, code);
      this.activeKeys.add(key);
    } else if (!isPressed && wasPressed) {
      this.dispatchKeyEvent('keyup', key, code);
      this.activeKeys.delete(key);
    }
  }

  private dispatchKeyEvent(type: 'keydown' | 'keyup', key: string, code: string) {
    const targets = [this.targetWindow, typeof window !== 'undefined' ? window : null];

    targets.forEach((target) => {
      if (!target) return;
      try {
        const evt = new KeyboardEvent(type, {
          key,
          code,
          keyCode: this.getKeyCode(key),
          which: this.getKeyCode(key),
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        target.dispatchEvent(evt);
        if (target.document) {
          target.document.dispatchEvent(evt);
        }
      } catch {
        // Cross-origin iframe security prevents direct event injection on non-same-origin frames.
        // For cross-origin game iframes, send postMessage so SpielcadeSDK can trigger synthetic events.
        try {
          target.postMessage(
            {
              type: 'SPIELCADE_GAMEPAD_EVENT',
              eventType: type,
              key,
              code,
            },
            '*'
          );
        } catch {}
      }
    });
  }

  private getKeyCode(key: string): number {
    switch (key) {
      case 'ArrowUp': return 38;
      case 'ArrowDown': return 40;
      case 'ArrowLeft': return 37;
      case 'ArrowRight': return 39;
      case ' ': return 32;
      case 'Shift': return 16;
      case 'Enter': return 13;
      case 'Escape': return 27;
      case 'e': case 'KeyE': return 69;
      case 'q': case 'KeyQ': return 81;
      case 'w': case 'KeyW': return 87;
      case 's': case 'KeyS': return 83;
      case 'a': case 'KeyA': return 65;
      case 'd': case 'KeyD': return 68;
      default: return 0;
    }
  }

  private releaseAllKeys() {
    this.activeKeys.forEach((key) => {
      this.dispatchKeyEvent('keyup', key, key);
    });
    this.activeKeys.clear();
    this.prevButtonState = {};
  }

  private notifyListeners(state: GamepadButtonState, info: GamepadInfo | null) {
    this.listeners.forEach((listener) => listener(state, info));
  }

  private getEmptyButtonState(): GamepadButtonState {
    return {
      a: false,
      b: false,
      x: false,
      y: false,
      dpadUp: false,
      dpadDown: false,
      dpadLeft: false,
      dpadRight: false,
      leftStickX: 0,
      leftStickY: 0,
      lb: false,
      rb: false,
      lt: false,
      rt: false,
      start: false,
      select: false,
    };
  }
}

export const gamepadEngine = new GamepadEngine();
