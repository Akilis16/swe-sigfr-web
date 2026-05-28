import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Shield } from 'lucide-react';
import { api } from '../lib/api';

export const Route = createFileRoute('/usuarios')({
  component: Usuarios,
});

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

function Usuarios() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('FUNCIONARIO');
  const [showModal, setShowModal] = useState(false);

  const { data: usuarios = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/usuarios').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/usuarios', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário criado com sucesso');
      setShowModal(false);
      setNome('');
      setEmail('');
      setSenha('');
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Erro ao criar usuário');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ nome, email, senha, role });
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-emerald-600" />
          Gerenciamento de Usuários
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} />
          Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Nome</th>
              <th className="p-4 font-semibold text-gray-600">E-mail</th>
              <th className="p-4 font-semibold text-gray-600">Role</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-4 text-center">Carregando...</td></tr>}
            {usuarios.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{u.id}</td>
                <td className="p-4 font-medium text-gray-800">{u.nome}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum usuário encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Novo Funcionário</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              <input required type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              <select value={role} onChange={e => setRole(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="FUNCIONARIO">Funcionário</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
