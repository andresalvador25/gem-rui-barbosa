import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Calendar,
  Award,
  Printer,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import HistoricoAlunoView from './HistoricoAlunoView.jsx';
import { ALUNOS_PRESENCA_2026, DATAS_AULAS_2026 } from '../constants/gemInitialData.js';
import { getUserAlunoIds } from '../utils/auth.js';

export default function PortalCandidatoView({ user, alunosGem = [] }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chamadaServer, setChamadaServer] = useState(null);
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);

  const normalize = (s) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

  // Encontra TODOS os alunos vinculados ao usuário (1 ou mais candidatos p/ pai/responsável)
  const alunosVinculados = useMemo(() => {
    if (!alunosGem || alunosGem.length === 0) return [];
    const ids = getUserAlunoIds(user);
    const list = [];

    ids.forEach(id => {
      const found = alunosGem.find(a => String(a.id) === String(id));
      if (found && !list.some(x => String(x.id) === String(found.id))) {
        list.push(found);
      }
    });

    if (list.length === 0) {
      const nomeNorm = normalize(user?.nome || '')
        .replace(/\s*\(EXEMPLO\)\s*/g, '')
        .replace(/\s*\(CANDIDATO.*?\)\s*/g, '')
        .trim();
      if (nomeNorm) {
        const byName = alunosGem.find(a => normalize(a.nome) === nomeNorm);
        if (byName) list.push(byName);
      }
    }
    return list;
  }, [alunosGem, user]);

  useEffect(() => {
    if (alunosVinculados.length > 0) {
      const stillValid = alunosVinculados.some(a => String(a.id) === String(selectedAlunoId));
      if (!stillValid) {
        setSelectedAlunoId(alunosVinculados[0].id);
      }
    } else {
      setSelectedAlunoId(null);
    }
  }, [alunosVinculados, selectedAlunoId]);

  const aluno = useMemo(() => {
    if (alunosVinculados.length === 0) return null;
    return (
      alunosVinculados.find(a => String(a.id) === String(selectedAlunoId)) || alunosVinculados[0]
    );
  }, [alunosVinculados, selectedAlunoId]);

  // Carrega chamada oficial do servidor
  useEffect(() => {
    fetch('/api/gem/chamada')
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (json?.chamada) setChamadaServer(json.chamada);
      })
      .catch(() => {});
  }, []);

  // Carrega histórico do aluno selecionado
  useEffect(() => {
    if (!aluno?.id) return;
    setLoading(true);
    fetch(`/api/gem/historico/${aluno.id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (json?.historico) {
          setHistorico(json.historico);
        } else {
          const saved = localStorage.getItem(`gem_historico_${aluno.id}`);
          setHistorico(saved ? JSON.parse(saved) : []);
        }
      })
      .catch(() => {
        const saved = localStorage.getItem(`gem_historico_${aluno.id}`);
        setHistorico(saved ? JSON.parse(saved) : []);
      })
      .finally(() => setLoading(false));
  }, [aluno?.id]);

  // Resumo de presença 2026 do aluno selecionado (prioriza servidor -> localStorage -> inicial)
  const resumoPresenca = useMemo(() => {
    if (!aluno) return { presentes: 0, faltas: 0, pct: 0, datasPresentes: [], datasFaltas: [] };

    let presMap = null;
    const datasAno = chamadaServer?.datasPorAno?.[2026] || DATAS_AULAS_2026;

    // 1. Tenta do servidor (/api/gem/chamada)
    if (chamadaServer?.presencasPorAno?.[2026]?.[aluno.id]?.presencas) {
      presMap = chamadaServer.presencasPorAno[2026][aluno.id].presencas;
    }

    // 2. Fallback para dados locais/iniciais
    if (!presMap || Object.keys(presMap).length === 0) {
      let listaPres = ALUNOS_PRESENCA_2026;
      try {
        const saved = localStorage.getItem('gem_presenca_2026_alunos');
        if (saved) listaPres = JSON.parse(saved);
      } catch {}
      const alvo = normalize(aluno.nome);
      const match = listaPres.find(p => String(p.id) === String(aluno.id) || normalize(p.nome) === alvo);
      if (match?.presencas) presMap = match.presencas;
    }

    if (!presMap) return { presentes: 0, faltas: 0, pct: 0, datasPresentes: [], datasFaltas: [] };

    let presentes = 0;
    let faltas = 0;
    const datasPresentes = [];
    const datasFaltas = [];

    datasAno.forEach(dt => {
      if (presMap[dt] === 'c') {
        presentes++;
        datasPresentes.push(dt);
      }
      if (presMap[dt] === 'x') {
        faltas++;
        datasFaltas.push(dt);
      }
    });

    const totalMarcadas = presentes + faltas;
    const pct = totalMarcadas > 0 ? Math.round((presentes / totalMarcadas) * 100) : 0;
    return { presentes, faltas, pct, datasPresentes, datasFaltas };
  }, [aluno, chamadaServer]);

  if (!aluno) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center space-y-3 shadow-sm">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-black text-slate-900">Cadastro Ainda Não Vinculado a um Candidato</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Olá, <strong>{user?.nome}</strong>! Seu acesso está ativo, mas o <strong>Administrador (ADM)</strong> ainda não selecionou qual(is) candidato(s) do GEM você irá acompanhar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Seletor de Candidatos Vinculados (quando o Pai/Responsável acompanha mais de 1 candidato!) */}
      {alunosVinculados.length > 1 && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 block">
                Acesso do Responsável ({alunosVinculados.length} Candidatos Vinculados)
              </span>
              <p className="text-xs font-bold text-slate-700">
                Selecione abaixo qual candidato deseja consultar:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {alunosVinculados.map(al => {
              const ativo = String(al.id) === String(aluno.id);
              return (
                <button
                  key={al.id}
                  type="button"
                  onClick={() => setSelectedAlunoId(al.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
                    ativo
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{al.cargo === 'ORGANISTA' ? '🎹' : '🎵'}</span>
                  <span>{al.nome}</span>
                  <span className={`text-[10px] font-semibold ${ativo ? 'text-emerald-100' : 'text-slate-400'}`}>
                    ({al.instrumento})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Banner Portal do Candidato (oculto na impressão) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
            <GraduationCap className="w-3 h-3" />
            Portal do Candidato & Responsável — GEM
          </span>
          <h2 className="text-xl font-black tracking-tight">{aluno.nome}</h2>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Acompanhamento de ficha cadastral, frequência nas aulas e histórico de lições, métodos e avaliações.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 transition self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Ficha</span>
        </button>
      </div>

      {/* Cabeçalho Exclusivo de Impressão */}
      <div className="print-only border-b-2 border-slate-900 pb-3 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Congregação Cristã no Brasil • Vila Rui Barbosa — Jundiaí - SP
            </p>
            <h1 className="text-base font-black uppercase text-slate-900">
              Ficha Individual e Histórico de Estudos — GEM
            </h1>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <span className="block font-bold text-slate-700">Emitido em:</span>
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Ficha Cadastral do Aluno */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-print print-avoid-break">
        <div className="bg-[#d9edf7] text-[#31708f] px-5 py-3 border-b border-[#bce8f1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center font-black text-[#31708f]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                {aluno.nome}
              </h3>
              <span className="text-[11px] font-bold text-[#31708f]">
                {aluno.instrumento} • {aluno.comum}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-black uppercase bg-white/80 text-[#31708f] px-2.5 py-1 rounded-full border border-[#bce8f1]">
            Somente Consulta
          </span>
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 print-grid-3 gap-3.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Categoria / Cargo</span>
            <span className="font-extrabold text-slate-800">{aluno.cargo || aluno.ministerio || 'MÚSICO'}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Nível Atual</span>
            <span className="font-extrabold text-blue-700">{aluno.nivel || 'CANDIDATO(A)'}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Tonalidade</span>
            <span className="font-extrabold text-slate-800">{aluno.tonalidade || 'DÓ'}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Presenças 2026</span>
            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {resumoPresenca.presentes} presença(s) ({resumoPresenca.pct}%)
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Faltas 2026</span>
            <span className="font-extrabold text-red-600 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {resumoPresenca.faltas} falta(s)
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Data Início GEM</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {aluno.dataInicioGem ? aluno.dataInicioGem.split('-').reverse().join('/') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Histórico em modo somente leitura */}
      <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-3 print:bg-white card-print">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            Histórico de Aulas, Lições e Avaliações ({aluno.nome})
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {loading ? 'Carregando...' : `${historico.length} ${historico.length === 1 ? 'registro' : 'registros'}`}
          </span>
        </div>

        <HistoricoAlunoView historico={historico} readOnly={true} />
      </div>
    </div>
  );
}
