import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { History } from 'lucide-react';

export const Route = createFileRoute('/historico')({
  component: Historico,
});

interface Atendimento {
  id: number;
  mesaId: number;
  nomeCliente: string;
  horarioInicio: string;
  horarioFim: string | null;
}

function Historico() {
  const { data: atendimentos = [], isLoading } = useQuery<Atendimento[]>({
    queryKey: ['atendimentos'],
    queryFn: () => api.get('/atendimentos').then(res => res.data)
  });

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <History className="text-emerald-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Histórico de Atendimentos</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Mesa ID</th>
              <th className="p-4 font-semibold text-gray-600">Cliente</th>
              <th className="p-4 font-semibold text-gray-600">Início</th>
              <th className="p-4 font-semibold text-gray-600">Fim</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Carregando histórico...</td></tr>}
            {atendimentos.map(a => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{a.id}</td>
                <td className="p-4 font-medium text-gray-800">Mesa {a.mesaId}</td>
                <td className="p-4 text-gray-800 font-medium">{a.nomeCliente}</td>
                <td className="p-4 text-gray-600">
                  {new Date(a.horarioInicio).toLocaleString('pt-BR')}
                </td>
                <td className="p-4 text-gray-600">
                  {a.horarioFim ? new Date(a.horarioFim).toLocaleString('pt-BR') : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.horarioFim ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {a.horarioFim ? 'Finalizado' : 'Em andamento'}
                  </span>
                </td>
              </tr>
            ))}
            {atendimentos.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum atendimento registrado no momento.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
