import { detectarNaipe } from '../constants/instruments.js';

export const NIVEIS_MUSICAL = [
  'CANDIDATO(A)',
  'CULTO OFICIAL',
  'ENSAIO',
  'MEIA HORA',
  'OFICIALIZADO',
  'RJM',
  'RJM / CULTOS OFICIAIS',
  'RJM / ENSAIOS',
  'RJM / MEIA HORA',
  'RJM / OFICIALIZADO'
];

export function normalizePersonName(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(DE|DA|DO|DOS|DAS|E)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase()
    .trim();
}

export function isSamePerson(a, b) {
  if (!a || !b) return false;
  if (a.gemId && b.id && String(a.gemId) === String(b.id)) return true;
  if (b.gemId && a.id && String(b.gemId) === String(a.id)) return true;
  if (a.integranteId && b.id && String(a.integranteId) === String(b.id)) return true;
  if (b.integranteId && a.id && String(b.integranteId) === String(a.id)) return true;

  const normA = normalizePersonName(a.nome);
  const normB = normalizePersonName(b.nome);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const wordsA = normA.split(' ').filter(w => w.length > 1);
  const wordsB = normB.split(' ').filter(w => w.length > 1);

  // Nomes de uma única palavra só dão match se forem exatamente iguais (evita 'MIGUEL' dar match em 'JÚLIA MIGUEL FERREIRA')
  if (wordsA.length === 1 || wordsB.length === 1) {
    return normA === normB;
  }

  // Se o primeiro e o último nome forem iguais e tiverem pelo menos 2 palavras
  if (wordsA[0] === wordsB[0] && wordsA[wordsA.length - 1] === wordsB[wordsB.length - 1]) {
    return true;
  }

  // Se um contiver todas as palavras do outro (mínimo 2 palavras, começando pelo mesmo primeiro nome)
  if (wordsA[0] === wordsB[0]) {
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const allAInB = wordsA.every(w => setB.has(w));
    const allBInA = wordsB.every(w => setA.has(w));
    if (allAInB || allBInA) return true;
  }

  return false;
}

export function flagsFromNivel(nivel, currentMeiaHora = false) {
  const n = String(nivel || '').toUpperCase().trim();
  if (n === 'CANDIDATO(A)' || n === 'CANDIDATO' || n === 'CANDIDATA') {
    return { ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false };
  }
  if (n === 'ENSAIO' || n === 'ENSAIOS') {
    return { ensaios: true, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false };
  }
  if (n === 'RJM' || n === 'REUNIÃO DE JOVENS' || n === 'RJM / ENSAIOS' || n === 'RJM/ENSAIOS') {
    return { ensaios: true, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: false };
  }
  if (n === 'MEIA HORA') {
    return { ensaios: true, rjm: false, meiaHora: true, cultosOficiais: false, oficializado: false };
  }
  if (n === 'RJM / MEIA HORA' || n === 'RJM/MEIA HORA') {
    return { ensaios: true, rjm: true, meiaHora: true, cultosOficiais: false, oficializado: false };
  }
  if (n === 'RJM / CULTOS OFICIAIS' || n === 'RJM/CULTOS OFICIAIS' || n === 'RJM / CULTO OFICIAL' || n === 'RJM/CULTO OFICIAL') {
    return { ensaios: true, rjm: true, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: false };
  }
  if (n === 'CULTO OFICIAL' || n === 'CULTOS OFICIAIS') {
    return { ensaios: true, rjm: false, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: false };
  }
  if (n === 'RJM OFICIALIZADO' || n === 'RJM / OFICIALIZADO' || n === 'RJM/OFICIALIZADO') {
    return { ensaios: true, rjm: true, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: true };
  }
  if (n === 'OFICIALIZADO' || n === 'OFICIALIZADA') {
    return { ensaios: true, rjm: false, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: true };
  }
  return { ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false };
}

export function nivelFromFlags(item = {}) {
  const rawNivel = String(item.nivel || item.nivelGem || '').toUpperCase().trim();
  if (rawNivel === 'RJM OFICIALIZADO') return 'RJM / OFICIALIZADO';
  if (item.oficializado) {
    return item.rjm ? 'RJM / OFICIALIZADO' : 'OFICIALIZADO';
  }
  if (item.cultosOficiais) {
    return item.rjm ? 'RJM / CULTOS OFICIAIS' : 'CULTO OFICIAL';
  }
  if (item.meiaHora) {
    return item.rjm ? 'RJM / MEIA HORA' : 'MEIA HORA';
  }
  if (item.rjm) {
    if (rawNivel === 'RJM') return 'RJM';
    return 'RJM / ENSAIOS';
  }
  if (item.ensaios) {
    return 'ENSAIO';
  }
  if (NIVEIS_MUSICAL.includes(rawNivel)) {
    return rawNivel;
  }
  return 'CANDIDATO(A)';
}

const CANONICAL_INSTRUMENTS = {
  'VIOLINO': 'Violino',
  'VIOLA': 'Viola',
  'VIOLONCELO': 'Violoncelo',
  'FLAUTA': 'Flauta',
  'FLAUTA TRANSVERSAL': 'Flauta',
  'OBOÉ': 'Oboé',
  'OBOE': 'Oboé',
  "OBOÉ D'AMORE": "Oboé D'Amore",
  'CORNE INGLÊS': 'Corne Inglês',
  'CORNE INGLES': 'Corne Inglês',
  'FAGOTE': 'Fagote',
  'CLARINETE': 'Clarinete',
  'CLARINETE ALTO': 'Clarinete Alto',
  'CLARINETE BAIXO': 'Clarinete Baixo',
  'CLARONE': 'Clarinete Baixo',
  'SAXOFONE SOPRANO': 'Saxofone Soprano',
  'SAX SOPRANO': 'Saxofone Soprano',
  'SAXOFONE ALTO': 'Saxofone Alto',
  'SAX ALTO': 'Saxofone Alto',
  'SAXOFONE TENOR': 'Saxofone Tenor',
  'SAX TENOR': 'Saxofone Tenor',
  'SAXOFONE BARÍTONO': 'Saxofone Barítono',
  'SAX BARÍTONO': 'Saxofone Barítono',
  'TROMPETE': 'Trompete',
  'CORNET': 'Cornet',
  'FLUGELHORN': 'Flugelhorn',
  'TROMPA': 'Trompa',
  'TROMBONITO': 'Trombonito',
  'TROMBONE': 'Trombone',
  'EUFÔNIO': 'Eufônio',
  'EUFONIO': 'Eufônio',
  'BOMBARDINO': 'Eufônio',
  'BARÍTONO SIB': 'Barítono Sib',
  'BARITONO SIB': 'Barítono Sib',
  'BARÍTONO': 'Barítono Sib',
  'TUBA': 'Tuba',
  'ÓRGÃO ELETRÔNICO': 'Órgão Eletrônico',
  'ORGAO ELETRONICO': 'Órgão Eletrônico',
  'ÓRGÃO': 'Órgão Eletrônico'
};

export function formatInstrumentName(inst, categoria = 'Músico') {
  if (categoria === 'Organista' || String(categoria).toUpperCase() === 'ORGANISTA') {
    return 'Órgão Eletrônico';
  }
  const upper = String(inst || 'Violino').toUpperCase().trim();
  return CANONICAL_INSTRUMENTS[upper] || inst || 'Violino';
}

export function mergeIntegranteWithGem(intg, alunoGem) {
  if (!alunoGem) {
    return {
      ...intg,
      nivel: nivelFromFlags(intg)
    };
  }
  const categoria = alunoGem.cargo === 'ORGANISTA' || intg.categoria === 'Organista' ? 'Organista' : 'Músico';
  const instrumento = formatInstrumentName(alunoGem.instrumento || intg.instrumento, categoria);
  const naipe = detectarNaipe(instrumento, categoria);
  const rawNiv = String(alunoGem.nivel || nivelFromFlags(intg)).toUpperCase().trim();
  const nivel = rawNiv === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : rawNiv;
  const flags = flagsFromNivel(nivel, intg.meiaHora);

  return {
    ...intg,
    gemId: alunoGem.id,
    nome: intg.nome || alunoGem.nome,
    categoria,
    instrumento,
    naipe,
    nivel,
    comum: alunoGem.comum || intg.comum || 'VILA RUI BARBOSA',
    possuiInstrumento: alunoGem.possuiInstrumento || intg.possuiInstrumento || 'SIM',
    instrumentoProprio: alunoGem.instrumentoProprio || intg.instrumentoProprio || 'SIM',
    tonalidade: alunoGem.tonalidade || intg.tonalidade || 'DÓ',
    dataInicioGem: alunoGem.dataInicioGem || intg.dataInicioGem || '',
    ensaios: flags.ensaios,
    rjm: flags.rjm,
    meiaHora: flags.meiaHora,
    cultosOficiais: flags.cultosOficiais,
    oficializado: flags.oficializado,
    batizado: alunoGem.batizado === false || alunoGem.batizado === 'NÃO' ? false : (intg.batizado !== false),
    telefone: alunoGem.telefone || alunoGem.contato || intg.telefone || '',
    observacao: alunoGem.observacoes || intg.observacao || ''
  };
}
