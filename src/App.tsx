import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ShieldCheck, LogOut, LayoutDashboard, FileText, Users, GraduationCap } from 'lucide-react';
import { Button } from './components/ui/button';

// Pages
import Dashboard from './pages/Dashboard';
import AccionesFormativas from './pages/AccionesFormativas';
import Participantes from './pages/Participantes';
import Certificados from './pages/Certificados';
import PublicVerify from './pages/PublicVerify';
import Login from './pages/Login';

const ProtectedRoute = ({ isAuth }: { isAuth: boolean }) => {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

const Layout = () => {
  const location = useLocation();
  const navItems = [
    { path: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { path: '/acciones', label: 'Acciones Formativas', icon: GraduationCap },
    { path: '/participantes', label: 'Registro Personas', icon: Users },
    { path: '/certificados', label: 'Gestión Certificados', icon: FileText },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white text-xs">UGT</div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-white tracking-tight uppercase">Certificados</h1>
            <p className="text-[10px] opacity-60">SP Salamanca</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-slate-600 text-white font-medium">U</div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{auth.currentUser?.email}</p>
              <p className="text-[10px] text-slate-500 truncate">Administrador</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2" onClick={handleLogout}>
            <LogOut className="w-3 h-3 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Plataforma'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
        <footer className="h-10 bg-white border-t border-slate-200 flex items-center px-8 justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">&copy; {new Date().getFullYear()} UGT Servicios Públicos Salamanca - Sistema de Certificación Interna</p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span>Estado Firebase: <span className="text-green-600 font-bold">ONLINE</span></span>
            <span>v1.0.2</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  const isAuth = !!user;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={isAuth ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Panel */}
        <Route element={<ProtectedRoute isAuth={isAuth} />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/acciones" element={<AccionesFormativas />} />
           <Route path="/participantes" element={<Participantes />} />
           <Route path="/certificados" element={<Certificados />} />
        </Route>

        {/* Public Routes */}
        <Route path="/v/:token" element={<PublicVerify />} />
      </Routes>
    </BrowserRouter>
  );
}
