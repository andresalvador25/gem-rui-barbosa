/**
 * Content Script injetado no Sistema Oficial de Administração Musical (SAM) da CCB
 * Domínio: musical.congregacao.org.br
 * Executa as ações de automação na tela de G.E.M -> Alunos -> Lançar Lições.
 */

console.log('%c🤖 [Robô SAM CCB] Módulo de Automação Carregado com Sucesso!', 'background:#0369a1;color:white;font-weight:bold;padding:4px 8px;border-radius:4px;');

// Escuta comandos vindos do Service Worker / App GEM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXECUTAR_LANCAMENTOS_SAM') {
    const licoes = request.payload || [];
    console.log('[Robô SAM] Iniciando lote de lançamentos:', licoes);

    // Responde de imediato ao sender confirmando o início
    sendResponse({ success: true, total: licoes.length });

    // Executa o processamento assíncrono
    processarLoteLicoes(licoes);
  }
});

// Função utilitária de espera
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Normalizador de texto para comparação segura sem acentos
function normalizar(texto = '') {
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

// Criação ou atualização do painel flutuante de progresso
function obterPainelProgresso() {
  let painel = document.getElementById('robo-sam-painel-flutuante');
  if (!painel) {
    painel = document.createElement('div');
    painel.id = 'robo-sam-painel-flutuante';
    painel.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999999;
      background: #0f172a;
      color: #f8fafc;
      padding: 18px;
      border-radius: 14px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      width: 360px;
      border: 2px solid #38bdf8;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(painel);
  }
  return painel;
}

function atualizarProgresso(titulo, detalhe = '', progressoPercent = null) {
  const painel = obterPainelProgresso();
  painel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:between;margin-bottom:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">🤖</span>
        <span style="font-weight:800;color:#38bdf8;font-size:14px;letter-spacing:0.3px;">Robô SAM Rui Barbosa</span>
      </div>
      <span style="background:#0284c7;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">Ativo</span>
    </div>
    <div style="font-size:12px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">${titulo}</div>
    ${detalhe ? `<div style="font-size:11px;color:#94a3b8;line-height:1.4;">${detalhe}</div>` : ''}
    ${progressoPercent !== null ? `
      <div style="width:100%;background:#334155;height:6px;border-radius:999px;margin-top:10px;overflow:hidden;">
        <div style="background:#38bdf8;height:100%;width:${progressoPercent}%;transition:width 0.3s ease;"></div>
      </div>
    ` : ''}
  `;
}

// Rotina principal de execução
async function processarLoteLicoes(licoes) {
  if (!licoes || licoes.length === 0) return;

  atualizarProgresso('Preparando ambiente...', 'Verificando tabela de alunos do GEM', 0);

  // 1. Ajustar exibição para 100 registros para garantir que o aluno esteja visível na página
  try {
    const selectPaginacao = document.querySelector('select[name*="length"], select[name*="registros"], .dataTables_length select');
    if (selectPaginacao && selectPaginacao.value !== '100' && selectPaginacao.value !== '-1') {
      selectPaginacao.value = '100';
      selectPaginacao.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(1000);
    }
  } catch (e) {}

  let concluidos = 0;
  let erros = 0;
  const idsSincronizados = [];

  for (let i = 0; i < licoes.length; i++) {
    const item = licoes[i];
    const pct = Math.round(((i) / licoes.length) * 100);
    atualizarProgresso(
      `Lançando (${i + 1}/${licoes.length}): ${item.alunoNome || 'Aluno'}`,
      `Aba: ${item.tipo || 'MTS'} • ${item.modulo || 'Fase 1'}`,
      pct
    );

    try {
      const alunoAlvo = normalizar(item.alunoNome);

      // 1. Localizar a linha do aluno na tabela
      const linhas = Array.from(document.querySelectorAll('table tbody tr'));
      let linhaAluno = null;

      for (const tr of linhas) {
        const textoLinha = normalizar(tr.innerText);
        if (textoLinha.includes(alunoAlvo)) {
          linhaAluno = tr;
          break;
        }
      }

      if (!linhaAluno) {
        console.warn(`[Robô SAM] Aluno "${item.alunoNome}" não localizado na listagem.`);
        erros++;
        continue;
      }

      // 2. Desmarcar todos os outros checkboxes e marcar o do aluno atual
      document.querySelectorAll('table tbody tr input[type="checkbox"]').forEach(cb => {
        if (cb.checked) {
          cb.checked = false;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      const checkboxAluno = linhaAluno.querySelector('input[type="checkbox"]');
      if (checkboxAluno) {
        checkboxAluno.checked = true;
        checkboxAluno.dispatchEvent(new Event('change', { bubbles: true }));
        checkboxAluno.dispatchEvent(new Event('click', { bubbles: true }));
      }
      await sleep(350);

      // 3. Clicar no botão "+ Adicionar Lições"
      const botoes = Array.from(document.querySelectorAll('button, a'));
      const btnAddLicoes = botoes.find(el => {
        const txt = normalizar(el.textContent);
        return txt.includes('ADICIONAR LICOES') || txt.includes('+ ADICIONAR LICOES');
      });

      if (!btnAddLicoes) {
        console.error('[Robô SAM] Botão "+ Adicionar Lições" não encontrado.');
        erros++;
        continue;
      }

      btnAddLicoes.click();
      await sleep(1000); // Aguarda abertura do modal Bootstrap / jQuery

      // 4. Selecionar a aba correta (MTS, MSA, Prova, Método, Hinário, Escalas)
      const abaDesejada = normalizar(item.tipo || 'MTS');
      const abas = Array.from(document.querySelectorAll('.nav-tabs a, ul.nav a, a[data-toggle="tab"], .modal a'));
      const abaAlvo = abas.find(a => normalizar(a.textContent) === abaDesejada);
      if (abaAlvo) {
        abaAlvo.click();
        await sleep(400);
      }

      // 5. Preencher os campos do formulário
      // Campo Data
      const inputs = Array.from(document.querySelectorAll('.modal input, input'));
      const inputData = inputs.find(inp => {
        const name = (inp.name || inp.id || '').toLowerCase();
        return name.includes('data') || inp.placeholder?.includes('data');
      }) || document.querySelector('input[type="text"][value*="/"]');

      if (inputData) {
        const dataFormatada = item.data && item.data.includes('-')
          ? item.data.split('-').reverse().join('/')
          : item.data || new Date().toLocaleDateString('pt-BR');
        
        inputData.value = dataFormatada;
        inputData.dispatchEvent(new Event('input', { bubbles: true }));
        inputData.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Campo Módulo ou Método
      const selectModulo = selects.find(s => {
        const name = (s.name || s.id || '').toLowerCase();
        return name.includes('modulo') || name.includes('fase') || name.includes('metodo') || name.includes('livro');
      }) || selects[0];

      if (selectModulo && selectModulo.options) {
        const termoBusca = normalizar(item.metodo || item.modulo || item.faseDe || 'FASE 1');
        for (const opt of selectModulo.options) {
          const optText = normalizar(opt.text);
          if (optText.includes(termoBusca) || termoBusca.includes(optText)) {
            selectModulo.value = opt.value;
            selectModulo.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }

      // Campos Lições / Páginas (de/até)
      const inputLicaoDe = inputs.find(inp => {
        const p = (inp.placeholder || inp.name || '').toLowerCase();
        return (p.includes('de') || p.includes('inicio') || p.includes('página') || p.includes('pagina')) && !p.includes('ate');
      });
      const inputLicaoAte = inputs.find(inp => {
        const p = (inp.placeholder || inp.name || '').toLowerCase();
        return p.includes('ate') || p.includes('até') || p.includes('fim');
      });

      const valorDe = item.licaoDe || item.paginaDe || item.licao || '';
      const valorAte = item.licaoAte || item.paginaAte || '';

      if (inputLicaoDe && valorDe) {
        inputLicaoDe.value = valorDe;
        inputLicaoDe.dispatchEvent(new Event('input', { bubbles: true }));
        inputLicaoDe.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (inputLicaoAte && valorAte) {
        inputLicaoAte.value = valorAte;
        inputLicaoAte.dispatchEvent(new Event('input', { bubbles: true }));
        inputLicaoAte.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Campo Observações
      const textareas = Array.from(document.querySelectorAll('.modal textarea, textarea'));
      const textareaObs = textareas[0];
      if (textareaObs) {
        textareaObs.value = item.observacoes || 'Aula realizada no GEM Vila Rui Barbosa';
        textareaObs.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Campo Autorizado por
      const selectAutorizado = selects.find(s => {
        const name = (s.name || s.id || '').toLowerCase();
        return name.includes('resp') || name.includes('autoriz');
      });
      if (selectAutorizado && selectAutorizado.options.length > 1) {
        if (!selectAutorizado.value || selectAutorizado.value === '0') {
          selectAutorizado.selectedIndex = 1;
        }
        selectAutorizado.dispatchEvent(new Event('change', { bubbles: true }));
      }

      await sleep(600);

      // 6. Clicar no botão "Salvar"
      const botoesModal = Array.from(document.querySelectorAll('.modal button, button'));
      const btnSalvar = botoesModal.find(btn => {
        const txt = normalizar(btn.textContent);
        return txt.includes('SALVAR') && !txt.includes('FECHAR');
      });

      if (btnSalvar) {
        btnSalvar.click();
        concluidos++;
        if (item.id) idsSincronizados.push(item.id);
        console.log(`[Robô SAM] ✅ Lição de ${item.alunoNome} salva com sucesso!`);
        await sleep(1500); // Aguarda confirmação no banco e fechamento do modal
      } else {
        console.warn('[Robô SAM] Botão Salvar não encontrado no modal.');
        erros++;
      }

    } catch (e) {
      console.error(`[Robô SAM] Erro ao processar ${item.alunoNome}:`, e);
      erros++;
    }
  }

  // Notificar conclusão para o background (que avisa o App GEM!)
  atualizarProgresso(
    '🎉 Sincronização Concluída!',
    `Sucesso: ${concluidos} lançamentos | Erros: ${erros}. Notificando o App...`,
    100
  );

  chrome.runtime.sendMessage({
    action: 'SINCRONIZACAO_SAM_CONCLUIDA',
    resultado: {
      concluidos,
      erros,
      ids: idsSincronizados,
      timestamp: new Date().toISOString()
    }
  });

  // Oculta o painel após 8 segundos
  setTimeout(() => {
    const p = document.getElementById('robo-sam-painel-flutuante');
    if (p) p.remove();
  }, 8000);
}
