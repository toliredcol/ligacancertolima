import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import UserTypeModal from './components/UserTypeModal';
import FloatingChat from './components/FloatingChat';
import AccessibilityControl from './components/AccessibilityControl';
import { AppConfigProvider } from './lib/AppConfigContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const ModulesPage = lazy(() => import('./pages/ModulesPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));

export default function App() {
  return (
    <AppConfigProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppConfigProvider>
  );
}

function PublicLayout() {
  const location = useLocation();
  const isStoriesRoute = location.pathname === '/el-rincon-de-los-cuentos';

  return (
    <div className="min-h-screen bg-gray-50">
      <UserTypeModal />
      <FloatingChat />
      {!isStoriesRoute && <AccessibilityControl />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/modulos" element={<ModulesPage />} />
        <Route path="/modulo/:slug" element={<ModulePage />} />
        <Route path="/progreso" element={<ProgressPage />} />
        <Route path="/testimonios" element={<TestimonialsPage />} />
        <Route path="/pagina/:slug" element={<ContentPage />} />
        <Route path="/el-rincon-de-los-cuentos" element={<StoriesPage />} />
      </Routes>
    </div>
  );
}

function AdminRoute() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/dashboard/*" element={<AdminDashboard />} />
    </Routes>
  );
}
