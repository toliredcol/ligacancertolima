import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useAppConfig } from '../lib/AppConfigContext';
import { safeExternalUrl } from '../lib/safeExternalUrl';

const DELAY_MS = 10_000;
const COOLDOWN_MS = 300_000;
const RECHECK_MS = 30_000;
const SESSION_TIMEOUT_MS = 20 * 60 * 1000;
const SESSION_START_KEY = 'chatSessionStartTime';

const DEFAULT_IMG = 'https://tolired.com/wp-content/uploads/2026/08/chatica.png';
const DEFAULT_URL = 'https://wa.me/573158137106';

export default function FloatingChat() {
  const { whatsappImageUrl, whatsappLink, whatsappOpenNewTab, whatsappVisible } = useAppConfig();
  const [visible, setVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const recheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shouldShow = (): boolean => {
    const start = sessionStorage.getItem(SESSION_START_KEY);
    if (start && Date.now() - parseInt(start, 10) >= SESSION_TIMEOUT_MS) return false;
    const closed = sessionStorage.getItem('chatClosed');
    if (!closed) return true;
    return Date.now() - parseInt(closed, 10) >= COOLDOWN_MS;
  };

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_START_KEY)) {
      sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
    }
    const initial = setTimeout(() => {
      if (shouldShow()) setVisible(true);
      else startRecheck();
    }, DELAY_MS);

    return () => {
      clearTimeout(initial);
      if (recheckRef.current) clearInterval(recheckRef.current);
    };
  }, []);

  const startRecheck = () => {
    if (recheckRef.current) clearInterval(recheckRef.current);
    recheckRef.current = setInterval(() => {
      if (shouldShow()) {
        setVisible(true);
        clearInterval(recheckRef.current!);
        recheckRef.current = null;
      }
    }, RECHECK_MS);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    sessionStorage.setItem('chatClosed', String(Date.now()));
    startRecheck();
  };

  const waUrl = safeExternalUrl(whatsappLink) ?? DEFAULT_URL;
  const chatImg = whatsappImageUrl || DEFAULT_IMG;

  if (!whatsappVisible) return null;
  if (!visible) return null;

  return (
    <div
      className="fixed right-4 z-[9999] animate-fade-in"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    >
      <div className="relative inline-block">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-md transition-colors"
          aria-label="Cerrar"
        >
          <X size={12} className="text-white" />
        </button>

        {/* WhatsApp button */}
        <a
          href={waUrl}
          {...(whatsappOpenNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="block transition-transform hover:scale-105 active:scale-95"
          aria-label="Chatea con nosotros por WhatsApp"
        >
          {!imgError ? (
            <img
              src={chatImg}
              alt="Chat WhatsApp Liga Contra el Cáncer"
              onError={() => setImgError(true)}
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              }}
            />
          ) : (
            // Fallback if image not yet available
            <div
              className="flex items-center justify-center bg-green-500"
              style={{ width: 70, height: 70, borderRadius: '50%', boxShadow: '0 4px 16px rgba(0,0,0,0.22)' }}
            >
              <MessageCircle size={32} className="text-white" />
            </div>
          )}
        </a>
      </div>
    </div>
  );
}
