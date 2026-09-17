export interface ConsentPreferences {
  version: number;
  essential: true; // Always true for game saves and session tokens
  analytics: boolean;
  marketing: boolean;
  isAgeConfirmed: boolean; // Confirms 13+ under COPPA / 16+ in EU
  timestamp: string;
}

export const CONSENT_STORAGE_KEY = 'spielcade_consent_v1';
export const CONSENT_COOKIE_NAME = 'spielcade_consent';

export const DEFAULT_CONSENT: ConsentPreferences = {
  version: 1,
  essential: true,
  analytics: false,
  marketing: false,
  isAgeConfirmed: false,
  timestamp: '',
};

/**
 * Checks if running in browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Retrieves existing consent preferences from localStorage or cookie.
 */
export function getStoredConsent(): ConsentPreferences | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.version === 1) {
      return {
        version: 1,
        essential: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        isAgeConfirmed: Boolean(parsed.isAgeConfirmed),
        timestamp: String(parsed.timestamp || ''),
      };
    }
  } catch {
    // Malformed localStorage
  }

  return null;
}

/**
 * Persists user consent preferences to localStorage and sets a 1-year cookie.
 * Dispatches `spielcade:consent_updated` event to notify analytics/ad listeners.
 */
export function saveConsent(preferences: {
  analytics?: boolean;
  marketing?: boolean;
  isAgeConfirmed?: boolean;
}): ConsentPreferences {
  const fullConsent: ConsentPreferences = {
    version: 1,
    essential: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    isAgeConfirmed: Boolean(preferences.isAgeConfirmed),
    timestamp: new Date().toISOString(),
  };

  if (isBrowser()) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullConsent));

      // 1-year cookie with SameSite=Lax for Edge middleware inspection
      const maxAge = 365 * 24 * 60 * 60;
      const cookieValue = encodeURIComponent(
        JSON.stringify({
          v: fullConsent.version,
          a: fullConsent.analytics ? 1 : 0,
          m: fullConsent.marketing ? 1 : 0,
          age: fullConsent.isAgeConfirmed ? 1 : 0,
        })
      );
      document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

      // Dispatch event to window
      window.dispatchEvent(
        new CustomEvent('spielcade:consent_updated', {
          detail: fullConsent,
        })
      );
    } catch (e) {
      console.warn('Failed to persist consent:', e);
    }
  }

  return fullConsent;
}

/**
 * Check if the user has already made an explicit consent decision.
 */
export function hasConsented(): boolean {
  return getStoredConsent() !== null;
}

/**
 * Trigger opening of the Cookie Preferences modal from anywhere (e.g. footer button).
 */
export function openConsentModal(): void {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent('spielcade:open_consent_modal'));
  }
}
