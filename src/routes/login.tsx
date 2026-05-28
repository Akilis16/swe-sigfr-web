import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const Route = createFileRoute('/login')({
  component: Login,
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
});

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = loginSchema.parse({ email, senha });
      setLoading(true);
      const res = await api.post('/auth/login', parsed);
      setAuth(res.data.token, res.data.role);
      toast.success('Login realizado com sucesso!');
      navigate({ to: '/' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error('Credenciais inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">SIGFR</h1>
          <p className="text-gray-500">Sistema Inteligente de Gestão de Filas</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="admin@sigfr.com.br"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
