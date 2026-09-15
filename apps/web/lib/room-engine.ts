import { createClient } from '@/lib/supabase/client';

export interface DuelPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  hasFinished: boolean;
}

export interface DuelRoomState {
  code: string;
  gameSlug: string;
  gameTitle: string;
  status: 'lobby' | 'countdown' | 'playing' | 'finished';
  countdown: number;
  players: Record<string, DuelPlayer>;
  winnerId?: string;
  startedAt?: number;
}

export interface RoomReaction {
  id: string;
  playerId: string;
  emoji: string;
  timestamp: number;
}

// Generate random uppercase 4-character code (e.g. "9X4K")
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const MULTIPLAYER_SUPPORTED_GAMES = [
  { slug: 'snake', title: 'Neon Snake', category: 'Arcade', icon: '🐍', bg: 'from-emerald-500/20 to-green-600/20' },
  { slug: '2048', title: '2048 Classic', category: 'Puzzle', icon: '🔢', bg: 'from-amber-500/20 to-orange-600/20' },
  { slug: 'flappy-bird', title: 'Neon Flyer', category: 'Arcade', icon: '🚀', bg: 'from-cyan-500/20 to-blue-600/20' },
  { slug: 'pull-the-pin-3d-help-police', title: 'Pull The Pin 3D', category: 'Strategy', icon: '📌', bg: 'from-rose-500/20 to-red-600/20' },
  { slug: 'blade-merge', title: 'Blade Merge', category: 'Action', icon: '⚔️', bg: 'from-fuchsia-500/20 to-pink-600/20' },
];

/**
 * Creates and connects a real-time multiplayer broadcast channel for an arcade room
 */
export function createRoomChannel(
  roomCode: string,
  onStateUpdate: (state: Partial<DuelRoomState>) => void,
  onScoreUpdate: (data: { playerId: string; score: number }) => void,
  onReaction: (reaction: RoomReaction) => void
) {
  const supabase = createClient();
  const channelName = `arcade-room-${roomCode.toUpperCase()}`;

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: true },
    },
  });

  channel
    .on('broadcast', { event: 'room_state' }, ({ payload }) => {
      onStateUpdate(payload);
    })
    .on('broadcast', { event: 'score_update' }, ({ payload }) => {
      onScoreUpdate(payload);
    })
    .on('broadcast', { event: 'reaction' }, ({ payload }) => {
      onReaction(payload);
    })
    .subscribe();

  return {
    channel,
    broadcastState: (state: Partial<DuelRoomState>) => {
      channel.send({
        type: 'broadcast',
        event: 'room_state',
        payload: state,
      });
    },
    broadcastScore: (playerId: string, score: number) => {
      channel.send({
        type: 'broadcast',
        event: 'score_update',
        payload: { playerId, score },
      });
    },
    broadcastReaction: (reaction: RoomReaction) => {
      channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: reaction,
      });
    },
    leave: () => {
      supabase.removeChannel(channel);
    },
  };
}
