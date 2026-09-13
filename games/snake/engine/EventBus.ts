import * as Phaser from 'phaser';

const EventEmitterClass = Phaser.Events?.EventEmitter || (Phaser as any).default?.Events?.EventEmitter;
export const EventBus = new EventEmitterClass();