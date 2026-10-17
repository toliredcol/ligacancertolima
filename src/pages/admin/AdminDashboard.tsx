import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  Image, BookOpen, FileQuestion,
  MessageCircle, Award, LogOut, Menu, X, BarChart3, Users, ImageIcon, Images, FileText, Shuffle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppConfig } from '../../lib/AppConfigContext';

// Sub-pages
import AdminStats from './sections/AdminStats';
import AdminSlider from './sections/AdminSlider';
import AdminModules from './sections/AdminModules';
import AdminQuizzes from './sections/AdminQuizzes';
import AdminTestimonials from './sections/AdminTestimonials';
import AdminDiploma from './sections/AdminDiploma';
import AdminLogoConfig from './sections/AdminLogoConfig';
import AdminUserStats from './sections/AdminUserStats';
import AdminImages from './sections/AdminImages';
import AdminPages from './sections/AdminPages';
import AdminMatchingGame from './sections/AdminMatchingGame';
import AdminWhatsAppConfig from './sections/AdminWhatsAppConfig';
import AdminStories from './sections/AdminStories';

const navItems = [
  { to: '/admin/dashboard', label: 'Estadísticas', icon: BarChart3, exact: true },
  { to: '/admin/dashboard/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/dashboard/slider', label: 'Slider de Inicio', icon: Image },
  { to: '/admin/dashboard/modulos', label: 'Contenido', icon: BookOpen },
  { to: '/admin/dashboard/quizzes', label: 'Quizzes', icon: FileQuestion },
  { to: '/admin/dashboard/testimonios', label: 'Testimonios', icon: MessageCircle },
  { to: '/admin/dashboard/diploma', label: 'Diploma', icon: Award },
  { to: '/admin/dashboard/logo', label: 'Logo', icon: ImageIcon },
  { to: '/admin/dashboard/imagenes', label: 'Imágenes', icon: Images },
  { to: '/admin/dashboard/paginas', label: 'Páginas', icon: FileText },
  { to: '/admin/dashboard/emparejar', label: 'Emparejar Conceptos', icon: Shuffle },
  { to: '/admin/dashboard/whatsapp', label: 'Botón de WhatsApp', icon: MessageCircle },
  { to: '/admin/dashboard/cuentos', label: 'El Rincón de los Cuentos', icon: BookOpen },
];

export default function AdminDashboard() {
  const [session, setSession] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logoUrl } = useAppConfig();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin');
      else setSession(true);
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-[#5170ff] border-b border-blue-700 shadow-sm sticky top-0 z-50">
        <div className="flex items-center h-14 px-4 gap-3 max-w-7xl mx-auto">
          <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors md:hidden">
            {menuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
          <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
          <div className="flex-1">
            <p className="font-bold text-white text-sm leading-tight">Panel Admin</p>
            <p className="text-white/60 text-[10px]">Liga Contra el Cáncer - Tolima</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors">
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-14 z-40 h-[calc(100vh-56px)] w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-[#5170ff]' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Overlay */}
        {menuOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<AdminStats />} />
            <Route path="/usuarios" element={<AdminUserStats />} />
            <Route path="/slider" element={<AdminSlider />} />
            <Route path="/modulos" element={<AdminModules />} />
            <Route path="/quizzes" element={<AdminQuizzes />} />
            <Route path="/testimonios" element={<AdminTestimonials />} />
            <Route path="/diploma" element={<AdminDiploma />} />
            <Route path="/logo" element={<AdminLogoConfig />} />
            <Route path="/imagenes" element={<AdminImages />} />
            <Route path="/paginas" element={<AdminPages />} />
            <Route path="emparejar" element={<AdminMatchingGame />} />
            <Route path="whatsapp" element={<AdminWhatsAppConfig />} />
            <Route path="cuentos" element={<AdminStories />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
