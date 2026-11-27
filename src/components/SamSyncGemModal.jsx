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
  Copy,
  Check,
  Sparkles,
  ExternalLink
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
  const [copiedCode, setCopiedCode] = useState(false);

  // Estados da Extensão
  const [extensaoAtiva, setExtensaoAtiva] = useState(false);
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

  // Detecção da Extensão no Navegador
  useEffect(() => {
    const checar = () => {
      const ativo = 
        document.documentElement.getAttribute('data-robo-sam-ativo') === 'true' ||
        window.__ROBO_SAM_INSTALADO__ === true;
      if (ativo) setExtensaoAtiva(true);
    };

    checar();
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
          text: '🚀 Robô executando no SAM Oficial! Preenchendo as abas e salvando...'
        });
      }

      if (event.data.type === 'APP_GEM_SYNC_CONCLUIDO') {
        setSincronizando(false);
        const resultado = event.data.resultado || {};
        const idsConcluidos = resultado.ids || Array.from(selectedIds);

        try {
          await fetch('/api/gem/sync/marcar-sincronizado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsConcluidos })
          });
        } catch (e) {}

        setStatusMessage({
          type: 'success',
          text: `🎉 Sincronização Concluída! ${resultado.concluidos || idsConcluidos.length} lição(ões) lançada(s) e gravadas com sucesso no SAM Oficial da CCB.`
        });

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
    const interval = setInterval(checar, 1500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [modo, selectedIds, onSuccess]);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setSincronizando(false);
    setCopiedCode(false);

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

  const prepararPayload = () => {
    return itensParaEnviar.map(item => ({
      id: item.id,
      alunoNome: item.alunoNome || '',
      instrumento: item.alunoInstrumento || '',
      tipo: item.tipo || 'MTS',
      metodo: item.metodo || item.metodoNome || '',
      data: item.data ? item.data.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR'),
      modulo: item.faseDe || item.faseAte || item.modulo || 'Fase 1',
      licaoDe: item.licaoDe || item.licao || '',
      licaoAte: item.licaoAte || '',
      paginaDe: item.paginaDe || '',
      paginaAte: item.paginaAte || '',
      observacoes: item.observacoes || 'Aula realizada no GEM Vila Rui Barbosa',
      autorizadoPor: item.autorizadoPor || 'Instrutor'
    }));
  };

  // Disparo via Extensão no Navegador
  const handleDispararExtensao = () => {
    if (itensParaEnviar.length === 0) return;
    const payload = prepararPayload();
    setSincronizando(true);
    setStatusMessage({
      type: 'info',
      text: 'Enviando comando para o SAM Oficial... Certifique-se de que a aba do SAM está aberta.'
    });

    window.postMessage({
      type: 'APP_GEM_START_SYNC',
      payload: payload
    }, '*');
  };

  // Gerar código manual de Console
  const gerarCodigoConsole = () => {
    const payload = prepararPayload();
    return `(async function executarRoboSam() {
  const licoes = ${JSON.stringify(payload, null, 2)};
  console.log('🤖 Iniciando lançamentos no SAM...', licoes);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const normalizar = t => (t||'').toString().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase().trim();
  let concluidos = 0;

  for (let i = 0; i < licoes.length; i++) {
    const item = licoes[i];
    console.log(\`Processando (\${i+1}/\${licoes.length}): \${item.alunoNome}\`);
    const linhas = Array.from(document.querySelectorAll('table tbody tr'));
    const tr = linhas.find(r => normalizar(r.innerText).includes(normalizar(item.alunoNome)));
    if (!tr) { console.warn('Aluno não encontrado:', item.alunoNome); continue; }

    document.querySelectorAll('table tbody tr input[type="checkbox"]').forEach(c => { if(c.checked){ c.checked=false; c.dispatchEvent(new Event('change',{bubbles:true})); } });
    const cb = tr.querySelector('input[type="checkbox"]');
    if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
    await sleep(400);

    const btn = Array.from(document.querySelectorAll('button, a')).find(el => normalizar(el.textContent).includes('ADICIONAR LICOES'));
    if (!btn) continue;
    btn.click();
    await sleep(1200);

    const abas = Array.from(document.querySelectorAll('.nav-tabs a, ul.nav a, a[data-toggle="tab"]'));
    const aba = abas.find(a => normalizar(a.textContent) === normalizar(item.tipo || 'MTS'));
    if (aba) { aba.click(); await sleep(500); }

    const inData = document.querySelector('input[name*="data"], input[id*="data"]');
    if (inData) { inData.value = item.data; inData.dispatchEvent(new Event('input', { bubbles: true })); }

    const selects = Array.from(document.querySelectorAll('.modal select, select'));
    const selMod = selects.find(s => s.name?.includes('modulo') || s.name?.includes('metodo') || s.id?.includes('modulo')) || selects[0];
    if (selMod && selMod.options) {
      const termo = normalizar(item.metodo || item.modulo || 'FASE 1');
      for (const opt of selMod.options) {
        if (normalizar(opt.text).includes(termo) || termo.includes(normalizar(opt.text))) {
          selMod.value = opt.value;
          selMod.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }

    const inputs = Array.from(document.querySelectorAll('.modal input, input'));
    const inDe = inputs.find(x => (x.placeholder||x.name||'').toLowerCase().includes('de') && !(x.placeholder||x.name||'').toLowerCase().includes('ate'));
    const inAte = inputs.find(x => (x.placeholder||x.name||'').toLowerCase().includes('ate') || (x.placeholder||x.name||'').toLowerCase().includes('até'));
    const valDe = item.licaoDe || item.paginaDe || '';
    const valAte = item.licaoAte || item.paginaAte || '';
    if (inDe && valDe) { inDe.value = valDe; inDe.dispatchEvent(new Event('input', { bubbles: true })); }
    if (inAte && valAte) { inAte.value = valAte; inAte.dispatchEvent(new Event('input', { bubbles: true })); }

    const obs = document.querySelector('textarea');
    if (obs) { obs.value = item.observacoes; obs.dispatchEvent(new Event('input', { bubbles: true })); }

    const resp = selects.find(s => s.name?.includes('resp') || s.id?.includes('autoriz'));
    if (resp && resp.options.length > 1) { resp.selectedIndex = 1; resp.dispatchEvent(new Event('change', { bubbles: true })); }

    await sleep(600);
    const salvar = Array.from(document.querySelectorAll('button')).find(b => normalizar(b.textContent).includes('SALVAR') && !normalizar(b.textContent).includes('FECHAR'));
    if (salvar) { salvar.click(); concluidos++; await sleep(1500); }
  }
  alert(\`🎉 Robô SAM concluído! \${concluidos} lições lançadas e salvas com sucesso no banco oficial da CCB!\`);
})();`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gerarCodigoConsole());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
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
                <h3 className="text-base sm:text-lg font-black tracking-tight">Robô Sincronizador SAM Oficial</h3>
                {extensaoAtiva ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Extensão Conectada
                  </span>
                ) : (
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-400/40 uppercase">
                    🔒 Apenas Administrador
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Preenchimento automático e oficial no portal do SAM CCB
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
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* CARD PRINCIPAL: DISPARO COM EXTENSÃO OU GUIA DE ATIVAÇÃO NO EDGE */}
          {extensaoAtiva ? (
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 border border-blue-900 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-emerald-400 font-black text-xs uppercase tracking-wider">
                      Extensão Pronta e Ativa no Navegador
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Sincronizar Diretamente na Página do SAM
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Com a aba do SAM Oficial aberta em <strong>G.E.M &gt; Alunos</strong>, basta clicar no botão abaixo. O robô vai marcar os alunos, abrir o modal, preencher a aba correspondente (inclusive Métodos) e salvar no banco da CCB!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDispararExtensao}
                  disabled={sincronizando || itensParaEnviar.length === 0}
                  className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {sincronizando ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Sincronizando no SAM...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                      <span>Sincronizar Agora ({itensParaEnviar.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-400/30 uppercase tracking-wider">
                    Como o Robô Salva no SAM Oficial
                  </span>
                  <h4 className="text-base font-black text-white">
                    Para o SAM gravar de verdade, o robô preenche na tela oficial:
                  </h4>
                </div>

                <a
                  href="https://musical.congregacao.org.br/gem/aluno"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 flex items-center gap-1.5 text-xs text-sky-300 hover:text-white font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir SAM Oficial</span>
                </a>
              </div>

              {/* Guia de 30 segundos no Edge */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-sky-300 block">
                  ⚡ Ativar a Extensão no Microsoft Edge (30 segundos, uma única vez):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-sky-400 font-black block">1. Abra as Extensões</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      No Edge, acesse <code className="bg-slate-950 px-1 py-0.5 rounded text-sky-300">edge://extensions</code>
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-sky-400 font-black block">2. Modo Desenvolvedor</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Ative a chavinha <strong>Modo do desenvolvedor</strong> no menu esquerdo.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-sky-400 font-black block">3. Carregar Descompactada</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Clique em <strong>Carregar extensão descompactada</strong> e escolha a pasta:
                      <br />
                      <code className="text-[10px] text-sky-300 block mt-1 break-all bg-slate-950 p-1 rounded">
                        C:\Users\dre_s\Desktop\App_musical\extensao-sam-sync
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de teste rápido via Console F12 */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Ou se preferir testar agora sem carregar a extensão, copie o código e rode no Console (F12) do SAM:
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-md shrink-0"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código para o Console (F12)'}</span>
                </button>
              </div>
            </div>
          )}

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
                      <th className="p-2.5">Módulo / Lições / Método</th>
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
                              {item.metodo || item.faseDe || item.modulo || 'Fase 1'}
                            </div>
                            {(item.licaoDe || item.licaoAte || item.paginaDe || item.paginaAte) && (
                              <div className="text-[10px] text-slate-500">
                                {item.paginaDe ? `Pág. ${item.paginaDe} até ${item.paginaAte || item.paginaDe}` : `Lição ${item.licaoDe || '1'} até ${item.licaoAte || item.licaoDe}`}
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
