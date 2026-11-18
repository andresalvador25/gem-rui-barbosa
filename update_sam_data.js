const fs = require('fs');
const path = require('path');

const currentData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8'));

const musicosAtualizados = [
  // CORDAS - VIOLINOS OFICIALIZADOS (5)
  {
    id: 1,
    nome: "Lincoln Machado",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 2,
    nome: "Eduardo Vergílio Zocarato",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "984101299",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 3,
    nome: "Pedro Carvalho Amancio",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: true,
    batizado: true,
    telefone: "972326688",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 4,
    nome: "Davi Mariano da Cruz",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: true,
    batizado: true,
    telefone: "973605368",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 5,
    nome: "Richard Davy de Souza Carvalho",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: false,
    oficializado: true,
    batizado: true,
    telefone: "939314931",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // CORDAS - VIOLINOS EM DESENVOLVIMENTO / GEM (6)
  {
    id: 6,
    nome: "Davi Evangelista",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM MSA Fase 3"
  },
  {
    id: 7,
    nome: "Matheus Daniel Lepera de Andrade",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Reunião de Jovens e Menores",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: false,
    telefone: "",
    sam: true,
    observacoes: "MSA Fase 4"
  },
  {
    id: 8,
    nome: "Eduardo H. Rosa",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "Ensaio Local",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "938034343",
    sam: true,
    observacoes: "Ensaio Local e RJM"
  },
  {
    id: 9,
    nome: "Pedro Santana Santos",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM"
  },
  {
    id: 10,
    nome: "Guilherme Santana Santos",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM"
  },
  {
    id: 11,
    nome: "Renato Ferreira de Souza",
    instrumento: "Violino",
    naipe: "Cordas",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM MSA Fase 3"
  },

  // CORDAS - VIOLAS OFICIALIZADAS (4)
  {
    id: 12,
    nome: "Everton Mariano",
    instrumento: "Viola",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "959943418",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 13,
    nome: "Danilo Codogno",
    instrumento: "Viola",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 14,
    nome: "Gustavo Xavier Rodrigues",
    instrumento: "Viola",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "995392913",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 15,
    nome: "Claudemir Rodrigues de Freitas",
    instrumento: "Viola",
    naipe: "Cordas",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "24999343639",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // CORDAS - VIOLA EM DESENVOLVIMENTO (1)
  {
    id: 16,
    nome: "William David de Oliveira",
    instrumento: "Viola",
    naipe: "Cordas",
    fase: "Culto Oficial",
    rjm: true,
    culto: true,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "964245513",
    sam: true,
    observacoes: "Atua nos Cultos Oficiais"
  },

  // CORDAS - VIOLONCELO EM DESENVOLVIMENTO (1)
  {
    id: 17,
    nome: "Jhony Pinheiro Soares Santos",
    instrumento: "Violoncelo",
    naipe: "Cordas",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM de Violoncelo (Resgate / SAM OK)"
  },

  // MADEIRAS - FLAUTA TRANSVERSAL OFICIALIZADAS (2)
  {
    id: 18,
    nome: "Allan da Silva Salles",
    instrumento: "Flauta Transversal",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "959297343",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 19,
    nome: "Weslei Gabriel de Almeida",
    instrumento: "Flauta Transversal",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // MADEIRAS - FLAUTA EM DESENVOLVIMENTO (1)
  {
    id: 20,
    nome: "Gabriel Martins de Souza",
    instrumento: "Flauta Transversal",
    naipe: "Madeiras",
    fase: "Reunião de Jovens e Menores",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "11968682389",
    sam: true,
    observacoes: "Apto RJM e Ensaios"
  },

  // MADEIRAS - OBOÉ EM DESENVOLVIMENTO (1)
  {
    id: 21,
    nome: "Mateus Pereira",
    instrumento: "Oboé",
    naipe: "Madeiras",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM de Oboé (SAM OK)"
  },

  // MADEIRAS - CLARINETE OFICIALIZADOS (2)
  {
    id: 22,
    nome: "Luiz Gonzaga da Cruz",
    instrumento: "Clarinete",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "915870375",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 23,
    nome: "Wagner Aparecido Lopes",
    instrumento: "Clarinete",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "998778263",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // MADEIRAS - CLARINETE ALTO OFICIALIZADO (1)
  {
    id: 24,
    nome: "André Salvador",
    instrumento: "Clarinete Alto",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "974483992",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // MADEIRAS - SAXOFONE SOPRANO OFICIALIZADO (1)
  {
    id: 25,
    nome: "Jonathan Diego Batista Cardoso",
    instrumento: "Saxofone Soprano",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "986086653",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // MADEIRAS - SAXOFONE SOPRANO EM DESENVOLVIMENTO (2)
  {
    id: 26,
    nome: "Roger Saraiva da Silva",
    instrumento: "Saxofone Soprano",
    naipe: "Madeiras",
    fase: "Culto Oficial",
    rjm: true,
    culto: true,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Cultos Oficiais"
  },
  {
    id: 27,
    nome: "Bruno César Machado",
    instrumento: "Saxofone Soprano",
    naipe: "Madeiras",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM MSA Fase 4 (SAM OK)"
  },

  // MADEIRAS - SAXOFONE ALTO OFICIALIZADOS (5)
  {
    id: 28,
    nome: "Jairo Ferreira da Silva",
    instrumento: "Saxofone Alto",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "971807110",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 29,
    nome: "Pedro Carlos de Oliveira",
    instrumento: "Saxofone Alto",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "11944562665",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 30,
    nome: "Walter de Jesus Cassemiro",
    instrumento: "Saxofone Alto",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "996627403",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 31,
    nome: "Gisele Guimarães França",
    instrumento: "Saxofone Alto",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "996627403",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 32,
    nome: "Alexandre Xavier Rodrigues",
    instrumento: "Saxofone Alto",
    naipe: "Madeiras",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // MADEIRAS - SAXOFONE TENOR EM DESENVOLVIMENTO (1)
  {
    id: 33,
    nome: "Anderson Flávio de França",
    instrumento: "Saxofone Tenor",
    naipe: "Madeiras",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM Sax Tenor (SAM OK)"
  },

  // METAIS - TROMPETE OFICIALIZADOS (3)
  {
    id: 34,
    nome: "Matheus Martins de Souza",
    instrumento: "Trompete",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "934267407",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 35,
    nome: "Bruno Duarte",
    instrumento: "Trompete",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "998198037",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 36,
    nome: "Filipe Lima da Silva Melo",
    instrumento: "Trompete",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "11977561370",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // METAIS - FLUGELHORN EM DESENVOLVIMENTO (1)
  {
    id: 37,
    nome: "Edgar",
    instrumento: "Flugelhorn",
    naipe: "Metais",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM Flugelhorn MSA Fase 3"
  },

  // METAIS - TROMPA EM DESENVOLVIMENTO (2)
  {
    id: 38,
    nome: "Giovanni Miguel Ferreira",
    instrumento: "Trompa",
    naipe: "Metais",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM Trompa MSA Fase 3 (SAM OK)"
  },
  {
    id: 39,
    nome: "Alex",
    instrumento: "Trompa",
    naipe: "Metais",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM Trompa MSA Fase 2"
  },

  // METAIS - TROMBONITO EM DESENVOLVIMENTO (1)
  {
    id: 40,
    nome: "Eliezer",
    instrumento: "Trombonito",
    naipe: "Metais",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM Trombonito (SAM OK)"
  },

  // METAIS - TROMBONE OFICIALIZADOS (3)
  {
    id: 41,
    nome: "Silvio Pantalião",
    instrumento: "Trombone",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "995576421",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 42,
    nome: "Vanderval da Cruz",
    instrumento: "Trombone",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "973605368",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 43,
    nome: "Lucas Alessandro de Oliveira",
    instrumento: "Trombone",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "995678612",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // METAIS - EUFÔNIO OFICIALIZADOS (2)
  {
    id: 44,
    nome: "Jair Xavier Rodrigues",
    instrumento: "Eufônio",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "971572456",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 45,
    nome: "Kleber Xavier Rodrigues",
    instrumento: "Eufônio",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "963770107",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },

  // METAIS - EUFÔNIO EM DESENVOLVIMENTO (1)
  {
    id: 46,
    nome: "Vinícius Silva de Souza Lopes",
    instrumento: "Eufônio",
    naipe: "Metais",
    fase: "GEM com Instrumento",
    rjm: true,
    culto: false,
    meiaHora: false,
    oficializado: false,
    batizado: true,
    telefone: "",
    sam: true,
    observacoes: "Aluno GEM Eufônio (SAM OK)"
  },

  // METAIS - TUBA OFICIALIZADOS (4)
  {
    id: 47,
    nome: "Jefferson Xavier Rodrigues",
    instrumento: "Tuba",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "964055271",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 48,
    nome: "Lucas Martins da Silva",
    instrumento: "Tuba",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "975296423",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 49,
    nome: "Anderson Aparecido de Arantes",
    instrumento: "Tuba",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "939314931",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  },
  {
    id: 50,
    nome: "José Aparecido de Souza",
    instrumento: "Tuba",
    naipe: "Metais",
    fase: "Oficializado",
    rjm: true,
    culto: true,
    meiaHora: true,
    oficializado: true,
    batizado: true,
    telefone: "11971038366",
    sam: true,
    dataOficializacao: "Oficializado SAM"
  }
];

const organistasAtualizadas = [
  // 8 OFICIALIZADAS
  { id: 1, nome: "Rosely Miurim", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "976470730", sam: true },
  { id: 2, nome: "Karina Miurim", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "998549059", sam: true },
  { id: 3, nome: "Thamiris Miurim", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "995371236", sam: true },
  { id: 4, nome: "Gracieli Mariano", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "972940283", sam: true },
  { id: 5, nome: "Eliana Soares", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "955303679", sam: true },
  { id: 6, nome: "Priscila Salles", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "949538569", sam: true },
  { id: 7, nome: "Luana Weitzel", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: true, culto: true, meiaHora: true, oficializada: true, batizada: true, telefone: "950487819", sam: true },
  { id: 8, nome: "Marcelo Teixeira de Sena", instrumento: "Órgão Eletrônico", fase: "Oficializada", rjm: false, culto: true, meiaHora: false, oficializada: true, batizada: true, telefone: "", sam: true },
  
  // 3 JOVENS ATUANTES EM CULTOS / RJM
  { id: 9, nome: "Larissa Souza", instrumento: "Órgão Eletrônico", fase: "Culto Oficial", rjm: true, culto: true, meiaHora: true, oficializada: false, batizada: true, telefone: "957825835", sam: true },
  { id: 10, nome: "Júlia Ferreira", instrumento: "Órgão Eletrônico", fase: "Culto Oficial", rjm: true, culto: true, meiaHora: true, oficializada: false, batizada: true, telefone: "973036110", sam: true },
  { id: 11, nome: "Camili dos Santos", instrumento: "Órgão Eletrônico", fase: "Culto Oficial", rjm: true, culto: true, meiaHora: true, oficializada: false, batizada: true, telefone: "944523720", sam: true },

  // 8 ALUNAS GEM / CANDIDATAS
  { id: 12, nome: "Ana Liz Mompean Salles", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: false, oficializada: false, batizada: true, telefone: "94953-8569", sam: true },
  { id: 13, nome: "Camila Silva de Souza Rodrigues", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: false, oficializada: false, batizada: true, telefone: "", sam: true },
  { id: 14, nome: "Hortência Aryan Silva Máximo", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: true, oficializada: false, batizada: true, telefone: "91430-8254", sam: true },
  { id: 15, nome: "Juliane Lúcia Cruz Oliveira", instrumento: "Órgão Eletrônico", fase: "Culto Oficial", rjm: true, culto: true, meiaHora: true, oficializada: false, batizada: true, telefone: "", sam: true },
  { id: 16, nome: "Karen Fernanda Pinheiro Cassemiro", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: false, oficializada: false, batizada: true, telefone: "94230-4639", sam: true },
  { id: 17, nome: "Rebeca Soares", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: false, oficializada: false, batizada: true, telefone: "", sam: true },
  { id: 18, nome: "Sara Miurim", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: false, oficializada: false, batizada: true, telefone: "", sam: true },
  { id: 19, nome: "Maria Eduarda", instrumento: "Órgão Eletrônico", fase: "Candidata", rjm: false, culto: false, meiaHora: false, oficializada: false, batizada: true, telefone: "", sam: true }
];

const configAtualizada = {
  ...currentData.config,
  localidade: "Vila Rui Barbosa",
  cidade: "Jundiaí - SP",
  regional: "Vila Rui Barbosa | BR-SP-JUNDIAÍ-JUNDIAÍ",
  quantidadeDesejada: 32,
  tipoOrquestra: "Simples",
  cultosSemana: 2,
  temRjm: true,
  idealOrganistasRjm: 3,
  idealOrganistasCulto: 6,
  fonteDados: "Sistema de Administração Musical - SAM (musical.congregacao.org.br)",
  statusSincronizacao: "Sincronizado",
  dataSincronizacao: new Date().toISOString()
};

const updatedData = {
  ...currentData,
  config: configAtualizada,
  musicos: musicosAtualizados,
  organistas: organistasAtualizadas
};

fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(updatedData, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, 'initialData.json'), JSON.stringify(updatedData, null, 2), 'utf-8');
console.log('Dados atualizados com sucesso de acordo com o SAM Oficial!');
