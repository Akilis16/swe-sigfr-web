import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const token = useAuthStore((s) => s.token);
  const router = useRouterState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && router.location.pathname !== '/login') {
      navigate({ to: '/login' });
    } else if (token && router.location.pathname === '/login') {
      navigate({ to: '/' });
    }
  }, [token, router.location.pathname, navigate]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto h-full relative">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
