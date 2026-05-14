import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'android-chrome' | 'ios' | 'desktop-chrome' | 'desktop-edge' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isChrome = /chrome/i.test(ua) && !/edg/i.test(ua);
  const isEdge = /edg/i.test(ua);
  const isMobile = /mobi|android/i.test(ua);

  if (isIOS) return 'ios';
  if (isAndroid && isChrome) return 'android-chrome';
  if (!isMobile && isChrome) return 'desktop-chrome';
  if (!isMobile && isEdge) return 'desktop-edge';
  return 'other';
}

const PLATFORM_HINTS: Record<Platform, { steps: string[]; icon: string }> = {
  'android-chrome': {
    icon: '🤖',
    steps: ['Tap "Install" below', 'Confirm in the popup', 'Find PON Sim on your home screen'],
  },
  'ios': {
    icon: '🍎',
    steps: ['Tap the Share button (⬆) in Safari', 'Scroll down and tap "Add to Home Screen"', 'Tap "Add" — icon appears on home screen'],
  },
  'desktop-chrome': {
    icon: '💻',
    steps: ['Click "Install" below', 'Confirm in the Chrome popup', 'App opens in its own window (no browser chrome)'],
  },
  'desktop-edge': {
    icon: '💻',
    steps: ['Click "Install" below', 'Confirm in the Edge popup', 'App opens in its own window'],
  },
  'other': {
    icon: '📲',
    steps: ['Look for an install icon in your browser\'s address bar', 'Or use browser menu → "Install app"'],
  },
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>('other');
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as Record<string, unknown>).standalone === true;
    if (standalone) return;

    // Check if previously dismissed this session
    if (sessionStorage.getItem('pwa-dismissed')) return;

    const plat = detectPlatform();
    setPlatform(plat);

    // iOS: show manual install guide after 3s
    if (plat === 'ios') {
      setTimeout(() => setShow(true), 3000);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowSteps(true);
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (installed) return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#14532d', border: '1px solid #22c55e', borderRadius: 10,
      padding: '10px 20px', zIndex: 9999, color: '#86efac',
      fontFamily: 'monospace', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 24px #0008',
    }}>
      ✅ PON Sim installed successfully! Find it on your home screen / app list.
      <button onClick={() => setInstalled(false)} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: 16 }}>✕</button>
    </div>
  );

  if (dismissed || !show) return null;

  const hint = PLATFORM_HINTS[platform];
  const canNativeInstall = !!deferredPrompt && platform !== 'ios';

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: '#0f172a', border: '1px solid #3b82f6',
      borderRadius: 12, padding: '14px 16px', zIndex: 9999,
      boxShadow: '0 8px 32px #0008, 0 0 0 1px #3b82f620',
      maxWidth: 360, width: 'calc(100vw - 32px)',
      fontFamily: 'monospace',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 32 }}>📡</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>Install PON Simulator</div>
          <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
            Works offline · No app store · Free forever
          </div>
        </div>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none', color: '#475569',
          fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1, alignSelf: 'flex-start',
        }} aria-label="Dismiss">✕</button>
      </div>

      {/* Platform steps */}
      {(showSteps || platform === 'ios') && (
        <div style={{
          background: '#1e293b', borderRadius: 8, padding: '10px 12px', marginBottom: 10,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 6 }}>
            {hint.icon} Install on your device:
          </div>
          {hint.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, color: '#cbd5e1', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Benefit chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {['🔌 Works offline', '⚡ Instant launch', '📱 Fullscreen', '💾 Saves locally'].map(b => (
          <span key={b} style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 99, padding: '2px 8px', color: '#94a3b8', fontSize: 9,
          }}>{b}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {platform !== 'ios' && (
          <button onClick={handleInstall} style={{
            flex: 1, background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 0.5,
          }}>
            {canNativeInstall ? '⬇ Install Now' : '📋 How to Install'}
          </button>
        )}
        <button onClick={handleDismiss} style={{
          background: '#1e293b', color: '#64748b', border: '1px solid #334155',
          borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer',
        }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
