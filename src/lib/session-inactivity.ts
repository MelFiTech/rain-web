const DEFAULT_INACTIVITY_MINUTES = 10;

/** Idle time before auto logout (client-side). Server session is cleared on logout. */
export function getSessionInactivityMs(): number {
  const raw = process.env.NEXT_PUBLIC_SESSION_INACTIVITY_MINUTES?.trim();
  if (!raw) return DEFAULT_INACTIVITY_MINUTES * 60 * 1000;
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes < 1) {
    return DEFAULT_INACTIVITY_MINUTES * 60 * 1000;
  }
  return minutes * 60 * 1000;
}
