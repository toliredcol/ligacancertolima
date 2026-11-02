import { useLocation } from 'react-router-dom';
import { Home, BookOpen, Briefcase, MessageCircle } from 'lucide-react';
import { useAppConfig } from '../lib/AppConfigContext';
import { safeExternalUrl } from '../lib/safeExternalUrl';
import { isEmbeddedApp, isStandaloneMode } from '../lib/environment';

const DEFAULT_WHATSAPP_LINK = 'https://wa.me/573158137106';
const SERVICES_PATH = '/pagina/portafolio-de-servicios';

export default function BottomNav() {
  const location = useLocation();
  const { whatsappLink } = useAppConfig();

  if (isEmbeddedApp() || !isStandaloneMode()) return null;

  const waUrl = safeExternalUrl(whatsappLink) ?? DEFAULT_WHATSAPP_LINK;

  const items = [
    {
      key: 'inicio',
      label: 'Inicio',
      icon: Home,
      href: '/',
      active: location.pathname === '/',
      external: false,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      href: waUrl,
      active: false,
      external: true,
    },
    {
      key: 'modulos',
      label: 'Módulos',
      icon: BookOpen,
      href: '/modulos',
      active: location.pathname === '/modulos' || location.pathname.startsWith('/modulo/'),
      external: false,
    },
    {
      key: 'servicios',
      label: 'Servicios',
      icon: Briefcase,
      href: SERVICES_PATH,
      active: location.pathname === SERVICES_PATH,
      external: false,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map(({ key, label, icon: Icon, href, active, external }) => {
          const inner = (
            <span className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] px-1">
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </span>
          );

          const activeClass = active
            ? 'text-[#C41E3A]'
            : 'text-gray-400 hover:text-gray-600';

          if (external) {
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chatear por WhatsApp"
                className={`${activeClass} transition-colors`}
              >
                {inner}
              </a>
            );
          }

          return (
            <a
              key={key}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`${activeClass} transition-colors`}
            >
              {inner}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
