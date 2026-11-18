// Tabelas Oficiais do Manual de Orientação Orquestral (MOO) - CCB (Páginas 44, 45, 47, 48)

export const ORDEM_MOO_INSTRUMENTOS = [
  // CORDAS
  { id: 'violino_soprano', nome: 'Violino (Soprano)', baseNome: 'Violino', naipe: 'Cordas', voz: 'Soprano', tom: 'Dó' },
  { id: 'violino_contralto', nome: 'Violino (Contralto)', baseNome: 'Violino', naipe: 'Cordas', voz: 'Contralto', tom: 'Dó' },
  { id: 'viola', nome: 'Viola', baseNome: 'Viola', naipe: 'Cordas', voz: 'Tenor', tom: 'Dó' },
  { id: 'violoncelo', nome: 'Violoncelo', baseNome: 'Violoncelo', naipe: 'Cordas', voz: 'Baixo', tom: 'Dó' },

  // MADEIRAS
  { id: 'flauta', nome: 'Flauta transversal', baseNome: 'Flauta', naipe: 'Madeiras', voz: 'Soprano', tom: 'Dó' },
  { id: 'oboe', nome: 'Oboé', baseNome: 'Oboé', naipe: 'Madeiras', voz: 'Soprano', tom: 'Dó' },
  { id: 'oboe_damore', nome: "Oboé d'amore", baseNome: "Oboé d'amore", naipe: 'Madeiras', voz: 'Soprano', tom: 'Lá' },
  { id: 'corne_ingles', nome: 'Corne Inglês', baseNome: 'Corne Inglês', naipe: 'Madeiras', voz: 'Contralto', tom: 'Fá' },
  { id: 'fagote', nome: 'Fagote', baseNome: 'Fagote', naipe: 'Madeiras', voz: 'Baixo', tom: 'Dó' },
  { id: 'clarinete', nome: 'Clarinete(a)', baseNome: 'Clarinete', naipe: 'Madeiras', voz: 'Soprano', tom: 'Sib/Lá' },
  { id: 'clarinete_alto', nome: 'Clarinete alto', baseNome: 'Clarinete Alto', naipe: 'Madeiras', voz: 'Tenor', tom: 'Mib' },
  { id: 'clarinete_baixo', nome: 'Clarinete baixo', baseNome: 'Clarone', naipe: 'Madeiras', voz: 'Baixo', tom: 'Sib' },
  { id: 'sax_soprano', nome: 'Saxofone soprano', baseNome: 'Saxofone Soprano', naipe: 'Madeiras', voz: 'Soprano', tom: 'Sib' },
  { id: 'sax_alto', nome: 'Saxofone alto', baseNome: 'Saxofone Alto', naipe: 'Madeiras', voz: 'Contralto', tom: 'Mib' },
  { id: 'sax_tenor', nome: 'Saxofone tenor', baseNome: 'Saxofone Tenor', naipe: 'Madeiras', voz: 'Tenor', tom: 'Sib' },
  { id: 'sax_baritono', nome: 'Saxofone barítono', baseNome: 'Saxofone Barítono', naipe: 'Madeiras', voz: 'Baixo', tom: 'Mib' },

  // METAIS
  { id: 'trompete', nome: 'Trompete', baseNome: 'Trompete', naipe: 'Metais', voz: 'Soprano', tom: 'Sib/Dó' },
  { id: 'cornet', nome: 'Cornet', baseNome: 'Cornet', naipe: 'Metais', voz: 'Soprano', tom: 'Sib/Dó' },
  { id: 'trompa', nome: 'Trompa', baseNome: 'Trompa', naipe: 'Metais', voz: 'Contralto', tom: 'Fá/Sib' },
  { id: 'trombone', nome: 'Trombone', baseNome: 'Trombone', naipe: 'Metais', voz: 'Tenor', tom: 'Sib/Dó' },
  { id: 'eufonio', nome: 'Eufônio', baseNome: 'Eufônio', naipe: 'Metais', voz: 'Baixo', tom: 'Sib' },
  { id: 'tuba', nome: 'Tuba', baseNome: 'Tuba', naipe: 'Metais', voz: 'Baixo', tom: 'Sib/Fá ou Mib/Dó' }
];

// Matriz oficial da Formação Simples (Páginas 47 e 48)
// Etapas: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64
export const TABELA_SIMPLES = {
  etapas: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64],
  // Proporções oficiais
  porcentagens: { cordas: 50, madeiras: 25, metais: 25 },
  // Quantidades por instrumento chave para etapas 32, 36, 40, 50
  grades: {
    32: {
      cordas: 16, madeiras: 8, metais: 8,
      vozes: { soprano: 12, contralto: 9, tenor: 7, baixo: 4 },
      instrumentos: {
        'Violino': 10, 'Viola': 4, 'Violoncelo': 2,
        'Flauta': 2, 'Clarinete': 2, 'Saxofone Alto': 2, 'Saxofone Soprano': 1, 'Saxofone Tenor': 1,
        'Trompete': 2, 'Cornet': 1, 'Trompa': 2, 'Trombone': 1, 'Eufônio': 1, 'Tuba': 1
      }
    },
    36: {
      cordas: 18, madeiras: 9, metais: 9,
      vozes: { soprano: 15, contralto: 9, tenor: 7, baixo: 5 },
      instrumentos: {
        'Violino': 12, 'Viola': 4, 'Violoncelo': 2,
        'Flauta': 2, 'Clarinete': 2, 'Clarinete Baixo': 1, 'Saxofone Soprano': 1, 'Saxofone Alto': 2, 'Saxofone Tenor': 1,
        'Trompete': 1, 'Cornet': 1, 'Trompa': 3, 'Trombone': 2, 'Eufônio': 1, 'Tuba': 1
      }
    },
    40: {
      cordas: 20, madeiras: 10, metais: 10,
      vozes: { soprano: 16, contralto: 10, tenor: 8, baixo: 6 },
      instrumentos: {
        'Violino': 14, 'Viola': 4, 'Violoncelo': 2,
        'Flauta': 2, 'Clarinete': 2, 'Clarinete Baixo': 1, 'Saxofone Soprano': 1, 'Saxofone Alto': 2, 'Saxofone Tenor': 1, 'Saxofone Barítono': 1,
        'Trompete': 1, 'Cornet': 1, 'Trompa': 3, 'Trombone': 2, 'Eufônio': 2, 'Tuba': 1
      }
    },
    50: {
      cordas: 25, madeiras: 12, metais: 13,
      vozes: { soprano: 19, contralto: 13, tenor: 11, baixo: 8 },
      instrumentos: {
        'Violino': 17, 'Viola': 6, 'Violoncelo': 2,
        'Flauta': 2, 'Oboé': 1, 'Clarinete': 2, 'Clarinete Alto': 1, 'Saxofone Soprano': 1, 'Saxofone Alto': 2, 'Saxofone Tenor': 1,
        'Trompete': 1, 'Cornet': 1, 'Flugelhorn': 1, 'Trompa': 3, 'Trombonito': 1, 'Trombone': 2, 'Eufônio': 2, 'Tuba': 2
      }
    }
  }
};
