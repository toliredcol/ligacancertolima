import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, MessageCircle } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home, exact: true },
  { to: '/modulos', label: 'Módulos', icon: BookOpen, exact: false },
  { to: '/progreso', label: 'Mi Progreso', icon: Trophy, exact: false },
  { to: '/testimonios', label: 'Testimonios', icon: MessageCircle, exact: false },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[48px] ${
                active ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
