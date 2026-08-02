import { UserProfile, UserSettings, GameState } from '../types';

const PROFILE_KEY = 'prajurit_chess_profile_v1';
const SETTINGS_KEY = 'prajurit_chess_settings_v1';
const HISTORY_KEY = 'prajurit_chess_history_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  boardTheme: 'default',
  soundEnabled: true,
  soundVolume: 0.7,
  autoFlip: false,
  highlightLegalMoves: true,
  showEvalBar: true,
  showBestMoveHint: true
};

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return createDefaultGuestProfile();
  }

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  const newProfile = createDefaultGuestProfile();
  saveProfile(newProfile);
  return newProfile;
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // handle storage errors
  }
}

function createDefaultGuestProfile(): UserProfile {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `guest-${Date.now()}-${randomNum}`,
    username: `PrajuritGuest_${randomNum}`,
    displayName: `Penyatur Kasual #${randomNum}`,
    avatar: '⚔️',
    rating: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    isGuest: true,
    friends: ['Dimas_Grandmaster', 'Rani_ChessPro', 'Bima_Tactics'],
    createdDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
  };
}

export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }

  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // handle storage errors
  }
}

export function getGameHistory(): GameState[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveGameToHistory(game: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getGameHistory();
    // Keep max 30 recent games
    const updated = [game, ...existing.filter((g) => g.id !== game.id)].slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    // Update user profile stats
    const profile = getStoredProfile();
    profile.gamesPlayed += 1;

    if (game.winner === 'w' && game.playerWhite.id === profile.id) {
      profile.wins += 1;
      profile.rating += 15;
    } else if (game.winner === 'b' && game.playerBlack.id === profile.id) {
      profile.wins += 1;
      profile.rating += 15;
    } else if (game.winner === 'draw') {
      profile.draws += 1;
    } else if (game.winner) {
      profile.losses += 1;
      profile.rating = Math.max(400, profile.rating - 12);
    }

    saveProfile(profile);
  } catch {
    // handle storage errors
  }
}
