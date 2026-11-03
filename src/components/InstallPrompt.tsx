import { useEffect, useRef, useState } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { isEmbeddedApp, isStandaloneMode } from '../lib/environment';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'pwa_install_dismissed_at';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const AUTO_DISMISS_MS = 8000;

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  return isIos && /Safari/i.test(ua) && !/\bwv\)/.test(ua);
}

function wasDismissedRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < SEVEN_DAYS_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setShow(false);
      setLeaving(false);
    }, 250);
  };

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    rememberDismissal();
    hide();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isEmbeddedApp() || isStandaloneMode()) return;
    if (wasDismissedRecently()) return;

    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        rememberDismissal();
        hide();
      }, AUTO_DISMISS_MS);
    };

    if (isIosSafari()) {
      setShow(true);
      startTimer();
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
      startTimer();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (!deferred) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    rememberDismissal();
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    hide();
  };

  const isIos = isIosSafari();

  return (
    <div
      className={`fixed left-3 right-3 bottom-3 z-[9998] sm:left-auto sm:right-4 sm:w-[340px] transition-all duration-300 ease-out ${
        leaving ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center flex-shrink-0">
            {isIos ? <PlusSquare size={22} /> : <Download size={22} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {isIos ? 'Agrega la app a tu inicio' : 'Instala la app'}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {isIos
                ? 'Toca el botón Compartir y elige "Agregar a pantalla de inicio".'
                : 'Tenla siempre a la mano como una aplicación.'}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cerrar aviso de instalación"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          {!isIos && (
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-[#C41E3A] hover:bg-[#a81a33] text-white text-sm font-semibold transition-colors active:scale-[0.98]"
            >
              <Download size={16} />
              Instalar
            </button>
          )}
          {isIos && (
            <div className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-[#C41E3A] text-white text-sm font-semibold px-3">
              <Share size={16} />
              Compartir → Agregar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
