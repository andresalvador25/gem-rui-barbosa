import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  X, 
  CheckCircle, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Layers, 
  User, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle,
  Play,
  Zap,
  Check,
  ChevronDown,
  Sparkles,
  Download,
  HelpCircle
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
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Estados da Sincronização Automática via Extensão
  const [extensaoAtiva, setExtensaoAtiva] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [mostrarGuiaExtensao, setMostrarGuiaExtensao] = useState(false);
  const [mostrarModoManual, setMostrarModoManual] = useState(false);

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

  // Detecção da Extensão Robô SAM
  useEffect(() => {
    const checarExtensao = () => {
      const ativo = 
        document.documentElement.getAttribute('data-robo-sam-ativo') === 'true' ||
        window.__ROBO_SAM_INSTALADO__ === true;
      if (ativo) setExtensaoAtiva(true);
    };

    checarExtensao();
    window.postMessage({ type: 'APP_GEM_PING_ROBO' }, '*');

    const handleMessage = async (event) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'ROBO_SAM_PONG') {
        setExtensaoAtiva(true);
      }

      if (event.data.type === 'APP_GEM_SYNC_INICIADO') {
        setSincronizando(true);
        setStatusMessage({
          type: 'info',
          text: '🚀 Robô iniciado no SAM Oficial! Processando lançamentos na aba ao lado...'
        });
      }

      if (event.data.type === 'APP_GEM_SYNC_CONCLUIDO') {
        setSincronizando(false);
        const resultado = event.data.resultado || {};
        const idsConcluidos = resultado.ids || Array.from(selectedIds);

        // Marca automaticamente como sincronizado no banco de dados!
        try {
          await fetch('/api/gem/sync/marcar-sincronizado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsConcluidos })
          });
        } catch (e) {
          console.warn('Erro ao marcar sincronizado no servidor');
        }

        setStatusMessage({
          type: 'success',
          text: `🎉 Sincronização 100% Concluída com Sucesso! ${resultado.concluidos || idsConcluidos.length} lição(ões) lançada(s) no SAM Oficial sem nenhuma intervenção manual.`
        });

        // Recarrega os dados para limpar a fila
        if (modo === 'todos') carregarPendentesGerais();
        if (onSuccess) onSuccess();
      }

      if (event.data.type === 'APP_GEM_SYNC_ERRO') {
        setSincronizando(false);
        setStatusMessage({
          type: 'error',
          text: event.data.erro || 'Falha ao sincronizar com o SAM.'
        });
      }
    };

    window.addEventListener('message', handleMessage);
    const interval = setInterval(checarExtensao, 1500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [modo, selectedIds, onSuccess]);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setCopied(false);
    setSincronizando(false);

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

  // Formatar payload limpo para envio ao robô
  const prepararPayload = () => {
    return itensParaEnviar.map(item => ({
      id: item.id,
      alunoNome: item.alunoNome || '',
      instrumento: item.alunoInstrumento || '',
      tipo: item.tipo || 'MTS',
      data: item.data ? item.data.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR'),
      modulo: item.faseDe || item.faseAte || item.modulo || 'Fase 1',
      licaoDe: item.licaoDe || item.licao || '',
      licaoAte: item.licaoAte || '',
      observacoes: item.observacoes || 'Aula realizada no GEM Vila Rui Barbosa',
      autorizadoPor: item.autorizadoPor || 'Instrutor'
    }));
  };

  // DISPARO 100% AUTOMÁTICO (Zero Copiar/Colar)
  const handleSincronizarAutomatico = () => {
    if (itensParaEnviar.length === 0) return;

    const payload = prepararPayload();
    setSincronizando(true);
    setStatusMessage({
      type: 'info',
      text: 'Enviando comando para o SAM Oficial... Aguarde.'
    });

    // Envia o comando para o Content Script da Extensão
    window.postMessage({
      type: 'APP_GEM_START_SYNC',
      payload: payload
    }, '*');
  };

  // Gerar o Script de Automação Fallback
  const gerarCodigoRobo = () => {
    const payload = prepararPayload();
    return `/**
 * ROBÔ AUTOMATIZADOR DE LANÇAMENTO DE LIÇÕES - SAM CCB
 * Vila Rui Barbosa (Jundiaí - SP) • André Salvador
 */
(async function executarRoboSam() {
  const licoes = ${JSON.stringify(payload, null, 2)};
  console.log('🤖 Iniciando robô SAM...', licoes);

  let painel = document.getElementById('robo-sam-painel');
  if (!painel) {
    painel = document.createElement('div');
    painel.id = 'robo-sam-painel';
    painel.style = 'position:fixed;top:20px;right:20px;z-index:999999;background:#0f172a;color:#f8fafc;padding:16px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:sans-serif;font-size:13px;width:340px;border:2px solid #38bdf8;';
    document.body.appendChild(painel);
  }

  function atualizarStatus(msg, submsg = '') {
    painel.innerHTML = '<div style="font-weight:bold;color:#38bdf8;margin-bottom:6px;">🤖 Sincronizador SAM Rui Barbosa</div>' +
      '<div style="font-size:12px;color:#e2e8f0;margin-bottom:4px;">' + msg + '</div>' +
      (submsg ? '<div style="font-size:11px;color:#94a3b8;">' + submsg + '</div>' : '');
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  let concluidos = 0;

  for (let i = 0; i < licoes.length; i++) {
    const item = licoes[i];
    atualizarStatus(\`Processando (\${i + 1}/\${licoes.length}): \${item.alunoNome}\`, \`\${item.tipo} - \${item.modulo}\`);

    const linhas = Array.from(document.querySelectorAll('table tbody tr'));
    const linha = linhas.find(tr => tr.innerText.toUpperCase().includes(item.alunoNome.toUpperCase()));
    if (!linha) continue;

    document.querySelectorAll('table tbody tr input[type="checkbox"]').forEach(cb => cb.checked = false);
    const cb = linha.querySelector('input[type="checkbox"]');
    if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
    await sleep(400);

    const btnAdd = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('Adicionar Lições'));
    if (!btnAdd) continue;
    btnAdd.click();
    await sleep(1000);

    const abas = Array.from(document.querySelectorAll('.nav-tabs a, ul.nav a, a[data-toggle="tab"]'));
    const aba = abas.find(a => a.textContent.trim().toUpperCase() === (item.tipo || 'MTS').toUpperCase());
    if (aba) { aba.click(); await sleep(400); }

    const inputData = document.querySelector('input[name*="data"], input[id*="data"]');
    if (inputData) { inputData.value = item.data; inputData.dispatchEvent(new Event('input', { bubbles: true })); }

    const selectModulo = document.querySelector('select[name*="modulo"], select[id*="modulo"]');
    if (selectModulo) {
      for (const opt of selectModulo.options) {
        if (opt.text.toUpperCase().includes((item.modulo || '').toUpperCase())) {
          selectModulo.value = opt.value;
          selectModulo.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }

    const textareaObs = document.querySelector('textarea');
    if (textareaObs) { textareaObs.value = item.observacoes; textareaObs.dispatchEvent(new Event('input', { bubbles: true })); }

    const selectAutorizado = Array.from(document.querySelectorAll('select')).find(s => (s.name || '').includes('resp') || (s.name || '').includes('autoriz'));
    if (selectAutorizado && selectAutorizado.options.length > 1) {
      selectAutorizado.selectedIndex = 1;
      selectAutorizado.dispatchEvent(new Event('change', { bubbles: true }));
    }

    await sleep(600);
    const btnSalvar = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Salvar') && !btn.textContent.includes('Fechar'));
    if (btnSalvar) { btnSalvar.click(); concluidos++; await sleep(1500); }
  }

  atualizarStatus('🎉 Sincronização Concluída!', \`Sucesso: \${concluidos} lançamentos salvos no SAM!\`);
})();`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gerarCodigoRobo());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header com identidade visual SAM CCB */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <Bot className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Sincronizador Automático SAM CCB</h3>
                {extensaoAtiva ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Extensão Conectada
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    Aguardando Extensão
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Envio direto e automatizado de lições entre os dois portais
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
            {selectedIds.size} de {pendentes.length} selecionado(s)
          </div>
        </div>

        {/* Corpo do Modal com rolagem */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border shadow-xs animate-in fade-in duration-200 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : statusMessage.type === 'info'
                  ? 'bg-sky-50 text-sky-900 border-sky-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'info' ? (
                <RefreshCw className="w-5 h-5 text-sky-600 shrink-0 mt-0.5 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="block leading-relaxed">{statusMessage.text}</span>
              </div>
            </div>
          )}

          {/* PAINEL DE DISPARO 100% AUTOMÁTICO */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 border border-blue-900/60 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-400/30 uppercase tracking-wider">
                    Sincronização 1-Clique
                  </span>
                  <span className="text-xs text-slate-300">Com os dois apps abertos</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Disparar Robô Automático no SAM Oficial
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Basta estar logado no SAM Oficial (<a href="https://musical.congregacao.org.br/gem/aluno" target="_blank" rel="noreferrer" className="text-sky-300 underline font-semibold">musical.congregacao.org.br</a>). Ao clicar no botão abaixo, o robô faz todos os lançamentos sozinho e atualiza o App automaticamente.
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center md:items-end gap-2">
                <button
                  type="button"
                  onClick={handleSincronizarAutomatico}
                  disabled={sincronizando || itensParaEnviar.length === 0}
                  className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {sincronizando ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Sincronizando no SAM...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-amber-950 fill-amber-950" />
                      <span>Sincronizar Agora ({itensParaEnviar.length})</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-400">
                  {extensaoAtiva ? '✅ Pronto para disparo direto' : '⚠️ Requer a extensão ativa no Chrome/Edge'}
                </span>
              </div>
            </div>

            {/* Banner de Ajuda caso a extensão ainda não esteja carregada */}
            {!extensaoAtiva && (
              <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-800/40 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-slate-300">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ainda não ativou a extensão no seu navegador?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarGuiaExtensao(!mostrarGuiaExtensao)}
                  className="text-sky-300 hover:text-sky-200 font-bold underline shrink-0"
                >
                  {mostrarGuiaExtensao ? 'Ocultar instruções' : 'Ver como ativar em 30 segundos (única vez)'}
                </button>
              </div>
            )}
          </div>

          {/* GUIA DE INSTALAÇÃO DA EXTENSÃO (Expansível ou se inativa) */}
          {(!extensaoAtiva || mostrarGuiaExtensao) && (
            <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-amber-950 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Como Ativar a Extensão no seu Chrome ou Edge (Passo Único):</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarGuiaExtensao(false)}
                  className="text-amber-800 text-xs font-bold hover:underline"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                  <span className="text-amber-700 font-black block">1. Abra as Extensões</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    No seu navegador, digite <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">chrome://extensions</code> (ou <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">edge://extensions</code>).
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                  <span className="text-amber-700 font-black block">2. Modo Desenvolvedor</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    No canto superior direito, ative a chavinha <strong>"Modo do desenvolvedor"</strong>.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                  <span className="text-amber-700 font-black block">3. Carregar sem Compactação</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Clique em <strong>"Carregar sem compactação"</strong> e selecione a pasta:
                    <br />
                    <span className="font-mono text-[10px] text-blue-700 block mt-1 break-all bg-slate-100 p-1 rounded">
                      C:\Users\dre_s\Desktop\App_musical\extensao-sam-sync
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Lições Prontas para Envio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Lições Selecionadas para o Lançamento ({pendentes.length})
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

          {/* Opção Alternativa: Copiar Script Manual (Expansível) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMostrarModoManual(!mostrarModoManual)}
              className="w-full bg-slate-50 p-3 px-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span>Opção Alternativa: Copiar Script Manual (Console F12)</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mostrarModoManual ? 'rotate-180' : ''}`} />
            </button>

            {mostrarModoManual && (
              <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                <p className="text-xs text-slate-600">
                  Caso prefira o método manual sem extensão, você pode copiar o código do robô abaixo e colar no Console (F12) da aba do SAM.
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Código Copiado!' : 'Copiar Código do Robô'}</span>
                </button>
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
