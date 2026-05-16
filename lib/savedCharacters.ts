// Persists characters the user generates so the landing-page IntroStage can
// showcase their real avatars on the next page load. Stored in localStorage
// because the three face captures are data URLs (~30-40 KB each as JPEG) and
// a handful of characters comfortably fit under the ~5 MB quota.

const KEY = 'wee:characters';
const MAX = 12; // safety cap so we never blow past localStorage quota

export type SavedCharacter = {
  id: string;
  createdAt: number;
  // Mirrors the avatar config shape (skinTone, hairColor, faceTexture, etc.)
  // Kept loose because the config is plain JSON we can shovel through buildAvatar.
  config: Record<string, unknown>;
};

export function loadSavedCharacters(): SavedCharacter[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Save a character to the front of the list (newest first). If the quota would
// blow, trim oldest entries until it fits. Returns the new list.
export function saveCharacter(config: Record<string, unknown>): SavedCharacter[] {
  if (typeof window === 'undefined') return [];
  const existing = loadSavedCharacters();
  const entry: SavedCharacter = {
    id: `wee-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    config: { ...config },
  };
  let list = [entry, ...existing].slice(0, MAX);
  while (list.length > 0) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
      return list;
    } catch {
      // Likely QuotaExceededError — drop the oldest and retry.
      list = list.slice(0, list.length - 1);
    }
  }
  return [];
}

export function clearSavedCharacters(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}
