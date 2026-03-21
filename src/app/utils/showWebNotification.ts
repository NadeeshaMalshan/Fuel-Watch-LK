/** App notification artwork (same asset as manifest / favicon). */
export const NOTIFICATION_ICON_PATH = '/favicon.svg';

/** Register the app SW after the user opts in, so mobile can show alerts via `showNotification`. */
export async function ensureServiceWorkerForNotifications(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    /* ignore */
  }
}

function notificationIconUrl(): string {
  if (typeof window === 'undefined') return NOTIFICATION_ICON_PATH;
  return new URL(NOTIFICATION_ICON_PATH, window.location.origin).href;
}

/**
 * Shows a system notification. Prefer the active service worker when available —
 * on many mobile browsers this is more reliable than `new Notification()` when
 * the tab is in the background. Uses absolute URLs for icon/badge (required on some devices).
 */
export async function showWebNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const iconUrl = notificationIconUrl();
  const merged: NotificationOptions = {
    ...options,
    icon: options?.icon ?? iconUrl,
    badge: options?.badge ?? iconUrl,
  };

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.active) {
        await reg.showNotification(title, merged);
        return;
      }
    } catch {
      /* fall through to Notification API */
    }
  }

  new Notification(title, merged);
}
