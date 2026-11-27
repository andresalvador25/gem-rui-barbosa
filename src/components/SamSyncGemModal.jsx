import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  X, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  User, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

export default function SamSyncGemModal({ 
  isOpen, 
  onClose, 
  alunoAtual = null, 
  historicoAluno = [], 
  onSuccess 
}) {
  const [modo, setModo] = useState(alunoAtual ? 'aluno' : 'todos'); // 'todos' | 'aluno'
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [statusMessage, setStatusMessage] = useState(null);

  // Credenciais do SAM Oficial
  const [samEmail, setSamEmail] = useState('andresalvador94@yahoo.com');
  const [samPassword, setSamPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  // Carregar lista de pendentes gerais
  const carregarPendentesGerais = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gem/sync/pendentes');
      if (res.ok) {
        const json = await res.json();
        if (json.pendentes) {
          setPendentes(json.pendentes);
          setSelectedIds(new Set(json.pendentes.map(p => p.id)));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar pendentes do servidor, buscando localmente');
    }

    // Fallback localStorage
    try {
      const savedAlunos = JSON.parse(localStorage.getItem('gem_alunos_storage') || '[]');
      let localPendentes = [];
      
      savedAlunos.forEach(aluno => {
        const key = `gem_historico_${aluno.id}`;
        const hist = JSON.parse(localStorage.getItem(key) || '[]');
        hist.forEach(h => {
          if (!h.samSincronizado) {
            localPendentes.push({
              ...h,
              alunoNome: aluno.nome,
              alunoInstrumento: aluno.instrumento
            });
          }
        });
      });

      setPendentes(localPendentes);
      setSelectedIds(new Set(localPendentes.map(p => p.id)));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setSincronizando(false);
    setSamPassword('');

    if (modo === 'todos') {
      carregarPendentesGerais();
    } else if (alunoAtual) {
      const alunoItens = (historicoAluno || [])
        .filter(h => !h.samSincronizado)
        .map(h => ({
          ...h,
          alunoNome: alunoAtual.nome,
          alunoInstrumento: alunoAtual.instrumento
        }));
      setPendentes(alunoItens);
      setSelectedIds(new Set(alunoItens.map(p => p.id)));
    }
  }, [isOpen, modo, alunoAtual]);

  if (!isOpen) return null;

  const toggleSelectId = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendentes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendentes.map(p => p.id)));
    }
  };

  const itensParaEnviar = pendentes.filter(p => selectedIds.has(p.id));

  // Executar a Sincronização Direta pelo Servidor
  const handleSincronizarDireto = async (e) => {
    if (e) e.preventDefault();

    if (!samEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor, informe seu login/e-mail do SAM.' });
      return;
    }
    if (!samPassword) {
      setStatusMessage({ type: 'error', text: 'Por favor, digite sua senha de acesso ao SAM Oficial.' });
      return;
    }
    if (itensParaEnviar.length === 0) {
      setStatusMessage({ type: 'error', text: 'Selecione ao menos uma lição para sincronizar.' });
      return;
    }

    setSincronizando(true);
    setStatusMessage(null);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const res = await fetch('/api/sam/sync-direto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email: samEmail.trim(),
          password: samPassword,
          licoes: itensParaEnviar
        })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 Sincronização Concluída com Sucesso! ${json.concluidos || itensParaEnviar.length} lição(ões) lançada(s) no SAM Oficial da CCB.`
        });
        setSamPassword(''); // Limpa a senha por segurança

        // Recarrega lista
        if (modo === 'todos') carregarPendentesGerais();
        if (onSuccess) onSuccess();
      } else {
        setStatusMessage({
          type: 'error',
          text: json.message || 'Falha na autenticação do SAM Oficial. Verifique seu login e senha.'
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Erro de comunicação com o servidor: ' + (err.message || 'Verifique sua conexão')
      });
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header com identidade visual SAM CCB */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Sincronização Direta SAM Oficial CCB</h3>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-400/40 uppercase">
                  🔒 Apenas Administrador
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Envio 100% automático e seguro de lições sem sair do aplicativo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Seleção de Modo: "Todos os Alunos" vs "Apenas Aluno Selecionado" */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setModo('todos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                modo === 'todos'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Sincronizar Todos os Alunos</span>
            </button>

            <button
              onClick={() => setModo('aluno')}
              disabled={!alunoAtual}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                modo === 'aluno'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : alunoAtual
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {alunoAtual ? `Apenas ${alunoAtual.nome}` : 'Apenas Aluno Selecionado'}
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-600">
            {selectedIds.size} de {pendentes.length} lição(ões) selecionada(s)
          </div>
        </div>

        {/* Corpo do Modal com rolagem */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border shadow-xs animate-in fade-in duration-200 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* FORMULÁRIO DE AUTENTICAÇÃO DIRETA NO SAM */}
          <form onSubmit={handleSincronizarDireto} className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                <h4 className="font-black text-xs uppercase tracking-wide text-sky-300">
                  Credenciais de Envio para o SAM Oficial CCB
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                musical.congregacao.org.br
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Login / E-mail no SAM Oficial:
                </label>
                <input
                  type="text"
                  value={samEmail}
                  onChange={(e) => setSamEmail(e.target.value)}
                  placeholder="Seu e-mail cadastrado no SAM"
                  className="w-full text-xs p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Senha do SAM Oficial:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={samPassword}
                    onChange={(e) => setSamPassword(e.target.value)}
                    placeholder="Digite sua senha do SAM"
                    className="w-full text-xs p-3 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Aviso de Segurança e Privacidade */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-300 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacidade e Segurança:</strong> Sua senha é enviada via canal seguro criptografado exclusivamente para autenticar esta transmissão no portal da CCB e é descartada da memória imediatamente após o envio. Nada fica armazenado no banco de dados.
              </span>
            </div>

            {/* Botão de Disparo */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Total para envio: <strong className="text-white">{itensParaEnviar.length} lição(ões)</strong>
              </div>

              <button
                type="submit"
                disabled={sincronizando || itensParaEnviar.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm px-7 py-3 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {sincronizando ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    <span>Conectando ao SAM Oficial e Lançando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-950 fill-amber-950" />
                    <span>Iniciar Sincronização Direta ({itensParaEnviar.length})</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tabela de Lições Prontas para Envio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Lições Pendentes de Lançamento ({pendentes.length})
              </h4>

              {pendentes.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                >
                  {selectedIds.size === pendentes.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2 text-xs font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Carregando lições pendentes...
              </div>
            ) : pendentes.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-1">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Todas as lições já foram sincronizadas!</p>
                <p className="text-[11px] text-slate-500">
                  Não há novos lançamentos pendentes de envio ao SAM.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === pendentes.length && pendentes.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="p-2.5">Aluno / Instrumento</th>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Aba / Tipo</th>
                      <th className="p-2.5">Módulo / Lições</th>
                      <th className="p-2.5">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendentes.map(item => {
                      const isChecked = selectedIds.has(item.id);
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => toggleSelectId(item.id)}
                          className={`cursor-pointer transition ${
                            isChecked ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <td className="p-2.5 text-center" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectId(item.id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-900 block">{item.alunoNome}</span>
                            <span className="text-[10px] text-blue-700 font-medium">{item.alunoInstrumento}</span>
                          </td>
                          <td className="p-2.5 text-slate-600 whitespace-nowrap">
                            {item.data ? item.data.split('-').reverse().join('/') : '-'}
                          </td>
                          <td className="p-2.5">
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {item.tipo || 'MTS'}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <div className="text-slate-800">
                              {item.faseDe || item.modulo || 'Fase 1'}
                            </div>
                            {(item.licaoDe || item.licaoAte) && (
                              <div className="text-[10px] text-slate-500">
                                Lição {item.licaoDe || '1'} {item.licaoAte ? `até ${item.licaoAte}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-500 text-[11px] max-w-xs truncate" title={item.observacoes}>
                            {item.observacoes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            Integração SAM CCB • Congregação Vila Rui Barbosa
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
