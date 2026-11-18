// Lista oficial de instrumentos da Orquestra CCB divididos por Naipe

export const NAIPES = {
  CORDAS: 'Cordas',
  MADEIRAS: 'Madeiras',
  METAIS: 'Metais',
  TECLAS: 'Teclas / Organistas'
};

export const INSTRUMENTOS_CCB = [
  // CORDAS
  { nome: 'Violino', naipe: 'Cordas', icon: '🎻' },
  { nome: 'Viola', naipe: 'Cordas', icon: '🎻' },
  { nome: 'Violoncelo', naipe: 'Cordas', icon: '🎻' },

  // MADEIRAS
  { nome: 'Flauta Transversal', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Oboé', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Corne Inglês', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Clarinete (Si♭)', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Clarinete Alto', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Clarone (Clarinete Baixo)', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Fagote', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Contrafagote', naipe: 'Madeiras', icon: '🪵' },
  { nome: 'Saxofone Soprano', naipe: 'Madeiras', icon: '🎷' },
  { nome: 'Saxofone Alto', naipe: 'Madeiras', icon: '🎷' },
  { nome: 'Saxofone Tenor', naipe: 'Madeiras', icon: '🎷' },
  { nome: 'Saxofone Barítono', naipe: 'Madeiras', icon: '🎷' },

  // METAIS
  { nome: 'Trompete', naipe: 'Metais', icon: '🎺' },
  { nome: 'Cornet', naipe: 'Metais', icon: '🎺' },
  { nome: 'Flugelhorn', naipe: 'Metais', icon: '🎺' },
  { nome: 'Trompa', naipe: 'Metais', icon: '📯' },
  { nome: 'Trombone de Vara', naipe: 'Metais', icon: '🎺' },
  { nome: 'Trombone de Pisto', naipe: 'Metais', icon: '🎺' },
  { nome: 'Trombonito', naipe: 'Metais', icon: '🎺' },
  { nome: 'Eufônio / Bombardino', naipe: 'Metais', icon: '🎺' },
  { nome: 'Barítono', naipe: 'Metais', icon: '🎺' },
  { nome: 'Tuba / Sousafone', naipe: 'Metais', icon: '🎺' },

  // TECLAS / ORGANISTAS
  { nome: 'Órgão Eletrônico', naipe: 'Teclas / Organistas', icon: '🎹' }
];

export function detectarNaipe(instrumento, categoria) {
  if (categoria === 'Organista' || (instrumento && instrumento.toLowerCase().includes('órgão'))) {
    return 'Teclas / Organistas';
  }
  const encontrado = INSTRUMENTOS_CCB.find(
    i => i.nome.toLowerCase() === (instrumento || '').trim().toLowerCase()
  );
  if (encontrado) return encontrado.naipe;

  const instLow = (instrumento || '').toLowerCase();
  if (instLow.includes('viol') || instLow.includes('corda')) return 'Cordas';
  if (
    instLow.includes('sax') ||
    instLow.includes('flaut') ||
    instLow.includes('clarin') ||
    instLow.includes('obo') ||
    instLow.includes('fagot')
  ) {
    return 'Madeiras';
  }
  if (
    instLow.includes('tromp') ||
    instLow.includes('tromb') ||
    instLow.includes('tuba') ||
    instLow.includes('flugel') ||
    instLow.includes('bombardin') ||
    instLow.includes('euf') ||
    instLow.includes('cornet')
  ) {
    return 'Metais';
  }
  return 'Cordas';
}
