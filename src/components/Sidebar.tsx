import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Users, Settings, History, UserCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Sidebar() {
  const router = useRouterState();
  const role = useAuthStore((s) => s.role);

  if (router.location.pathname === '/login') return null;

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 h-screen flex-shrink-0 z-50">
      <div className="flex-1 flex flex-col gap-6 w-full px-2">
        <Link to="/" className="w-full aspect-square rounded-xl flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 [&.active]:bg-emerald-100 [&.active]:text-emerald-600 transition-colors">
          <Home size={28} />
        </Link>
        
        {role === 'ADMINISTRADOR' && (
          <>
            <Link to="/historico" className="w-full aspect-square rounded-xl flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 [&.active]:bg-emerald-100 [&.active]:text-emerald-600 transition-colors">
              <History size={28} />
            </Link>
            <Link to="/usuarios" className="w-full aspect-square rounded-xl flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 [&.active]:bg-emerald-100 [&.active]:text-emerald-600 transition-colors">
              <Users size={28} />
            </Link>
            <Link to="/configuracoes" className="w-full aspect-square rounded-xl flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 [&.active]:bg-emerald-100 [&.active]:text-emerald-600 transition-colors">
              <Settings size={28} />
            </Link>
          </>
        )}

        <Link to="/perfil" className="w-full aspect-square rounded-xl flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 [&.active]:bg-emerald-100 [&.active]:text-emerald-600 transition-colors">
          <UserCircle size={28} />
        </Link>
      </div>
    </div>
  );
}
