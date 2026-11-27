const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gjvncchcvfqugyzduore.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqdm5jY2hjdmZxdWd5emR1b3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjYyMTcsImV4cCI6MjExMDU0MjIxN30.vfMxgULKmuAiBW1pTGjXDzPwHqp8_J6IS3MBEMl9ERM';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function normalizar(texto = '') {
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function obterDadosSupabase() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sam_ccb_storage?key=eq.gem_database&select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const rows = await res.json();
  return rows[0]?.data || null;
}

async function salvarDadosSupabase(data) {
  await fetch(`${SUPABASE_URL}/rest/v1/sam_ccb_storage?key=eq.gem_database`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });
}

async function iniciar() {
  console.log('====================================================');
  console.log('🤖 ROBÔ AUTOMATIZADOR SAM CCB - VILA RUI BARBOSA');
  console.log('Encarregado: André Salvador');
  console.log('====================================================\n');

  console.log('1. Conectando à nuvem do App Rui Barbosa...');
  const gemData = await obterDadosSupabase();
  if (!gemData || !gemData.alunos) {
    console.error('❌ Erro: Não foi possível carregar o banco de dados do GEM.');
    return;
  }

  const alunosMap = new Map((gemData.alunos || []).map(a => [a.id, a]));
  const pendentes = (gemData.historico || [])
    .filter(h => !h.samSincronizado)
    .map(h => ({
      ...h,
      alunoNome: alunosMap.get(h.alunoId)?.nome || '',
      alunoInstrumento: alunosMap.get(h.alunoId)?.instrumento || ''
    }));

  if (pendentes.length === 0) {
    console.log('✅ Tudo em dia! Nenhuma lição pendente para sincronizar no SAM.');
    console.log('\nPressione qualquer tecla para sair...');
    return;
  }

  console.log(`📋 Encontradas ${pendentes.length} lição(ões) pendente(s) para lançamento:`);
  pendentes.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.alunoNome} - ${p.tipo || 'MTS'}: ${p.metodo || p.faseDe || 'Lição'} (Data: ${p.data})`);
  });

  console.log('\n2. Abrindo o Microsoft Edge no SAM Oficial...');
  if (!fs.existsSync(EDGE_PATH)) {
    console.error(`❌ Microsoft Edge não encontrado no caminho padrão: ${EDGE_PATH}`);
    return;
  }

  // Abre o Edge conectado via Puppeteer
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();

  console.log('3. Navegando para a página de Alunos do GEM no SAM...');
  await page.goto('https://musical.congregacao.org.br/gem/aluno', { waitUntil: 'domcontentloaded' });

  // Verificar se precisa de login
  let urlAtual = page.url();
  if (urlAtual.includes('login') || urlAtual.includes('autenticar')) {
    console.log('\n👉 AVISO: Por favor, digite seu usuário e senha no Edge e faça login no SAM.');
    console.log('⏳ O robô está aguardando você entrar no sistema...');

    // Aguarda o usuário logar
    await page.waitForNavigation({ timeout: 120000 }).catch(() => {});
    await sleep(2000);
    urlAtual = page.url();

    // Se após o login não estiver direto em gem/aluno, navega para lá
    if (!urlAtual.includes('gem/aluno') && !urlAtual.includes('aluno')) {
      console.log('Navegando para G.E.M -> Alunos...');
      await page.goto('https://musical.congregacao.org.br/gem/aluno', { waitUntil: 'domcontentloaded' });
    }
  }

  console.log('\n🚀 Usuário autenticado! Iniciando os lançamentos automáticos...\n');

  // Ajusta paginação da tabela para 100 registros
  try {
    await page.evaluate(() => {
      const sel = document.querySelector('select[name*="length"], select[name*="registros"], .dataTables_length select');
      if (sel && sel.value !== '100' && sel.value !== '-1') {
        sel.value = '100';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(1500);
  } catch (e) {}

  let concluidos = 0;
  const idsSincronizados = [];

  for (let i = 0; i < pendentes.length; i++) {
    const item = pendentes[i];
    console.log(`[${i + 1}/${pendentes.length}] Lançando para: ${item.alunoNome} (${item.tipo || 'MTS'})...`);

    try {
      const sucesso = await page.evaluate(async (licao) => {
        function norm(str = '') {
          return str.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
        }
        const sleepInside = (ms) => new Promise(r => setTimeout(r, ms));

        const linhas = Array.from(document.querySelectorAll('table tbody tr'));
        const trAluno = linhas.find(r => norm(r.innerText).includes(norm(licao.alunoNome)));
        if (!trAluno) return { ok: false, motivo: 'Aluno não encontrado na tabela' };

        // Desmarca outros checkboxes e marca o do aluno
        document.querySelectorAll('table tbody tr input[type="checkbox"]').forEach(c => {
          if (c.checked) {
            c.checked = false;
            c.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        const cb = trAluno.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
          cb.dispatchEvent(new Event('click', { bubbles: true }));
        }
        await sleepInside(400);

        // Clica no botão "+ Adicionar Lições"
        const botoes = Array.from(document.querySelectorAll('button, a'));
        const btnAdd = botoes.find(el => norm(el.textContent).includes('ADICIONAR LICOES'));
        if (!btnAdd) return { ok: false, motivo: 'Botão + Adicionar Lições não encontrado' };

        btnAdd.click();
        await sleepInside(1200);

        // Seleciona a aba (MTS, MSA, Método, Prova, etc.)
        const abaAlvo = norm(licao.tipo || 'MTS');
        const abas = Array.from(document.querySelectorAll('.nav-tabs a, ul.nav a, a[data-toggle="tab"], .modal a'));
        const abaEl = abas.find(a => norm(a.textContent) === abaAlvo);
        if (abaEl) {
          abaEl.click();
          await sleepInside(500);
        }

        // Preenche Data
        const inputs = Array.from(document.querySelectorAll('.modal input, input'));
        const inData = inputs.find(x => (x.name || x.id || '').toLowerCase().includes('data') || x.placeholder?.includes('data')) || document.querySelector('input[type="text"][value*="/"]');
        if (inData) {
          const dt = licao.data && licao.data.includes('-')
            ? licao.data.split('-').reverse().join('/')
            : licao.data || new Date().toLocaleDateString('pt-BR');
          inData.value = dt;
          inData.dispatchEvent(new Event('input', { bubbles: true }));
          inData.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Preenche Módulo / Método
        const selects = Array.from(document.querySelectorAll('.modal select, select'));
        const selMod = selects.find(s => {
          const n = (s.name || s.id || '').toLowerCase();
          return n.includes('modulo') || n.includes('fase') || n.includes('metodo') || n.includes('livro');
        }) || selects[0];

        if (selMod && selMod.options) {
          const busca = norm(licao.metodo || licao.modulo || licao.faseDe || 'FASE 1');
          for (const opt of selMod.options) {
            const optTxt = norm(opt.text);
            if (optTxt.includes(busca) || busca.includes(optTxt)) {
              selMod.value = opt.value;
              selMod.dispatchEvent(new Event('change', { bubbles: true }));
              break;
            }
          }
        }

        // Preenche Lições ou Páginas
        const inDe = inputs.find(x => (x.placeholder || x.name || '').toLowerCase().includes('de') && !(x.placeholder || x.name || '').toLowerCase().includes('ate'));
        const inAte = inputs.find(x => (x.placeholder || x.name || '').toLowerCase().includes('ate') || (x.placeholder || x.name || '').toLowerCase().includes('até'));
        const valDe = licao.licaoDe || licao.paginaDe || '';
        const valAte = licao.licaoAte || licao.paginaAte || '';

        if (inDe && valDe) {
          inDe.value = valDe;
          inDe.dispatchEvent(new Event('input', { bubbles: true }));
          inDe.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (inAte && valAte) {
          inAte.value = valAte;
          inAte.dispatchEvent(new Event('input', { bubbles: true }));
          inAte.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Preenche Observações
        const obsEl = document.querySelector('.modal textarea, textarea');
        if (obsEl) {
          obsEl.value = licao.observacoes || 'Aula realizada no GEM Vila Rui Barbosa';
          obsEl.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Preenche Autorizado por / Responsável
        const selResp = selects.find(s => {
          const n = (s.name || s.id || '').toLowerCase();
          return n.includes('resp') || n.includes('autoriz');
        });
        if (selResp && selResp.options.length > 1) {
          if (!selResp.value || selResp.value === '0') selResp.selectedIndex = 1;
          selResp.dispatchEvent(new Event('change', { bubbles: true }));
        }

        await sleepInside(600);

        // Clica em Salvar
        const btnsModal = Array.from(document.querySelectorAll('.modal button, button'));
        const btnSalvar = btnsModal.find(b => norm(b.textContent).includes('SALVAR') && !norm(b.textContent).includes('FECHAR'));
        if (btnSalvar) {
          btnSalvar.click();
          await sleepInside(1500);
          return { ok: true };
        }

        return { ok: false, motivo: 'Botão Salvar não encontrado' };
      }, item);

      if (sucesso.ok) {
        console.log(`   ✅ Lição de ${item.alunoNome} lançada e salva com sucesso!`);
        concluidos++;
        idsSincronizados.push(item.id);
      } else {
        console.warn(`   ⚠️ Falha ao lançar: ${sucesso.motivo}`);
      }

      await sleep(1000);
    } catch (err) {
      console.error(`   ❌ Erro ao processar ${item.alunoNome}:`, err.message);
    }
  }

  // 4. Atualizar no banco Supabase
  if (idsSincronizados.length > 0) {
    console.log('\n4. Atualizando status no App GEM Rui Barbosa...');
    gemData.historico.forEach(h => {
      if (idsSincronizados.includes(h.id)) {
        h.samSincronizado = true;
        h.samSincronizadoEm = new Date().toISOString();
        h.samSincronizadoPor = 'Robô Desktop';
      }
    });
    await salvarDadosSupabase(gemData);
    console.log('✅ App atualizado! Todas as lições foram marcadas como sincronizadas.');
  }

  console.log('\n====================================================');
  console.log(`🎉 Sincronização Concluída: ${concluidos} lição(ões) lançada(s)!`);
  console.log('====================================================\n');
}

iniciar().catch(console.error);
