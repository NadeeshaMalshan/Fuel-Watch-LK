import { useCallback, useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

const STORAGE_KEY = 'fuelalert-pwa-install-dismissed-at';
const SUPPRESS_DAYS = 45;
const SHOW_AFTER_MS = 18_000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isMobileLayout(): boolean {
  return window.matchMedia('(max-width: 767px)').matches;
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return (
    navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1
  );
}

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const t = new Date(raw).getTime();
    if (Number.isNaN(t)) return false;
    const days = (Date.now() - t) / 86_400_000;
    return days < SUPPRESS_DAYS;
  } catch {
    return false;
  }
}

/**
 * Unobtrusive mobile-only hint to install the PWA: waits before showing,
 * small bottom bar, easy dismiss, suppressed for weeks after dismiss.
 */
export function PwaInstallPrompt() {
  const { theme, t } = useTheme();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [timerDone, setTimerDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isMobileLayout() || isStandalone() || isDismissedRecently()) return;

    const id = window.setTimeout(() => setTimerDone(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPrompt = (e: Event) => {
      if (!isMobileLayout() || isStandalone()) return;
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDismissed(true);
        setDeferredPrompt(null);
      }
    } catch {
      /* user cancelled or prompt failed */
    } finally {
      setInstalling(false);
    }
  };

  const showAndroid = Boolean(timerDone && deferredPrompt && !dismissed);
  const showIos = Boolean(timerDone && isIos() && !deferredPrompt && !dismissed);

  if (!showAndroid && !showIos) return null;

  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
      role="region"
      aria-label={t('pwa.a11yRegion')}
    >
      <div
        className={`pointer-events-auto flex w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl border shadow-lg ${
          isDark
            ? 'border-border bg-card/95 text-foreground backdrop-blur-md'
            : 'border-border/60 bg-background/95 text-foreground backdrop-blur-md shadow-black/10'
        }`}
      >
        <div className="flex flex-1 gap-3 p-3 sm:p-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
            }`}
            aria-hidden
          >
            <Download className="size-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold leading-tight">
              {showIos ? t('pwa.titleIos') : t('pwa.title')}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {showIos ? t('pwa.iosHint') : t('pwa.subtitle')}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {showAndroid ? (
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  disabled={installing}
                  onClick={() => void onInstall()}
                >
                  {t('pwa.install')}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground"
                onClick={dismiss}
              >
                {t('pwa.later')}
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className={`shrink-0 rounded-lg p-1.5 transition-colors ${
              isDark
                ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label={t('pwa.close')}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
