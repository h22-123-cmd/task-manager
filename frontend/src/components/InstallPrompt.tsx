import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={styles.installPrompt}>
      <div style={styles.promptContent}>
        <div style={styles.promptText}>
          <strong>📱 Install Task Manager</strong>
          <p>Install our app for a better experience</p>
        </div>
        <div style={styles.promptActions}>
          <button onClick={handleDismiss} style={styles.dismissButton}>
            Later
          </button>
          <button onClick={handleInstall} style={styles.installButton}>
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  installPrompt: {
    position: 'fixed' as 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    padding: '15px',
    border: '1px solid #e2e8f0'
  },
  promptContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px'
  },
  promptText: {
    flex: 1
  },
  promptActions: {
    display: 'flex',
    gap: '10px'
  },
  dismissButton: {
    padding: '8px 16px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  },
  installButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#4299e1',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default InstallPrompt;