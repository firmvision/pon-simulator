import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as Record<string, unknown>).standalone === true;

    if (ios && !standalone) {
      setIsIOS(true);
      setShow(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (dismissed || !show) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: '#1e293b', border: '1px solid #3b82f6', borderRadius: 10,
      padding: '12px 16px', zIndex: 9999, display: 'flex', alignItems: 'center',
      gap: 12, boxShadow: '0 4px 24px #0008', maxWidth: 340, width: 'calc(100vw - 32px)',
    }}>
      <span style={{ fontSize: 28 }}>📡</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
          Install PON Simulator
        </div>
        {isIOS ? (
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
            Tap <strong style={{ color: '#60a5fa' }}>Share</strong> then{' '}
            <strong style={{ color: '#60a5fa' }}>Add to Home Screen</strong>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
            Works offline · No app store needed
          </div>
        )}
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          style={{
            background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
            padding: '6px 12px', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer',
          }}
        >
          Install
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', color: '#475569', border: 'none',
          fontSize: 16, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
