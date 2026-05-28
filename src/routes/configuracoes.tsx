import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useRef, useState } from 'react';

export const Route = createFileRoute('/configuracoes')({
  component: Configuracoes,
});

function Configuracoes() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const exportMutation = useMutation({
    mutationFn: () => api.get('/backup/exportar', { responseType: 'blob' }),
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sigfr_backup.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Backup exportado com sucesso');
    },
    onError: () => toast.error('Erro ao exportar backup')
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      await api.post('/backup/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Backup importado com sucesso!');
      queryClient.invalidateQueries(); // invalidates everything to refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao importar backup');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <SettingsIcon className="text-emerald-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Exportar Backup</h3>
            <p className="text-gray-500 mb-6">Baixe um arquivo CSV contendo todas as mesas, histórico de fila e atendimentos do sistema.</p>
          </div>
          <button 
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="w-full bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download size={20} />
            {exportMutation.isPending ? 'Exportando...' : 'Exportar Dados (CSV)'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Importar Backup</h3>
            <p className="text-gray-500 mb-6">Restaure o banco de dados a partir de um arquivo CSV previamente exportado. Cuidado: isto pode modificar os registros atuais.</p>
          </div>
          
          <input 
            type="file" 
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload size={20} />
            {importing ? 'Importando...' : 'Fazer Upload (CSV)'}
          </button>
        </div>
      </div>
    </div>
  );
}
