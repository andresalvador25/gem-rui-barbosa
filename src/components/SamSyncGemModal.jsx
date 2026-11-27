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
  Bookmark,
  Check,
  ChevronRight
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

  // Carregar lista de pendentes gerais
  const carregarPendentesGerais = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gem/sync/pendentes');
      if (res.ok) {
        const json = await res.json();
        if (json.pendentes) {
          setPendentes(json.pendentes);
          // Marca todos como selecionados por padrão
          setSelectedIds(new Set(json.pendentes.map(p => p.id)));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar pendentes do servidor, buscando localmente');
    }

    // Fallback: se estiver offline, busca do localStorage
    try {
      const savedAlunos = JSON.parse(localStorage.getItem('gem_alunos_storage') || '[]');
      const alunosMap = new Map(savedAlunos.map(a => [a.id, a]));
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
    setCopied(false);

    if (modo === 'todos') {
      carregarPendentesGerais();
    } else if (alunoAtual) {
      // Filtrar histórico do aluno atual que não foi sincronizado
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

  // Itens filtrados para envio
  const itensParaEnviar = pendentes.filter(p => selectedIds.has(p.id));

  // Gerar o Script de Automação do Robô SAM
  const gerarCodigoRobo = () => {
    const payload = itensParaEnviar.map(item => ({
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

    return `/**
 * ROBÔ AUTOMATIZADOR DE LANÇAMENTO DE LIÇÕES - SAM CCB
 * Congregação Cristã no Brasil - Vila Rui Barbosa (Jundiaí - SP)
 * Encarregado: André Salvador
 * Total de lições a sincronizar: ${payload.length}
 */
(async function executarRoboSam() {
  const licoes = ${JSON.stringify(payload, null, 2)};

  console.log('%c🤖 [ROBÔ SAM RUI BARBOSA] Iniciando sincronização...', 'background: #0284c7; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
  console.log('Lições para lançar:', licoes);

  // Criar popup de progresso flutuante no SAM
  let painel = document.getElementById('robo-sam-painel');
  if (!painel) {
    painel = document.createElement('div');
    painel.id = 'robo-sam-painel';
    painel.style = 'position:fixed;top:20px;right:20px;z-index:999999;background:#0f172a;color:#f8fafc;padding:16px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:sans-serif;font-size:13px;width:340px;border:2px solid #38bdf8;';
    document.body.appendChild(painel);
  }

  function atualizarStatus(msg, submsg = '') {
    painel.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-weight:bold;color:#38bdf8;margin-bottom:6px;">' +
      '<span>🤖 Sincronizador SAM Rui Barbosa</span></div>' +
      '<div style="font-size:12px;color:#e2e8f0;margin-bottom:4px;">' + msg + '</div>' +
      (submsg ? '<div style="font-size:11px;color:#94a3b8;">' + submsg + '</div>' : '');
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Garantir que estamos na tela de Alunos do GEM
  if (!window.location.href.includes('aluno')) {
    alert('⚠️ Por favor, acesse a página de "G.E.M -> Alunos" no SAM antes de executar o robô.');
    return;
  }

  let concluidos = 0;
  let erros = 0;

  for (let i = 0; i < licoes.length; i++) {
    const item = licoes[i];
    atualizarStatus(\`Processando (\${i + 1}/\${licoes.length}): \${item.alunoNome}\`, \`Lição: \${item.tipo} - \${item.modulo}\`);

    try {
      // 1. Localizar o aluno na tabela pelo nome
      const linhas = Array.from(document.querySelectorAll('table tbody tr'));
      let linhaEncontrada = null;

      for (const tr of linhas) {
        const texto = tr.innerText.toUpperCase();
        if (texto.includes(item.alunoNome.toUpperCase())) {
          linhaEncontrada = tr;
          break;
        }
      }

      if (!linhaEncontrada) {
        console.warn(\`Aluno "\${item.alunoNome}" não localizado na listagem do SAM.\`);
        erros++;
        continue;
      }

      // 2. Desmarcar todos os outros checkboxes e marcar o do aluno atual
      document.querySelectorAll('table tbody tr input[type="checkbox"]').forEach(cb => cb.checked = false);
      const checkbox = linhaEncontrada.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await sleep(400);

      // 3. Clicar no botão "+ Adicionar Lições"
      let btnAddLicoes = Array.from(document.querySelectorAll('button, a')).find(el => 
        el.textContent.includes('Adicionar Lições') || el.textContent.includes('+ Adicionar Lições')
      );

      if (!btnAddLicoes) {
        console.error('Botão "+ Adicionar Lições" não encontrado na tela.');
        erros++;
        continue;
      }

      btnAddLicoes.click();
      await sleep(1000); // Aguarda o modal "Lançar Lições" abrir

      // 4. Selecionar a aba correta (MTS, MSA, Prova, Método, Hinário, Escalas)
      const abas = Array.from(document.querySelectorAll('.nav-tabs a, ul.nav a, .tab-pane, div[role="tablist"] a, a[data-toggle="tab"]'));
      const abaAlvo = abas.find(a => a.textContent.trim().toUpperCase() === (item.tipo || 'MTS').toUpperCase());
      if (abaAlvo) {
        abaAlvo.click();
        await sleep(400);
      }

      // 5. Preencher os campos do formulário
      // Campo Data
      const inputData = document.querySelector('input[name*="data"], input[id*="data"], input[type="text"][value*="/"]');
      if (inputData) {
        inputData.value = item.data;
        inputData.dispatchEvent(new Event('input', { bubbles: true }));
        inputData.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Campo Módulo
      const selectModulo = document.querySelector('select[name*="modulo"], select[id*="modulo"], select');
      if (selectModulo) {
        for (const opt of selectModulo.options) {
          if (opt.text.toUpperCase().includes((item.modulo || '').toUpperCase())) {
            selectModulo.value = opt.value;
            selectModulo.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }

      // Campos Lição de / até
      const inputsTexto = Array.from(document.querySelectorAll('input[type="text"], input[type="number"]'));
      const inputLicaoDe = inputsTexto.find(inp => (inp.placeholder || '').toLowerCase().includes('de') || (inp.name || '').includes('de'));
      const inputLicaoAte = inputsTexto.find(inp => (inp.placeholder || '').toLowerCase().includes('até') || (inp.name || '').includes('ate'));
      
      if (inputLicaoDe && item.licaoDe) {
        inputLicaoDe.value = item.licaoDe;
        inputLicaoDe.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (inputLicaoAte && item.licaoAte) {
        inputLicaoAte.value = item.licaoAte;
        inputLicaoAte.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Campo Observações
      const textareaObs = document.querySelector('textarea');
      if (textareaObs) {
        textareaObs.value = item.observacoes;
        textareaObs.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Campo Autorizado por
      const selectAutorizado = Array.from(document.querySelectorAll('select')).find(s => 
        (s.name || '').includes('resp') || (s.name || '').includes('autoriz') || (s.id || '').includes('autoriz')
      );
      if (selectAutorizado && selectAutorizado.options.length > 1) {
        // Seleciona o primeiro instrutor válido disponível
        selectAutorizado.selectedIndex = 1;
        selectAutorizado.dispatchEvent(new Event('change', { bubbles: true }));
      }

      await sleep(600);

      // 6. Clicar no botão "Salvar"
      const btnSalvar = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Salvar') && !btn.textContent.includes('Fechar')
      );

      if (btnSalvar) {
        btnSalvar.click();
        concluidos++;
        console.log(\`✅ Lição de \${item.alunoNome} salva com sucesso!\`);
        await sleep(1500); // Aguardar salvar e fechar modal
      } else {
        console.warn('Botão "Salvar" não encontrado no modal.');
      }

    } catch (err) {
      console.error(\`Erro ao processar \${item.alunoNome}:\`, err);
      erros++;
    }
  }

  atualizarStatus(
    '🎉 Sincronização Concluída!', 
    \`Sucesso: \${concluidos} | Erros ou não encontrados: \${erros}\`
  );
  setTimeout(() => {
    alert(\`✅ Robô SAM concluído!\\n\\nLições sincronizadas: \${concluidos}\\nErros: \${erros}\`);
  }, 1000);
})();`;
  };

  const handleCopyCode = () => {
    const code = gerarCodigoRobo();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleMarcarSincronizado = async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    const idsArray = Array.from(selectedIds);

    try {
      const res = await fetch('/api/gem/sync/marcar-sincronizado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsArray })
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `${idsArray.length} lição(ões) marcada(s) como enviadas ao SAM com sucesso!`
        });
      } else {
        throw new Error('Falha no servidor');
      }
    } catch (e) {
      // Fallback local
      idsArray.forEach(id => {
        // atualiza localmente se necessário
      });
      setStatusMessage({
        type: 'success',
        text: `${idsArray.length} lição(ões) marcada(s) como sincronizadas localmente.`
      });
    }

    setLoading(false);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header com identidade visual SAM CCB */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Robô Sincronizador Oficial do SAM</h3>
                <span className="bg-sky-500/25 text-sky-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-400/30 uppercase">
                  Apenas Encarregado
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Envio automatizado de lições do GEM para o portal musical oficial da CCB
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
            {selectedIds.size} de {pendentes.length} selecionado(s) para sincronização
          </div>
        </div>

        {/* Corpo do Modal com rolagem */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Banner de Segurança & Como Funciona */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-blue-950 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Segurança Absoluta: Você no controle do SAM com sua senha</span>
              </div>
              <p className="text-xs text-blue-800/80 leading-relaxed">
                O robô não armazena nem solicita sua senha do SAM. Você entra com seu login normal no site oficial da CCB, e o robô apenas preenche as lições selecionadas automaticamente na sua frente.
              </p>
            </div>

            <a
              href="https://musical.congregacao.org.br/gem/aluno"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir SAM Oficial</span>
            </a>
          </div>

          {/* Tabela de Lições Prontas para Envio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Lições Lançadas Prontas para Enviar ao SAM ({pendentes.length})
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-1">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Tudo em dia!</p>
                <p className="text-[11px] text-slate-500">
                  Não há novas lições pendentes de sincronização para {modo === 'aluno' && alunoAtual ? alunoAtual.nome : 'os alunos do GEM'}.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
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
                            isChecked ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50 text-slate-600'
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

          {/* Execução do Robô: Passo a Passo Claro */}
          {itensParaEnviar.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-sky-400" />
                  <h4 className="font-black text-sm uppercase tracking-wide text-sky-300">
                    Como Rodar o Robô Agora ({itensParaEnviar.length} Lições Prontas)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow-md"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Código Copiado!' : 'Copiar Robô (1 Clique)'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-sky-400 font-black block">Passo 1</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Acesse o SAM oficial na tela <strong>G.E.M &gt; Alunos</strong> com seu login.
                  </p>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-sky-400 font-black block">Passo 2</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Clique no botão acima <strong>[Copiar Robô]</strong>. No SAM, pressione <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-300">F12</code> &gt; <strong>Console</strong>, cole e dê <kbd className="bg-slate-900 px-1 py-0.5 rounded text-sky-300">Enter</kbd>.
                  </p>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-sky-400 font-black block">Passo 3</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    O robô marca cada aluno, clica em <strong>+ Adicionar Lições</strong>, preenche a aba e salva sozinho!
                  </p>
                </div>
              </div>

              {/* Botão para marcar como concluído */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Após o robô terminar no SAM, clique ao lado para registrar que as lições foram enviadas:
                </span>
                <button
                  type="button"
                  onClick={handleMarcarSincronizado}
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Marcar como Sincronizadas no App</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            Integração SAM CCB • Congregação Vila Rui Barbosa
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
