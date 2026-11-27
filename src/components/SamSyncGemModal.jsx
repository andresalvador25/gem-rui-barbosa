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
  Bookmark,
  Star,
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
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Estados da Sincronização via Extensão (Opcional)
  const [extensaoAtiva, setExtensaoAtiva] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [mostrarGuiaExtensao, setMostrarGuiaExtensao] = useState(false);

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

  // Detecção da Extensão Robô SAM (se instalada)
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

        try {
          await fetch('/api/gem/sync/marcar-sincronizado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsConcluidos })
          });
        } catch (e) {}

        setStatusMessage({
          type: 'success',
          text: `🎉 Sincronização 100% Concluída com Sucesso! ${resultado.concluidos || idsConcluidos.length} lição(ões) lançada(s) no SAM Oficial automaticamente.`
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
    const interval = setInterval(checarExtensao, 1500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [modo, selectedIds, onSuccess]);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setCopiedBookmarklet(false);
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

  // Disparo via Extensão (se instalada)
  const handleSincronizarAutomatico = () => {
    if (itensParaEnviar.length === 0) return;
    const payload = prepararPayload();
    setSincronizando(true);
    setStatusMessage({
      type: 'info',
      text: 'Enviando comando para o SAM Oficial... Aguarde.'
    });
    window.postMessage({
      type: 'APP_GEM_START_SYNC',
      payload: payload
    }, '*');
  };

  // Código do Bookmarklet (Botão dos Favoritos - ZERO INSTALAÇÃO)
  const bookmarkletCode = `javascript:(async function(){const u='https://gem-rui-barbosa.vercel.app';let p=document.getElementById('robo-sam-painel');if(!p){p=document.createElement('div');p.id='robo-sam-painel';p.style='position:fixed;top:16px;right:16px;z-index:9999999;background:#0f172a;color:#f8fafc;padding:16px;border-radius:14px;box-shadow:0 20px 25px rgba(0,0,0,0.5);font-family:sans-serif;font-size:13px;width:340px;border:2px solid #38bdf8;';document.body.appendChild(p);}function s(m,sub=''){p.innerHTML='<div style="font-weight:800;color:#38bdf8;margin-bottom:6px;">🤖 Robô SAM Rui Barbosa</div><div style="font-size:12px;color:#f1f5f9;margin-bottom:4px;">'+m+'</div>'+(sub?'<div style="font-size:11px;color:#94a3b8;">'+sub+'</div>':'');}s('Conectando ao App Rui Barbosa...','Buscando lições pendentes');try{const r=await fetch(u+'/api/gem/sync/pendentes');const d=await r.json();const l=d.pendentes||[];if(l.length===0){s('Tudo em dia!','Nenhuma lição pendente.');setTimeout(()=>p.remove(),4000);return;}s('Iniciando lançamentos...',l.length+' lições para lançar');const sleep=ms=>new Promise(res=>setTimeout(res,ms));const n=t=>(t||'').toString().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase().trim();let c=0,ids=[];for(let i=0;i<l.length;i++){const item=l[i];s('Lançando ('+(i+1)+'/'+l.length+'): '+(item.alunoNome||''),(item.tipo||'MTS')+' - '+(item.faseDe||item.modulo||'Fase 1'));const rows=Array.from(document.querySelectorAll('table tbody tr'));const tr=rows.find(x=>n(x.innerText).includes(n(item.alunoNome)));if(!tr)continue;document.querySelectorAll('table tbody tr input[type="checkbox"]').forEach(cb=>{if(cb.checked){cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}));}});const cb=tr.querySelector('input[type="checkbox"]');if(cb){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));}await sleep(350);const btnAdd=Array.from(document.querySelectorAll('button, a')).find(el=>n(el.textContent).includes('ADICIONAR LICOES'));if(!btnAdd)continue;btnAdd.click();await sleep(1000);const abas=Array.from(document.querySelectorAll('.nav-tabs a, ul.nav a, a[data-toggle="tab"], .modal a'));const aba=abas.find(a=>n(a.textContent)===n(item.tipo||'MTS'));if(aba){aba.click();await sleep(400);}const inputs=Array.from(document.querySelectorAll('.modal input, input'));const inData=inputs.find(x=>(x.name||x.id||'').toLowerCase().includes('data')||x.placeholder?.includes('data'))||document.querySelector('input[type="text"][value*="/"]');if(inData){inData.value=item.data&&item.data.includes('-')?item.data.split('-').reverse().join('/'):(item.data||new Date().toLocaleDateString('pt-BR'));inData.dispatchEvent(new Event('input',{bubbles:true}));}const selects=Array.from(document.querySelectorAll('.modal select, select'));const selMod=selects.find(x=>(x.name||x.id||'').toLowerCase().includes('modulo')||(x.name||x.id||'').toLowerCase().includes('fase'))||selects[0];if(selMod&&selMod.options){const termo=n(item.modulo||item.faseDe||'FASE 1');for(const opt of selMod.options){if(n(opt.text).includes(termo)){selMod.value=opt.value;selMod.dispatchEvent(new Event('change',{bubbles:true}));break;}}}const inDe=inputs.find(x=>(x.placeholder||x.name||'').toLowerCase().includes('de')&&!(x.placeholder||x.name||'').toLowerCase().includes('ate'));const inAte=inputs.find(x=>(x.placeholder||x.name||'').toLowerCase().includes('ate')||(x.placeholder||x.name||'').toLowerCase().includes('até'));if(inDe&&item.licaoDe){inDe.value=item.licaoDe;inDe.dispatchEvent(new Event('input',{bubbles:true}));}if(inAte&&item.licaoAte){inAte.value=item.licaoAte;inAte.dispatchEvent(new Event('input',{bubbles:true}));}const txtObs=document.querySelector('.modal textarea, textarea');if(txtObs){txtObs.value=item.observacoes||'Aula realizada no GEM Vila Rui Barbosa';txtObs.dispatchEvent(new Event('input',{bubbles:true}));}const selResp=selects.find(x=>(x.name||x.id||'').toLowerCase().includes('resp')||(x.name||x.id||'').toLowerCase().includes('autoriz'));if(selResp&&selResp.options.length>1){if(!selResp.value||selResp.value==='0')selResp.selectedIndex=1;selResp.dispatchEvent(new Event('change',{bubbles:true}));}await sleep(600);const btnSalvar=Array.from(document.querySelectorAll('.modal button, button')).find(b=>n(b.textContent).includes('SALVAR')&&!n(b.textContent).includes('FECHAR'));if(btnSalvar){btnSalvar.click();c++;if(item.id)ids.push(item.id);await sleep(1500);}}if(ids.length>0){s('Finalizando...','Atualizando App Rui Barbosa');await fetch(u+'/api/gem/sync/marcar-sincronizado',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})});}s('🎉 Concluído com Sucesso!',c+' lições lançadas e App atualizado!');setTimeout(()=>p.remove(),6000);}catch(err){console.error(err);s('Erro na sincronização',err.message);}})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 3000);
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
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Sem Trabalho Manual
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Envio direto e automático de lições para o sistema oficial da CCB
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
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* OPÇÃO 1: BOTÃO DOS FAVORITOS (ZERO INSTALAÇÃO, SEM EXTENSÃO) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50 border-2 border-amber-400/80 rounded-3xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ⭐ Mais Fácil • Sem Instalar Nada
                </span>
                <span className="text-xs font-bold text-slate-700">Botão dos Favoritos (1 Clique)</span>
              </div>

              <button
                type="button"
                onClick={handleCopyBookmarklet}
                className="text-xs font-bold text-amber-900 hover:text-amber-700 underline flex items-center gap-1 self-start sm:self-auto"
              >
                {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBookmarklet ? 'Link copiado!' : 'Copiar link do favorito'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Você <strong>NÃO precisa instalar nenhuma extensão</strong>! Basta arrastar o botão amarelo abaixo para a sua barra de favoritos do navegador:
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <a
                href={bookmarkletCode}
                onClick={(e) => {
                  e.preventDefault();
                  alert('💡 Dica: Arraste este botão diretamente para a barra de favoritos do seu navegador!\n\nSe a barra de favoritos não estiver visível, pressione Ctrl+Shift+B no teclado para exibir.');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md border border-amber-600/20 cursor-grab active:cursor-grabbing select-none transition active:scale-95 text-center"
                title="Arraste este botão para sua barra de favoritos do navegador"
              >
                <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>🤖 Sincronizar SAM (Arraste para Favoritos)</span>
              </a>

              <div className="text-[11px] text-slate-500 text-center sm:text-left">
                No SAM oficial, com seu login aberto, basta dar <strong>1 clique</strong> nesse favorito na sua barra superior e ele faz tudo sozinho!
              </div>
            </div>
          </div>

          {/* OPÇÃO 2: EXTENSÃO OU DISPARO DIRETO DO APP */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-4 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                <span className="font-black text-xs uppercase tracking-wide text-sky-300">
                  Opção Alternativa: Disparo Direto de Dentro do App
                </span>
                {extensaoAtiva && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Extensão Ativa
                  </span>
                )}
              </div>

              {extensaoAtiva ? (
                <button
                  type="button"
                  onClick={handleSincronizarAutomatico}
                  disabled={sincronizando || itensParaEnviar.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {sincronizando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Sincronizando...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Disparar do App ({itensParaEnviar.length})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarGuiaExtensao(!mostrarGuiaExtensao)}
                  className="text-xs text-sky-300 hover:text-sky-200 underline font-bold"
                >
                  {mostrarGuiaExtensao ? 'Ocultar instruções da extensão' : 'Deseja usar a extensão? Ver como ativar'}
                </button>
              )}
            </div>

            {mostrarGuiaExtensao && !extensaoAtiva && (
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  A extensão só é necessária caso você queira clicar no botão <strong>dentro deste App</strong> e ele comandar a outra aba do SAM. Se preferir não mexer com extensão, use a <strong>Opção 1 (Botão dos Favoritos)</strong> acima, que faz a mesma coisa com zero instalação!
                </p>
                <p className="text-slate-400 text-[10px]">
                  Pasta da extensão no seu computador: <code className="bg-slate-950 px-1 py-0.5 rounded text-sky-300">C:\Users\dre_s\Desktop\App_musical\extensao-sam-sync</code>
                </p>
              </div>
            )}
          </div>

          {/* Tabela de Lições Prontas para Envio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Lições Pendentes de Lançamento no SAM ({pendentes.length})
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
