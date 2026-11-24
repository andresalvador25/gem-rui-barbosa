import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Check, 
  X, 
  UserCheck, 
  UserX, 
  RotateCcw, 
  Save, 
  Plus, 
  Printer, 
  Sparkles,
  Users,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Settings,
  Palmtree,
  Music2,
  Clock,
  Target,
  AlertCircle,
  CalendarPlus,
  Trash2
} from 'lucide-react';
import { ALUNOS_PRESENCA_2026, DATAS_AULAS_2026, DATAS_AULAS_2027 } from '../constants/gemInitialData.js';
import AlunoGemModal from './AlunoGemModal.jsx';
import LancamentoHistoricoModal from './LancamentoHistoricoModal.jsx';
import { isSamePerson, formatInstrumentName } from '../utils/gemSync.js';

const MONTH_MAP = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Gerador automático dos sábados letivos (Fevereiro a Dezembro) para qualquer ano
const gerarSabadosDoAno = (ano) => {
  const sabados = [];
  let d = new Date(ano, 1, 1); // 1 de Fev
  while (d.getDay() !== 6) {
    d.setDate(d.getDate() + 1);
  }
  while (d.getFullYear() === ano && d.getMonth() <= 11) {
    if (d.getMonth() === 11 && d.getDate() > 22) break; // Recesso de fim de ano
    sabados.push(`${d.getDate()}-${MONTH_NAMES[d.getMonth()]}`);
    d.setDate(d.getDate() + 7);
  }
  return sabados;
};

// Ordenador cronológico de datas (ex: '7-Feb', '14-Feb')
const ordenarDatasCronologico = (datas = [], ano = 2026) => {
  return [...new Set(datas)].sort((a, b) => {
    const [diaA, mesA] = a.split('-');
    const [diaB, mesB] = b.split('-');
    const mA = MONTH_MAP[mesA] ?? 0;
    const mB = MONTH_MAP[mesB] ?? 0;
    if (mA !== mB) return mA - mB;
    return parseInt(diaA, 10) - parseInt(diaB, 10);
  });
};

export default function Presenca2026View({ alunosGem = [], onRefresh }) {
  // Lista de anos disponíveis configurável pelo usuário
  const [anosDisponiveis, setAnosDisponiveis] = useState(() => {
    const saved = localStorage.getItem('gem_anos_disponiveis');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.sort((a, b) => a - b);
      } catch (e) {}
    }
    return [2026, 2027];
  });

  const [anoAtivo, setAnoAtivo] = useState(2026);

  const ordenarPorNome = (lista = []) =>
    [...lista].sort((a, b) =>
      (a?.nome || '').trim().localeCompare((b?.nome || '').trim(), 'pt-BR', { sensitivity: 'base' })
    );

  // Carregar alunos baseado no ano ativo
  const [alunos, setAlunos] = useState(() => {
    const saved = localStorage.getItem('gem_presenca_2026_alunos');
    if (saved) {
      try { return ordenarPorNome(JSON.parse(saved)); } catch (e) {}
    }
    return ordenarPorNome(ALUNOS_PRESENCA_2026);
  });

  // Carregar lista de datas do ano ativo (permite adicionar/remover datas livremente)
  const [datasDoAno, setDatasDoAno] = useState(() => {
    const saved = localStorage.getItem('gem_datas_2026');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return ordenarDatasCronologico(parsed, 2026);
      } catch (e) {}
    }
    return DATAS_AULAS_2026;
  });

  // Carregar status manual das datas (feriados e ensaios técnicos) por ano
  const [statusDatas, setStatusDatas] = useState(() => {
    const saved = localStorage.getItem('gem_datas_status_2026');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  // Quando trocar o ano ativo, carrega a lista de datas, alunos e status daquele ano
  useEffect(() => {
    // 1. Carregar Datas do ano
    const keyDatas = `gem_datas_${anoAtivo}`;
    const savedDatas = localStorage.getItem(keyDatas);
    if (savedDatas) {
      try {
        const parsed = JSON.parse(savedDatas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDatasDoAno(ordenarDatasCronologico(parsed, anoAtivo));
        } else {
          setDatasDoAno(anoAtivo === 2027 ? DATAS_AULAS_2027 : anoAtivo === 2026 ? DATAS_AULAS_2026 : gerarSabadosDoAno(anoAtivo));
        }
      } catch (e) {
        setDatasDoAno(anoAtivo === 2027 ? DATAS_AULAS_2027 : DATAS_AULAS_2026);
      }
    } else {
      const defaultDatas = anoAtivo === 2027 ? DATAS_AULAS_2027 : anoAtivo === 2026 ? DATAS_AULAS_2026 : gerarSabadosDoAno(anoAtivo);
      setDatasDoAno(defaultDatas);
      localStorage.setItem(keyDatas, JSON.stringify(defaultDatas));
    }

    // 2. Carregar Alunos do ano
    const keyAlunos = `gem_presenca_${anoAtivo}_alunos`;
    const savedAlunos = localStorage.getItem(keyAlunos);
    if (savedAlunos) {
      try {
        setAlunos(ordenarPorNome(JSON.parse(savedAlunos)));
      } catch (e) {
        setAlunos(ordenarPorNome(ALUNOS_PRESENCA_2026));
      }
    } else {
      // Se ainda não tiver alunos para o novo ano, herda os alunos ativos com presenças limpas
      const alunosBase = ALUNOS_PRESENCA_2026.map(a => ({
        ...a,
        presencas: {}
      }));
      setAlunos(ordenarPorNome(alunosBase));
      localStorage.setItem(keyAlunos, JSON.stringify(alunosBase));
    }

    // 3. Carregar Status das Datas do ano
    const keyStatus = `gem_datas_status_${anoAtivo}`;
    const savedStatus = localStorage.getItem(keyStatus);
    if (savedStatus) {
      try { setStatusDatas(JSON.parse(savedStatus)); } catch (e) { setStatusDatas({}); }
    } else {
      setStatusDatas({});
    }

    setSelectedMes('Todos');
  }, [anoAtivo]);

  // Sincroniza automaticamente os dados cadastrais dos alunos com a base oficial do GEM (alunosGem)
  useEffect(() => {
    if (!alunosGem || alunosGem.length === 0) return;
    setAlunos(prevAlunos => {
      const usedGemIds = new Set();
      const merged = prevAlunos.map(a => {
        const gemMatch = alunosGem.find(g => isSamePerson(a, g));
        if (gemMatch) {
          usedGemIds.add(gemMatch.id);
          return {
            ...a,
            id: gemMatch.id,
            nome: gemMatch.nome || a.nome,
            instrumento: formatInstrumentName(gemMatch.instrumento || a.instrumento, gemMatch.cargo),
            comum: gemMatch.comum || a.comum || 'VILA RUI BARBOSA',
            cargo: gemMatch.cargo || a.cargo || 'MÚSICO',
            nivel: gemMatch.nivel || a.nivel || 'CANDIDATO(A)',
            possuiInstrumento: gemMatch.possuiInstrumento || a.possuiInstrumento || 'SIM',
            instrumentoProprio: gemMatch.instrumentoProprio || a.instrumentoProprio || 'SIM',
            tonalidade: gemMatch.tonalidade || a.tonalidade || 'DÓ',
            dataInicioGem: gemMatch.dataInicioGem || a.dataInicioGem || ''
          };
        }
        return a;
      });

      alunosGem.forEach(g => {
        if (!usedGemIds.has(g.id)) {
          merged.push({
            id: g.id,
            nome: g.nome,
            instrumento: formatInstrumentName(g.instrumento, g.cargo),
            msa: '',
            comum: g.comum || 'VILA RUI BARBOSA',
            cargo: g.cargo || 'MÚSICO',
            nivel: g.nivel || 'CANDIDATO(A)',
            possuiInstrumento: g.possuiInstrumento || 'SIM',
            instrumentoProprio: g.instrumentoProprio || 'SIM',
            tonalidade: g.tonalidade || 'DÓ',
            dataInicioGem: g.dataInicioGem || '',
            presencas: {}
          });
        }
      });

      const ordenados = ordenarPorNome(merged);
      localStorage.setItem(`gem_presenca_${anoAtivo}_alunos`, JSON.stringify(ordenados));
      return ordenados;
    });
  }, [alunosGem, anoAtivo]);

  const [busca, setBusca] = useState('');
  const [filtroComum, setFiltroComum] = useState('Todas');
  const [filtroInstrumento, setFiltroInstrumento] = useState('Todos');
  const [selectedMes, setSelectedMes] = useState('Todos');
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ nome: '', instrumento: 'Violino', msa: '', comum: 'Vila Rui Barbosa' });
  const [toast, setToast] = useState(null);

  // Modais de Criação de Novo Ano e Nova Data
  const [isModalNovoAnoOpen, setIsModalNovoAnoOpen] = useState(false);
  const [inputNovoAno, setInputNovoAno] = useState(new Date().getFullYear() + 2);
  const [gerarDatasAuto, setGerarDatasAuto] = useState(true);

  const [isModalNovaDataOpen, setIsModalNovaDataOpen] = useState(false);
  const [inputDataNova, setInputDataNova] = useState('');
  const [inputTipoDataNova, setInputTipoDataNova] = useState('normal'); // 'normal' | 'ensaio_tecnico' | 'feriado'
  const [inputMotivoDataNova, setInputMotivoDataNova] = useState('');

  // Modal para configurar status do dia (Normal, Feriado, Ensaio Técnico ou Excluir)
  const [dataConfigurando, setDataConfigurando] = useState(null);

  // Modais de Ficha e Lançamento
  const [alunoFicha, setAlunoFicha] = useState(null);
  const [alunoLancamento, setAlunoLancamento] = useState(null);

  // Refs para rolagem até a semana atual
  const tableContainerRef = useRef(null);
  const currentDateRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const sincronizarChamadaServidor = async (override = {}) => {
    try {
      await fetch('/api/gem/chamada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ano: override.ano || anoAtivo,
          anosDisponiveis: override.anosDisponiveis || anosDisponiveis,
          datasDoAno: override.datasDoAno || datasDoAno,
          statusDatas: override.statusDatas || statusDatas,
          alunosPresenca: override.alunosPresenca || alunos
        })
      });
      // Notifica todos os componentes e abas da atualização
      try {
        window.dispatchEvent(new CustomEvent('gem-data-updated'));
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('sam_musical_sync');
          bc.postMessage({ type: 'SYNC' });
          bc.close();
        }
      } catch (e) {}
    } catch (e) {}
  };

  // Carrega dados da chamada salvos no servidor e mescla com o estado local
  const carregarChamadaServidor = useCallback(() => {
    fetch('/api/gem/chamada')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.chamada) return;
        const ch = json.chamada;
        if (Array.isArray(ch.anosDisponiveis) && ch.anosDisponiveis.length > 0) {
          setAnosDisponiveis(prev => {
            const merged = [...new Set([...prev, ...ch.anosDisponiveis])].sort((a, b) => a - b);
            localStorage.setItem('gem_anos_disponiveis', JSON.stringify(merged));
            return merged;
          });
        }
        const serverDatas = ch.datasPorAno?.[anoAtivo];
        if (Array.isArray(serverDatas) && serverDatas.length > 0) {
          setDatasDoAno(ordenarDatasCronologico(serverDatas, anoAtivo));
          localStorage.setItem(`gem_datas_${anoAtivo}`, JSON.stringify(serverDatas));
        }
        const serverStatus = ch.statusDatasPorAno?.[anoAtivo];
        if (serverStatus && Object.keys(serverStatus).length > 0) {
          setStatusDatas(prev => {
            const merged = { ...prev, ...serverStatus };
            localStorage.setItem(`gem_datas_status_${anoAtivo}`, JSON.stringify(merged));
            return merged;
          });
        }
        const serverPres = ch.presencasPorAno?.[anoAtivo];
        if (serverPres && Object.keys(serverPres).length > 0) {
          setAlunos(prev => {
            const updated = prev.map(a => {
              const sp = serverPres[a.id];
              if (!sp) return a;
              return {
                ...a,
                msa: sp.msa !== undefined ? sp.msa : (a.msa || ''),
                presencas: { ...(a.presencas || {}), ...(sp.presencas || {}) }
              };
            });
            localStorage.setItem(`gem_presenca_${anoAtivo}_alunos`, JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [anoAtivo]);

  useEffect(() => {
    carregarChamadaServidor();
    const handleSync = () => carregarChamadaServidor();
    window.addEventListener('gem-data-updated', handleSync);
    return () => window.removeEventListener('gem-data-updated', handleSync);
  }, [carregarChamadaServidor]);

  const salvarStorageAlunos = (novosDados) => {
    const ordenados = ordenarPorNome(novosDados);
    setAlunos(ordenados);
    localStorage.setItem(`gem_presenca_${anoAtivo}_alunos`, JSON.stringify(ordenados));
    sincronizarChamadaServidor({ alunosPresenca: ordenados });
  };

  const salvarDatasDoAno = (novasList) => {
    const ordenadas = ordenarDatasCronologico(novasList, anoAtivo);
    setDatasDoAno(ordenadas);
    localStorage.setItem(`gem_datas_${anoAtivo}`, JSON.stringify(ordenadas));
    sincronizarChamadaServidor({ datasDoAno: ordenadas });
  };

  // Criação de um novo ano de planejamento livre
  const handleCriarNovoAno = (e) => {
    e.preventDefault();
    const anoNum = parseInt(inputNovoAno, 10);
    if (!anoNum || anoNum < 2020 || anoNum > 2100) {
      showToast('Por favor informe um ano válido (ex: 2028).');
      return;
    }

    if (anosDisponiveis.includes(anoNum)) {
      setAnoAtivo(anoNum);
      setIsModalNovoAnoOpen(false);
      showToast(`O ano ${anoNum} já existe e foi selecionado!`);
      return;
    }

    const novosAnos = [...anosDisponiveis, anoNum].sort((a, b) => a - b);
    setAnosDisponiveis(novosAnos);
    localStorage.setItem('gem_anos_disponiveis', JSON.stringify(novosAnos));

    // Gerar datas
    const datasGeradas = gerarDatasAuto ? gerarSabadosDoAno(anoNum) : [];
    localStorage.setItem(`gem_datas_${anoNum}`, JSON.stringify(datasGeradas));

    // Copiar alunos do ano ativo
    const alunosCopiados = alunos.map(a => ({ ...a, presencas: {} }));
    localStorage.setItem(`gem_presenca_${anoNum}_alunos`, JSON.stringify(alunosCopiados));

    setAnoAtivo(anoNum);
    setIsModalNovoAnoOpen(false);
    showToast(`Ano de planejamento ${anoNum} criado com sucesso! (${datasGeradas.length} sábados)`);
  };

  // Adição manual de uma nova data no calendário do ano ativo
  const handleAdicionarDataManual = (e) => {
    e.preventDefault();
    if (!inputDataNova) return;

    // inputDataNova vem no formato 'YYYY-MM-DD' de um <input type="date">
    const [yStr, mStr, dStr] = inputDataNova.split('-');
    const mIdx = parseInt(mStr, 10) - 1;
    const diaNum = parseInt(dStr, 10);
    const dataKey = `${diaNum}-${MONTH_NAMES[mIdx]}`;

    if (datasDoAno.includes(dataKey)) {
      showToast(`A data ${dataKey} já faz parte do calendário de ${anoAtivo}.`);
      return;
    }

    const atualizadas = [...datasDoAno, dataKey];
    salvarDatasDoAno(atualizadas);

    if (inputTipoDataNova !== 'normal') {
      const updatedStatus = { ...statusDatas, [dataKey]: { tipo: inputTipoDataNova, motivo: inputMotivoDataNova } };
      setStatusDatas(updatedStatus);
      localStorage.setItem(`gem_datas_status_${anoAtivo}`, JSON.stringify(updatedStatus));
    }

    setIsModalNovaDataOpen(false);
    setInputDataNova('');
    setInputTipoDataNova('normal');
    setInputMotivoDataNova('');
    showToast(`Data ${dataKey} adicionada com sucesso ao calendário de ${anoAtivo}!`);
  };

  // Remoção de data do calendário do ano ativo
  const handleRemoverData = (dataKey) => {
    if (!window.confirm(`Deseja realmente remover a data ${dataKey} do calendário de ${anoAtivo}?`)) {
      return;
    }
    const filtradas = datasDoAno.filter(d => d !== dataKey);
    salvarDatasDoAno(filtradas);

    const updatedStatus = { ...statusDatas };
    delete updatedStatus[dataKey];
    setStatusDatas(updatedStatus);
    localStorage.setItem(`gem_datas_status_${anoAtivo}`, JSON.stringify(updatedStatus));

    setDataConfigurando(null);
    showToast(`Data ${dataKey} removida do calendário de ${anoAtivo}.`);
  };

  const salvarStatusData = (dataKey, tipo, motivo = '') => {
    const updated = { ...statusDatas };
    if (tipo === 'normal') {
      delete updated[dataKey];
    } else {
      updated[dataKey] = { tipo, motivo };
    }
    setStatusDatas(updated);
    localStorage.setItem(`gem_datas_status_${anoAtivo}`, JSON.stringify(updated));
    sincronizarChamadaServidor({ statusDatas: updated });
    setDataConfigurando(null);
    showToast(`Status de ${dataKey} atualizado para ${tipo === 'feriado' ? 'Feriado' : tipo === 'ensaio_tecnico' ? 'Ensaio Técnico' : 'Aula Normal'}`);
  };

  // Alterna o status da célula: vazio -> 'c' (presente) -> 'x' (falta) -> vazio
  const togglePresenca = (alunoId, dataKey) => {
    const statusDia = statusDatas[dataKey]?.tipo;
    if (statusDia === 'feriado') {
      showToast(`${dataKey} está configurado como Feriado (Sem Aula GEM)`);
      return;
    }

    const updated = alunos.map(aluno => {
      if (aluno.id === alunoId) {
        const presAtual = aluno.presencas?.[dataKey];
        let novoStatus = undefined;
        if (!presAtual) novoStatus = 'c';
        else if (presAtual === 'c') novoStatus = 'x';
        else novoStatus = undefined;

        const novasPres = { ...(aluno.presencas || {}) };
        if (novoStatus) {
          novasPres[dataKey] = novoStatus;
        } else {
          delete novasPres[dataKey];
        }
        return { ...aluno, presencas: novasPres };
      }
      return aluno;
    });
    salvarStorageAlunos(updated);
  };

  // Filtrar datas pelo mês se selecionado
  const datasExibidas = useMemo(() => {
    if (selectedMes === 'Todos') return datasDoAno;
    return datasDoAno.filter(d => d.includes(selectedMes));
  }, [selectedMes, datasDoAno]);

  // Identificar a data mais próxima da semana atual
  const dataSemanaAtual = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let closest = null;
    let minDiff = Infinity;

    datasDoAno.forEach(d => {
      const [dia, mesStr] = d.split('-');
      const mes = MONTH_MAP[mesStr];
      if (mes === undefined) return;
      const dt = new Date(anoAtivo, mes, parseInt(dia, 10));
      const diff = Math.abs(dt.getTime() - hoje.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = d;
      }
    });

    return closest || datasDoAno[0];
  }, [datasDoAno, anoAtivo]);

  // Função para rolar até a semana atual
  const scrollToCurrentWeek = (smooth = true) => {
    if (currentDateRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const target = currentDateRef.current;
      // 480px é a largura total somada das 4 colunas fixas (180+120+50+130)
      const targetOffset = target.offsetLeft - 480;
      container.scrollTo({
        left: Math.max(0, targetOffset),
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Iniciar sempre na semana atual ao carregar ou mudar ano/filtro
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCurrentWeek(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [anoAtivo, selectedMes]);

  // Lista única de comuns e instrumentos para os filtros
  const comunsUnicas = useMemo(() => {
    return ['Todas', ...new Set(alunos.map(a => a.comum).filter(Boolean))];
  }, [alunos]);

  const instrumentosUnicos = useMemo(() => {
    return ['Todos', ...new Set(alunos.map(a => a.instrumento).filter(Boolean))];
  }, [alunos]);

  // Alunos filtrados em ordem alfabética
  const alunosFiltrados = useMemo(() => {
    return ordenarPorNome(
      alunos.filter(a => {
        const matchBusca = (a.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
          (a.instrumento || '').toLowerCase().includes(busca.toLowerCase());
        const matchComum = filtroComum === 'Todas' || a.comum === filtroComum;
        const matchInst = filtroInstrumento === 'Todos' || a.instrumento === filtroInstrumento;
        return matchBusca && matchComum && matchInst;
      })
    );
  }, [alunos, busca, filtroComum, filtroInstrumento]);

  // Totais por data e contagem de aulas válidas
  const totaisPorData = useMemo(() => {
    const res = {};
    datasDoAno.forEach(dt => {
      let presentes = 0;
      alunos.forEach(a => {
        if (a.presencas?.[dt] === 'c') presentes++;
      });
      res[dt] = presentes;
    });
    return res;
  }, [alunos, datasDoAno]);

  // Estatísticas gerais
  const aulasFeriadoCount = Object.keys(statusDatas).filter(d => statusDatas[d]?.tipo === 'feriado').length;
  const ensaiosTecnicosCount = Object.keys(statusDatas).filter(d => statusDatas[d]?.tipo === 'ensaio_tecnico').length;
  const aulasValidasNoAno = datasDoAno.length - aulasFeriadoCount;

  const aulasComPresenca = Object.entries(totaisPorData).filter(([dt, v]) => {
    const tipo = statusDatas[dt]?.tipo;
    return v > 0 && tipo !== 'feriado';
  }).length;

  const totalPresencasGeral = Object.entries(totaisPorData).reduce((acc, [dt, v]) => {
    const tipo = statusDatas[dt]?.tipo;
    return tipo === 'feriado' ? acc : acc + v;
  }, 0);

  const mediaAlunosPorAula = aulasComPresenca > 0 ? (totalPresencasGeral / aulasComPresenca).toFixed(1) : '0';

  const handleAddAluno = async (e) => {
    e.preventDefault();
    if (!novoAluno.nome.trim()) return;
    const novo = {
      id: Date.now(),
      nome: novoAluno.nome.trim().toUpperCase(),
      instrumento: novoAluno.instrumento,
      msa: novoAluno.msa || '',
      comum: (novoAluno.comum || 'VILA RUI BARBOSA').toUpperCase(),
      cargo: novoAluno.instrumento.toLowerCase().includes('órgão') ? 'ORGANISTA' : 'MÚSICO',
      nivel: 'CANDIDATO(A)',
      possuiInstrumento: 'SIM',
      instrumentoProprio: 'SIM',
      tonalidade: 'DÓ',
      dataInicioGem: new Date().toISOString().split('T')[0],
      presencas: {}
    };
    try {
      const res = await fetch('/api/gem/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.aluno?.id) novo.id = json.aluno.id;
      }
      if (onRefresh) onRefresh();
      window.dispatchEvent(new CustomEvent('gem-data-updated', { detail: novo }));
    } catch (err) {}
    salvarStorageAlunos([...alunos, novo]);
    setIsModalAddOpen(false);
    setNovoAluno({ nome: '', instrumento: 'Violino', msa: '', comum: 'Vila Rui Barbosa' });
    showToast('Aluno adicionado com sucesso!');
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Cabeçalho Exclusivo de Impressão */}
      <div className="print-only border-b-2 border-slate-900 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Congregação Cristã no Brasil • Vila Rui Barbosa — Jundiaí - SP
            </p>
            <h1 className="text-base font-black uppercase text-slate-900">
              Controle de Presença & Chamada GEM {anoAtivo}
            </h1>
          </div>
          <div className="text-right text-[10px] text-slate-600">
            <span className="block font-bold">
              Mês: {selectedMes === 'Todos' ? `Ano Completo (${anoAtivo})` : selectedMes} • {alunosFiltrados.length} alunos
            </span>
            <span>Emitido em: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Banner Superior com Anos Dinâmicos e Ações de Planejamento */}
      <div className={`text-white p-5 rounded-2xl shadow-xl border space-y-4 no-print transition-all duration-300 ${
        anoAtivo >= 2027 
          ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 border-indigo-700/50' 
          : 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-emerald-800/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                anoAtivo >= 2027
                  ? 'bg-indigo-600/40 border-indigo-400/40 text-indigo-200'
                  : 'bg-emerald-600/40 border-emerald-400/30 text-emerald-200'
              }`}>
                Planilha Oficial GEM • Vila Rui Barbosa
              </span>

              {/* Seletor Dinâmico de Anos + Botão Novo Ano */}
              <div className="inline-flex flex-wrap items-center bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
                {anosDisponiveis.map(ano => {
                  const isSel = anoAtivo === ano;
                  return (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => setAnoAtivo(ano)}
                      className={`text-xs font-black px-3 py-1 rounded-lg transition ${
                        isSel
                          ? (ano >= 2027 ? 'bg-indigo-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm')
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {ano} {ano === 2026 ? '(Oficial)' : '(Planejamento)'}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsModalNovoAnoOpen(true)}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg hover:bg-white/10 transition flex items-center gap-1"
                  title="Criar planejamento para outro ano (ex: 2028, 2029)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Ano</span>
                </button>
              </div>
            </div>

            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
              <Calendar className={`w-5 h-5 ${anoAtivo >= 2027 ? 'text-indigo-400' : 'text-emerald-400'}`} />
              Controle de Presença & Chamada GEM {anoAtivo}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              {anoAtivo >= 2027
                ? `Planejamento de ${anoAtivo}: defina feriados, ensaios técnicos, acrescente datas extras e acompanhe as ${datasDoAno.length} aulas cadastradas.`
                : `Registro contínuo de chamada dos ${alunos.length} alunos ao longo de todas as ${datasDoAno.length} aulas do ano letivo de 2026.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão Adicionar Mais Dias / Aulas */}
            <button
              onClick={() => {
                setInputDataNova(`${anoAtivo}-02-15`);
                setIsModalNovaDataOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition shadow-md"
              title="Acrescentar novas datas ou dias de aula ao planejamento deste ano"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>+ Acrescentar Dia</span>
            </button>

            <button
              onClick={() => scrollToCurrentWeek(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition shadow-sm"
              title="Centralizar rolagem na semana atual"
            >
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Semana Atual</span>
            </button>

            <button
              onClick={() => setIsModalAddOpen(true)}
              className={`flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md ${
                anoAtivo >= 2027 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aluno</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition"
              title="Imprimir lista de presença"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Resumo de Frequência e Indicadores */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-300 font-semibold block text-[11px]">Total de Alunos</span>
            <span className="text-xl font-black text-white">{alunos.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-300 font-semibold block text-[11px]">Aulas Letivas</span>
            <span className="text-xl font-black text-white">{aulasValidasNoAno} <span className="text-xs font-normal text-slate-300">({datasDoAno.length} datas)</span></span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-rose-300 font-semibold block text-[11px]">Feriados / Sem GEM</span>
            <span className="text-xl font-black text-rose-300">{aulasFeriadoCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-amber-300 font-semibold block text-[11px]">Ensaios Técnicos</span>
            <span className="text-xl font-black text-amber-300">{ensaiosTecnicosCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-sky-300 font-semibold block text-[11px]">Média Alunos/Aula</span>
            <span className="text-xl font-black text-sky-300">{mediaAlunosPorAula}</span>
          </div>
        </div>
      </div>

      {/* Controles de Filtros e Seleção de Mês */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Busca */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Filtro Comum */}
          <select
            value={filtroComum}
            onChange={e => setFiltroComum(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 outline-none"
          >
            {comunsUnicas.map(c => (
              <option key={c} value={c}>{c === 'Todas' ? 'Todas as Comuns' : c}</option>
            ))}
          </select>

          {/* Filtro Instrumento */}
          <select
            value={filtroInstrumento}
            onChange={e => setFiltroInstrumento(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 outline-none"
          >
            {instrumentosUnicos.map(i => (
              <option key={i} value={i}>{i === 'Todos' ? 'Todos os Instrumentos' : i}</option>
            ))}
          </select>
        </div>

        {/* Seletor Rápido de Mês */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Mês:</span>
          {['Todos', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMes(m)}
              className={`text-[11px] px-2 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                selectedMes === m
                  ? (anoAtivo >= 2027 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs')
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE CHAMADA COMPLETA (4 COLUNAS TRAVADAS: ALUNO, INSTRUMENTO, MSA, COMUM) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden card-print print-visible">
        {/* Barra de Legenda e Instruções */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-semibold print:p-1.5 print:text-[10px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center">c</span>
              <span>= PRESENTE</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-red-600 text-white font-black text-[9px] flex items-center justify-center">x</span>
              <span>= FALTA</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-rose-200 text-rose-800 font-black text-[9px] flex items-center justify-center">🏖️</span>
              <span>= FERIADO</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-amber-200 text-amber-800 font-black text-[9px] flex items-center justify-center">🎷</span>
              <span>= ENSAIO TÉCNICO</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 italic hidden sm:inline no-print">
              💡 Dica: Clique no cabeçalho da data para marcar Feriado, Ensaio Técnico ou Excluir data
            </span>
            <span className="text-slate-500 font-bold">
              Exibindo {alunosFiltrados.length} de {alunos.length} alunos ({datasExibidas.length} datas)
            </span>
          </div>
        </div>

        {/* Container com scroll horizontal apenas nas datas */}
        <div 
          ref={tableContainerRef}
          className="overflow-x-auto max-h-[620px] relative scroll-smooth print-visible"
        >
          <table className="w-full text-left text-xs border-separate border-spacing-0 print-compact-table">
            <thead className="sticky top-0 z-30 shadow-xs print-no-sticky">
              <tr className="bg-slate-800 text-white font-extrabold uppercase text-[10px] tracking-wider">
                
                {/* 1. COLUNA FIXA: ALUNO (0px) */}
                <th 
                  className="py-2 px-3 sticky left-0 z-40 bg-slate-800 w-[180px] min-w-[180px] max-w-[180px] border-b border-r border-slate-700 print-no-sticky"
                >
                  ALUNO
                </th>

                {/* 2. COLUNA FIXA: INSTRUMENTO (180px) */}
                <th 
                  className="py-2 px-2.5 sticky left-[180px] z-40 bg-slate-800 w-[120px] min-w-[120px] max-w-[120px] border-b border-r border-slate-700 print-no-sticky"
                >
                  INSTRUMENTO
                </th>

                {/* 3. COLUNA FIXA: MSA (300px) */}
                <th 
                  className="py-2 px-1 text-center sticky left-[300px] z-40 bg-slate-800 w-[50px] min-w-[50px] max-w-[50px] border-b border-r border-slate-700 print-no-sticky"
                >
                  MSA
                </th>

                {/* 4. COLUNA FIXA: COMUM (350px) COM SOMBRA DIVISORA */}
                <th 
                  className="py-2 px-2.5 sticky left-[350px] z-40 bg-slate-800 w-[130px] min-w-[130px] max-w-[130px] border-b border-r-2 border-slate-500 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.35)] print-no-sticky"
                >
                  COMUM
                </th>

                {/* COLUNAS DE DATAS (ROLÁVEIS) */}
                {datasExibidas.map(d => {
                  const statusObj = statusDatas[d];
                  const tipo = statusObj?.tipo;
                  const isCurrent = d === dataSemanaAtual;

                  let headerBg = isCurrent ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white';
                  if (tipo === 'feriado') headerBg = 'bg-rose-900 text-rose-100';
                  if (tipo === 'ensaio_tecnico') headerBg = 'bg-amber-800 text-amber-100';

                  return (
                    <th
                      key={d}
                      ref={isCurrent ? currentDateRef : null}
                      onClick={() => setDataConfigurando({ data: d, tipo: tipo || 'normal', motivo: statusObj?.motivo || '' })}
                      className={`py-1.5 px-1 text-center min-w-[46px] w-[46px] max-w-[46px] border-b border-r border-slate-700 cursor-pointer select-none transition group hover:brightness-110 ${headerBg} ${
                        isCurrent ? 'ring-2 ring-emerald-400/80 ring-inset font-black' : ''
                      }`}
                      title={`${d} (${anoAtivo}): ${tipo === 'feriado' ? 'FERIADO' : tipo === 'ensaio_tecnico' ? 'ENSAIO TÉCNICO' : 'Aula Normal'} - Clique para alterar status ou remover`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-mono text-[9px] leading-tight block font-bold">
                          {d}
                        </span>
                        
                        {/* Badges de Feriado, Ensaio Técnico ou Semana Atual */}
                        {tipo === 'feriado' ? (
                          <span className="text-[7.5px] bg-rose-500/50 text-white px-1 rounded uppercase font-black tracking-tight mt-0.5">
                            FERIADO
                          </span>
                        ) : tipo === 'ensaio_tecnico' ? (
                          <span className="text-[7.5px] bg-amber-400 text-slate-900 px-1 rounded uppercase font-black tracking-tight mt-0.5">
                            ENSAIO
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[7px] bg-emerald-400 text-slate-950 px-1 rounded uppercase font-black tracking-tight mt-0.5 animate-pulse">
                            ATUAL
                          </span>
                        ) : (
                          <span className="text-[7px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                            GEM
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* COLUNAS DE RESUMO DO ALUNO */}
                <th className="py-2 px-2 text-center bg-slate-900 border-b border-l border-slate-700 w-12 min-w-[48px]">PRES.</th>
                <th className="py-2 px-2 text-center bg-slate-900 border-b border-r border-slate-700 w-12 min-w-[48px]">FALTA</th>
                <th className="py-2 px-2 text-center bg-slate-900 border-b w-14 min-w-[56px]">% FREQ.</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800">
              {alunosFiltrados.map((aluno, idx) => {
                // Cálculo de presenças do aluno (ignora feriados)
                let presTotal = 0;
                let faltaTotal = 0;
                datasDoAno.forEach(dt => {
                  const tipo = statusDatas[dt]?.tipo;
                  if (tipo === 'feriado') return;

                  if (aluno.presencas?.[dt] === 'c') presTotal++;
                  if (aluno.presencas?.[dt] === 'x') faltaTotal++;
                });
                const totalAulasMarcadas = presTotal + faltaTotal;
                const pctFreq = totalAulasMarcadas > 0 ? Math.round((presTotal / totalAulasMarcadas) * 100) : 0;

                const rowBg = idx % 2 === 1 ? 'bg-slate-50' : 'bg-white';

                return (
                  <tr
                    key={aluno.id}
                    className={`group hover:bg-emerald-50/40 transition`}
                  >
                    {/* 1. COLUNA FIXA: ALUNO (0px) */}
                    <td 
                      className={`py-1.5 px-3 sticky left-0 z-20 ${rowBg} group-hover:bg-emerald-50 font-bold text-slate-900 border-r border-b border-slate-200 w-[180px] min-w-[180px] max-w-[180px] truncate print-no-sticky`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span 
                          onClick={() => setAlunoFicha(aluno)}
                          className="hover:text-emerald-700 hover:underline cursor-pointer transition truncate block"
                          title={`Ver Ficha Cadastral de ${aluno.nome}`}
                        >
                          {aluno.nome}
                        </span>
                        <button
                          onClick={() => setAlunoLancamento(aluno)}
                          className="text-[9px] font-black bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 hover:bg-emerald-600 hover:text-white transition shadow-2xs shrink-0 no-print"
                          title="Lançar Atividade / Avaliação"
                        >
                          + Ativ.
                        </button>
                      </div>
                    </td>

                    {/* 2. COLUNA FIXA: INSTRUMENTO (180px) */}
                    <td 
                      className={`py-1.5 px-2.5 sticky left-[180px] z-20 ${rowBg} group-hover:bg-emerald-50 font-semibold text-emerald-800 border-r border-b border-slate-200 w-[120px] min-w-[120px] max-w-[120px] truncate print-no-sticky`}
                    >
                      {aluno.instrumento}
                    </td>

                    {/* 3. COLUNA FIXA: MSA (300px) */}
                    <td 
                      className={`py-1.5 px-1 sticky left-[300px] z-20 ${rowBg} group-hover:bg-emerald-50 text-center font-bold text-slate-500 border-r border-b border-slate-200 text-[10px] w-[50px] min-w-[50px] max-w-[50px] print-no-sticky`}
                    >
                      {aluno.msa || '-'}
                    </td>

                    {/* 4. COLUNA FIXA: COMUM (350px) COM SOMBRA DIVISORA */}
                    <td 
                      className={`py-1.5 px-2.5 sticky left-[350px] z-20 ${rowBg} group-hover:bg-emerald-50 text-slate-600 border-r-2 border-b border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] w-[130px] min-w-[130px] max-w-[130px] truncate text-[11px] print-no-sticky`}
                    >
                      {aluno.comum}
                    </td>

                    {/* CÉLULAS DE DATAS (ROLÁVEIS) */}
                    {datasExibidas.map(dt => {
                      const status = aluno.presencas?.[dt];
                      const tipo = statusDatas[dt]?.tipo;
                      const motivo = statusDatas[dt]?.motivo;
                      const isCurrent = dt === dataSemanaAtual;

                      if (tipo === 'feriado') {
                        return (
                          <td
                            key={dt}
                            onClick={() => showToast(`${dt} é Feriado: ${motivo || 'Sem aula de GEM'}`)}
                            className="py-1 px-0.5 text-center font-mono text-[11px] border-r border-b border-slate-200 bg-rose-50/60 text-rose-300 cursor-not-allowed select-none"
                            title={`Feriado / Sem Aula (${motivo || 'Sem GEM'})`}
                          >
                            —
                          </td>
                        );
                      }

                      const isEnsaio = tipo === 'ensaio_tecnico';

                      return (
                        <td
                          key={dt}
                          onClick={() => togglePresenca(aluno.id, dt)}
                          className={`py-1 px-0.5 text-center font-mono font-black text-xs border-r border-b border-slate-200/80 cursor-pointer select-none transition ${
                            status === 'c'
                              ? isEnsaio 
                                ? 'bg-amber-200 text-amber-900 font-extrabold hover:bg-amber-300'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : status === 'x'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : isEnsaio
                              ? 'bg-amber-50/40 hover:bg-amber-100 text-amber-400'
                              : isCurrent
                              ? 'bg-emerald-50/30 hover:bg-emerald-100/50 text-slate-300'
                              : 'hover:bg-slate-100 text-slate-300'
                          }`}
                          title={`${aluno.nome} em ${dt} ${isEnsaio ? '(Ensaio Técnico)' : ''}: clique para alternar`}
                        >
                          {status || '·'}
                        </td>
                      );
                    })}

                    {/* TOTAIS DO ALUNO */}
                    <td className="py-1 px-2 text-center font-black text-emerald-700 bg-slate-50 border-l border-b border-slate-300">
                      {presTotal}
                    </td>
                    <td className="py-1 px-2 text-center font-black text-red-700 bg-slate-50 border-r border-b border-slate-300">
                      {faltaTotal}
                    </td>
                    <td className="py-1 px-2 text-center font-black text-slate-800 bg-slate-50 border-b border-slate-300">
                      {totalAulasMarcadas > 0 ? `${pctFreq}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* RODAPÉ COM TOTAIS POR AULA (COLUNAS TRAVADAS ATÉ COMUM) */}
            <tfoot className="sticky bottom-0 z-30 bg-slate-200 text-slate-900 font-black border-t-2 border-slate-400 text-xs print-no-sticky">
              <tr>
                {/* 1. TOTAL ALUNO (0px) */}
                <td className="py-2 px-3 sticky left-0 z-40 bg-slate-200 border-r border-slate-300 w-[180px] min-w-[180px] max-w-[180px] print-no-sticky">
                  TOTAL PRESENTES
                </td>

                {/* 2. TOTAL INSTRUMENTO (180px) */}
                <td className="py-2 px-2 sticky left-[180px] z-40 bg-slate-200 border-r border-slate-300 w-[120px] min-w-[120px] max-w-[120px] text-[10px] text-slate-600 font-normal truncate print-no-sticky">
                  Por aula realizada
                </td>

                {/* 3. TOTAL MSA (300px) */}
                <td className="py-2 px-1 sticky left-[300px] z-40 bg-slate-200 border-r border-slate-300 w-[50px] min-w-[50px] max-w-[50px] print-no-sticky">
                  -
                </td>

                {/* 4. TOTAL COMUM (350px) COM SOMBRA DIVISORA */}
                <td className="py-2 px-2.5 sticky left-[350px] z-40 bg-slate-200 border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.18)] w-[130px] min-w-[130px] max-w-[130px] text-[10px] text-slate-600 font-normal print-no-sticky">
                  Soma de chamada
                </td>

                {/* DATAS TOTAIS */}
                {datasExibidas.map(dt => {
                  const tipo = statusDatas[dt]?.tipo;
                  if (tipo === 'feriado') {
                    return (
                      <td
                        key={dt}
                        className="py-1.5 px-0.5 text-center font-mono text-[9px] border-r border-slate-300 bg-rose-100 text-rose-700"
                        title="Feriado (Sem Aula)"
                      >
                        FER.
                      </td>
                    );
                  }

                  const tot = totaisPorData[dt] || 0;
                  const isEnsaio = tipo === 'ensaio_tecnico';

                  return (
                    <td
                      key={dt}
                      className={`py-1.5 px-0.5 text-center font-mono text-[10px] border-r border-slate-300 ${
                        tot > 0 
                          ? isEnsaio 
                            ? 'bg-amber-200 font-black text-amber-950' 
                            : 'bg-emerald-200/80 font-black text-emerald-950' 
                          : 'text-slate-400'
                      }`}
                    >
                      {tot}
                    </td>
                  );
                })}

                <td colSpan="3" className="py-2 px-2 text-center bg-slate-300 text-slate-900 border-l border-slate-400">
                  Média: {mediaAlunosPorAula} alunos
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL CONFIGURAR STATUS DO DIA OU REMOVER DATA */}
      {dataConfigurando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Planejamento e Calendário GEM {anoAtivo}
                </span>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Configurar Data: {dataConfigurando.data}
                </h3>
              </div>
              <button 
                onClick={() => setDataConfigurando(null)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Defina se este dia será uma aula regular de GEM, um feriado (sem aula) ou um ensaio técnico:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Opção 1: Aula Normal */}
              <button
                type="button"
                onClick={() => setDataConfigurando({ ...dataConfigurando, tipo: 'normal' })}
                className={`p-3 rounded-xl border-2 text-left transition flex items-start gap-3 ${
                  dataConfigurando.tipo === 'normal'
                    ? 'border-emerald-600 bg-emerald-50/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">🟢</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Aula GEM Normal</h4>
                  <p className="text-[11px] text-slate-500">
                    Atividades regulares de teoria, MSA e instrumento com chamada contínua.
                  </p>
                </div>
              </button>

              {/* Opção 2: Ensaio Técnico */}
              <button
                type="button"
                onClick={() => setDataConfigurando({ ...dataConfigurando, tipo: 'ensaio_tecnico' })}
                className={`p-3 rounded-xl border-2 text-left transition flex items-start gap-3 ${
                  dataConfigurando.tipo === 'ensaio_tecnico'
                    ? 'border-amber-500 bg-amber-50/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">🎷</span>
                <div>
                  <h4 className="font-bold text-xs text-amber-900">Ensaio Técnico</h4>
                  <p className="text-[11px] text-slate-500">
                    Dia especial dedicado ao Ensaio Técnico com a orquestra. A coluna é destacada em amarelo.
                  </p>
                </div>
              </button>

              {/* Opção 3: Feriado / Sem Aula */}
              <button
                type="button"
                onClick={() => setDataConfigurando({ ...dataConfigurando, tipo: 'feriado' })}
                className={`p-3 rounded-xl border-2 text-left transition flex items-start gap-3 ${
                  dataConfigurando.tipo === 'feriado'
                    ? 'border-rose-500 bg-rose-50/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">🏖️</span>
                <div>
                  <h4 className="font-bold text-xs text-rose-900">Feriado / Sem GEM</h4>
                  <p className="text-[11px] text-slate-500">
                    Recesso ou feriado. A coluna é bloqueada e não penaliza a frequência dos alunos.
                  </p>
                </div>
              </button>
            </div>

            {/* Campo Opcional de Motivo */}
            {dataConfigurando.tipo !== 'normal' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Observação (Opcional):
                </label>
                <input
                  type="text"
                  value={dataConfigurando.motivo || ''}
                  onChange={e => setDataConfigurando({ ...dataConfigurando, motivo: e.target.value })}
                  placeholder={dataConfigurando.tipo === 'feriado' ? 'Ex: Carnaval, Sábado Santo, Feriado' : 'Ex: Ensaio Técnico Regional'}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => handleRemoverData(dataConfigurando.data)}
                className="py-2 px-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition text-xs flex items-center gap-1"
                title="Remover esta data do calendário"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Data</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDataConfigurando(null)}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => salvarStatusData(dataConfigurando.data, dataConfigurando.tipo, dataConfigurando.motivo)}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs text-xs"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR NOVA DATA / DIA LIVRE */}
      {isModalNovaDataOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-amber-600" />
                Acrescentar Data ao Ano {anoAtivo}
              </h3>
              <button onClick={() => setIsModalNovaDataOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdicionarDataManual} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Escolha a Data (Dia / Mês)</label>
                <input
                  type="date"
                  required
                  value={inputDataNova}
                  onChange={e => setInputDataNova(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 font-mono text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Pode ser sábado, domingo ou qualquer dia especial de ensaio/aula.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo da Atividade</label>
                <select
                  value={inputTipoDataNova}
                  onChange={e => setInputTipoDataNova(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-800"
                >
                  <option value="normal">🟢 Aula GEM Normal</option>
                  <option value="ensaio_tecnico">🟡 Ensaio Técnico</option>
                  <option value="feriado">🔴 Feriado / Sem Aula</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Descrição (Opcional)</label>
                <input
                  type="text"
                  value={inputMotivoDataNova}
                  onChange={e => setInputMotivoDataNova(e.target.value)}
                  placeholder="Ex: Ensaio Regional, Aula Extra..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalNovaDataOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition shadow-xs"
                >
                  Adicionar Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR NOVO ANO DE PLANEJAMENTO */}
      {isModalNovoAnoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Criar Novo Ano de Planejamento
              </h3>
              <button onClick={() => setIsModalNovoAnoOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarNovoAno} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Qual ano deseja planejar?</label>
                <input
                  type="number"
                  min="2025"
                  max="2040"
                  required
                  value={inputNovoAno}
                  onChange={e => setInputNovoAno(e.target.value)}
                  placeholder="Ex: 2028"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-base text-slate-900"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gerarDatasAuto}
                    onChange={e => setGerarDatasAuto(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-800">
                    Gerar automaticamente todos os sábados letivos
                  </span>
                </label>
                <p className="text-[10px] text-slate-500 pl-6">
                  Calcula todos os sábados letivos do ano (Fevereiro a Dezembro) conforme padrão do GEM da CCB.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalNovoAnoOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  Criar Planejamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO ALUNO */}
      {isModalAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Adicionar Aluno GEM {anoAtivo}
              </h3>
              <button onClick={() => setIsModalAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAluno} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoAluno.nome}
                  onChange={e => setNovoAluno({ ...novoAluno, nome: e.target.value })}
                  placeholder="Nome do aluno"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instrumento</label>
                <input
                  type="text"
                  required
                  value={novoAluno.instrumento}
                  onChange={e => setNovoAluno({ ...novoAluno, instrumento: e.target.value })}
                  placeholder="Ex: Violino, Flauta, Trompete..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fase MSA</label>
                  <input
                    type="text"
                    value={novoAluno.msa}
                    onChange={e => setNovoAluno({ ...novoAluno, msa: e.target.value })}
                    placeholder="Ex: 1, 2, INF 1..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Comum</label>
                  <input
                    type="text"
                    value={novoAluno.comum}
                    onChange={e => setNovoAluno({ ...novoAluno, comum: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalAddOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FICHA CADASTRAL DO ALUNO */}
      <AlunoGemModal
        isOpen={Boolean(alunoFicha)}
        onClose={() => setAlunoFicha(null)}
        onSave={(alunoData) => {
          const updated = alunos.map(a => a.id === alunoData.id ? { ...a, ...alunoData } : a);
          salvarStorageAlunos(updated);
          setAlunoFicha(null);
          if (onRefresh) onRefresh();
          showToast('Ficha cadastral atualizada e sincronizada com sucesso!');
        }}
        aluno={alunoFicha}
      />

      {/* MODAL LANÇAMENTO DE HISTÓRICO / AULAS */}
      {alunoLancamento && (
        <LancamentoHistoricoModal
          isOpen={Boolean(alunoLancamento)}
          onClose={() => setAlunoLancamento(null)}
          onSave={async (itemData) => {
            try {
              await fetch('/api/gem/historico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
              });
            } catch (e) {
              const saved = localStorage.getItem(`gem_historico_${itemData.alunoId}`);
              const list = saved ? JSON.parse(saved) : [];
              localStorage.setItem(`gem_historico_${itemData.alunoId}`, JSON.stringify([itemData, ...list]));
            }
            showToast(`Lançamento (${itemData.tipo}) salvo com sucesso!`);
            setAlunoLancamento(null);
          }}
          aluno={alunoLancamento}
        />
      )}
    </div>
  );
}
