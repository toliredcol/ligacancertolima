import { useLocation } from 'react-router-dom';
import { isEmbeddedApp, isStandaloneMode } from '../lib/environment';
import { usePwaMenuItems, MENU_ICONS } from '../lib/pwaMenu';
import { safeExternalUrl } from '../lib/safeExternalUrl';
import type { PwaMenuItem } from '../lib/pwaMenu';

function resolveHref(item: PwaMenuItem): string {
  if (item.type === 'enlace_externo') {
    return safeExternalUrl(item.target) ?? '#';
  }
  if (item.type === 'whatsapp') {
    return safeExternalUrl(item.target) ?? 'https://wa.me/573158137106';
  }
  // ruta_interna
  return item.target.startsWith('/') ? item.target : `#`;
}

function isItemActive(item: PwaMenuItem, pathname: string): boolean {
  if (item.type !== 'ruta_interna') return false;
  if (!item.target.startsWith('/')) return false;
  if (item.target === '/') return pathname === '/';
  return pathname === item.target || pathname.startsWith(item.target);
}

export default function BottomNav() {
  const location = useLocation();
  const items = usePwaMenuItems();

  if (isEmbeddedApp() || !isStandaloneMode()) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map(item => {
          const Icon = MENU_ICONS[item.icon] ?? MENU_ICONS['Circle'];
          const href = resolveHref(item);
          const active = isItemActive(item, location.pathname);
          const isExternal =
            item.type === 'whatsapp' || item.type === 'enlace_externo';

          const inner = (
            <span className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] px-1">
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </span>
          );

          const activeClass = active
            ? 'text-[#C41E3A]'
            : 'text-gray-400 hover:text-gray-600';

          return (
            <a
              key={item.id}
              href={href}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
