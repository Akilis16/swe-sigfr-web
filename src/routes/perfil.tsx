import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { UserCircle, LogOut } from 'lucide-react';

export const Route = createFileRoute('/perfil')({
  component: Perfil,
});

function Perfil() {
  const token = useAuthStore(s => s.token);
  const role = useAuthStore(s => s.role);
  const logout = useAuthStore(s => s.logout);

  let email = 'Usuário Desconhecido';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.sub || email;
    }
  } catch (e) {
    console.error("Erro ao ler token", e);
  }

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 text-center w-full max-w-md">
        <UserCircle size={80} className="mx-auto text-emerald-600 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Perfil do Usuário</h2>
        <p className="text-gray-500 font-medium mb-8 text-lg">{email}</p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-gray-500 font-semibold mb-1">Nível de Acesso</p>
          <p className="text-gray-800 font-bold">{role === 'ADMINISTRADOR' ? 'Administrador' : 'Funcionário'}</p>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={24} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
