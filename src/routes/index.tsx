import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { UserPlus, CheckCircle, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import clsx from 'clsx';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

// Interfaces
interface Mesa {
  id: number;
  identificacao: string;
  capacidade: number;
  status: 'LIVRE' | 'OCUPADA' | 'RESERVADA';
}

interface Fila {
  id: number;
  nomeCliente: string;
  quantidadePessoas: number;
  horarioEntrada: string;
}

function Dashboard() {
  const queryClient = useQueryClient();

  const { data: mesas = [] } = useQuery<Mesa[]>({
    queryKey: ['mesas'],
    queryFn: () => api.get('/mesas').then(r => r.data)
  });

  const { data: fila = [] } = useQuery<Fila[]>({
    queryKey: ['fila'],
    queryFn: () => api.get('/fila').then(r => r.data)
  });

  // State
  const [selectedFila, setSelectedFila] = useState<number | null>(null);
  
  // Mesa Form State
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [identificacao, setIdentificacao] = useState('');
  const [capacidade, setCapacidade] = useState('');

  // Fila Form State
  const [showFilaModal, setShowFilaModal] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [quantidadePessoas, setQuantidadePessoas] = useState('');

  // Mutations
  const addFilaMutation = useMutation({
    mutationFn: (data: { nomeCliente: string, quantidadePessoas: number }) => api.post('/fila', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila'] });
      toast.success('Cliente adicionado à fila');
      setShowFilaModal(false);
      setNomeCliente('');
      setQuantidadePessoas('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao adicionar cliente')
  });

  const createMesaMutation = useMutation({
    mutationFn: (data: { identificacao: string, capacidade: number }) => api.post('/mesas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa criada com sucesso!');
      setShowMesaModal(false);
      setIdentificacao('');
      setCapacidade('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao criar mesa')
  });

  const alocarMutation = useMutation({
    mutationFn: (data: { mesaId: number, filaId: number }) => api.post('/atendimentos/alocar', {
      mesaId: data.mesaId,
      filaEsperaId: data.filaId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      queryClient.invalidateQueries({ queryKey: ['fila'] });
      toast.success('Cliente alocado na mesa');
      setSelectedFila(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao alocar')
  });

  const liberarMutation = useMutation({
    mutationFn: (mesaId: number) => api.patch(`/atendimentos/mesa/${mesaId}/liberar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Mesa liberada');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao liberar mesa')
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => api.patch(`/mesas/${id}/status?status=${status}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('Status atualizado');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao atualizar status')
  });

  const handleCreateMesa = (e: React.FormEvent) => {
    e.preventDefault();
    createMesaMutation.mutate({ identificacao, capacidade: parseInt(capacidade) });
  };

  const handleCreateFila = (e: React.FormEvent) => {
    e.preventDefault();
    addFilaMutation.mutate({ nomeCliente, quantidadePessoas: parseInt(quantidadePessoas) });
  };

  const selectedClient = fila.find(f => f.id === selectedFila);

  return (
    <div className="flex w-full h-full">
      {/* Mesas Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Salão</h2>
          <button 
            onClick={() => setShowMesaModal(true)}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Nova Mesa
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mesas.map(mesa => {
            const isDisabledByCapacity = selectedClient && mesa.capacidade < selectedClient.quantidadePessoas;

            return (
              <div 
                key={mesa.id}
                className={clsx(
                  "p-6 rounded-2xl border-2 flex flex-col justify-between transition-all min-h-40",
                  isDisabledByCapacity ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300" : "cursor-pointer shadow-sm hover:shadow-md",
                  !isDisabledByCapacity && mesa.status === 'LIVRE' ? "bg-emerald-50 border-emerald-200" : "",
                  !isDisabledByCapacity && mesa.status === 'OCUPADA' ? "bg-red-50 border-red-200" : "",
                  !isDisabledByCapacity && mesa.status === 'RESERVADA' ? "bg-yellow-50 border-yellow-200" : ""
                )}
                onClick={() => {
                  if (!isDisabledByCapacity && mesa.status === 'LIVRE' && selectedFila) {
                    alocarMutation.mutate({ mesaId: mesa.id, filaId: selectedFila });
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-lg font-bold text-gray-800">{mesa.identificacao}</span>
                  <span className={clsx(
                    "text-xs font-semibold px-2 py-1 rounded-full",
                    mesa.status === 'LIVRE' ? "bg-emerald-200 text-emerald-800" :
                    mesa.status === 'OCUPADA' ? "bg-red-200 text-red-800" :
                    "bg-yellow-200 text-yellow-800"
                  )}>{mesa.status}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500 font-medium">
                  {mesa.capacidade} lugares
                  {isDisabledByCapacity && <span className="text-red-500 block text-xs mt-1">Capacidade Insuficiente</span>}
                </div>
                
                <div className="mt-4 flex justify-between items-end gap-2">
                  {/* Botões Manuais de Status */}
                  {!isDisabledByCapacity && mesa.status === 'LIVRE' && !selectedFila && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); atualizarStatusMutation.mutate({ id: mesa.id, status: 'RESERVADA' }); }}
                      className="w-full text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 py-2 rounded-lg font-bold transition-colors"
                    >
                      Reservar
                    </button>
                  )}

                  {!isDisabledByCapacity && mesa.status === 'RESERVADA' && (
                     <button 
                      onClick={(e) => { e.stopPropagation(); atualizarStatusMutation.mutate({ id: mesa.id, status: 'LIVRE' }); }}
                      className="w-full text-xs bg-emerald-200 hover:bg-emerald-300 text-emerald-800 py-2 rounded-lg font-bold transition-colors"
                    >
                      Marcar Livre
                    </button>
                  )}
                  
                  {!isDisabledByCapacity && mesa.status === 'OCUPADA' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); liberarMutation.mutate(mesa.id); }}
                      className="w-full text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold transition-colors"
                    >
                      Liberar
                    </button>
                  )}
                  
                  {!isDisabledByCapacity && mesa.status === 'LIVRE' && selectedFila && (
                    <span className="w-full text-center text-sm bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold animate-pulse">
                      Clique p/ Alocar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {mesas.length === 0 && (
            <div className="col-span-full text-center p-12 text-gray-400 font-medium">
              <p>Nenhuma mesa cadastrada. Clique em "Nova Mesa" para começar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fila Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 h-full shadow-lg z-10">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600"/>
            Fila de Espera
          </h3>
          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
            {fila.length}
          </span>
        </div>
        
        <div className="p-4">
          <button 
            onClick={() => setShowFilaModal(true)}
            className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <UserPlus size={20} />
            Novo Cliente
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {fila.map(f => (
            <div 
              key={f.id} 
              onClick={() => setSelectedFila(selectedFila === f.id ? null : f.id)}
              className={clsx(
                "p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center",
                selectedFila === f.id ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-white hover:border-emerald-200"
              )}
            >
              <div>
                <p className="font-bold text-gray-800">{f.nomeCliente}</p>
                <p className="text-sm text-gray-500">{f.quantidadePessoas} pessoas</p>
              </div>
              {selectedFila === f.id && <CheckCircle className="text-emerald-500" size={24} />}
            </div>
          ))}
          
          {fila.length === 0 && (
            <div className="text-center text-gray-400 mt-10 font-medium">
              <p>Fila vazia</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Mesa */}
      {showMesaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Nova Mesa</h3>
            <form onSubmit={handleCreateMesa} className="flex flex-col gap-4">
              <input 
                required 
                value={identificacao} 
                onChange={e => setIdentificacao(e.target.value)} 
                placeholder="Identificação (ex: M1, VIP)" 
                className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <input 
                required 
                type="number"
                min="1"
                value={capacidade} 
                onChange={e => setCapacidade(e.target.value)} 
                placeholder="Capacidade (ex: 4)" 
                className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowMesaModal(false)} className="flex-1 px-4 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={createMesaMutation.isPending} className="flex-1 px-4 py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente (Fila) */}
      {showFilaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Novo Cliente na Fila</h3>
            <form onSubmit={handleCreateFila} className="flex flex-col gap-4">
              <input 
                required 
                value={nomeCliente} 
                onChange={e => setNomeCliente(e.target.value)} 
                placeholder="Nome do cliente" 
                className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <input 
                required 
                type="number"
                min="1"
                value={quantidadePessoas} 
                onChange={e => setQuantidadePessoas(e.target.value)} 
                placeholder="Qtd de pessoas (ex: 3)" 
                className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowFilaModal(false)} className="flex-1 px-4 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={addFilaMutation.isPending} className="flex-1 px-4 py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
