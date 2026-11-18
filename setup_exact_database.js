const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const INITIAL_FILE = path.join(__dirname, 'initialData.json');

// Dados puros da planilha fornecida pelo usuário
const csvData = [
  // CORDAS - Violino
  { instrumento: 'Violino', nome: 'Marcelo Teixeira de Sena', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '' },
  { instrumento: 'Violino', nome: 'Eduardo Vergílio Zocarato', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 98410-1299' },
  { instrumento: 'Violino', nome: 'Pedro Carvalho Amancio', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97232-6688' },
  { instrumento: 'Violino', nome: 'Davi Mariano da Cruz', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97360-5368' },
  { instrumento: 'Violino', nome: 'Richard Davy de Souza Carvalho', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 93931-4931' },
  { instrumento: 'Violino', nome: 'Lincoln Machado', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: false, batizado: false, telefone: '' },
  { instrumento: 'Violino', nome: 'Matheus Daniel Perera de Andrade', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: false, batizado: false, telefone: '' },
  { instrumento: 'Violino', nome: 'Eduardo H. Rosa', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: false, batizado: true, telefone: '(11) 93803-4343' },

  // CORDAS - Viola
  { instrumento: 'Viola', nome: 'Everton Mariano', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 95994-3418' },
  { instrumento: 'Viola', nome: 'Danilo Codogno', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '' },
  { instrumento: 'Viola', nome: 'Gustavo Xavier Rodrigues', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99539-2913' },
  { instrumento: 'Viola', nome: 'Willian David de Oliveira', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: true, oficializado: false, batizado: true, telefone: '(11) 96424-5513' },
  { instrumento: 'Viola', nome: 'Roger Saraiva da Silva', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(24) 99993-43639' },
  { instrumento: 'Viola', nome: 'Gabriel Martins de Souza', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: false, batizado: false, telefone: '' },

  // MADEIRAS - Flauta
  { instrumento: 'Flauta', nome: 'Allan da Silva Salles', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 95929-7343' },
  { instrumento: 'Flauta', nome: 'Claudemir Rodrigues de Freitas', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: true, oficializado: false, batizado: true, telefone: '(11) 96868-2389' },
  { instrumento: 'Flauta', nome: 'Reinaldo Moraes Bezerra', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '' },

  // MADEIRAS - Clarinete
  { instrumento: 'Clarinete', nome: 'Luiz Gonzaga da Cruz', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 91587-0375' },
  { instrumento: 'Clarinete', nome: 'Wagner Aparecido Lopes', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99877-8263' },

  // MADEIRAS - Clarinete Alto
  { instrumento: 'Clarinete Alto', nome: 'André Salvador', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97448-3992' },

  // MADEIRAS - Saxofone Soprano
  { instrumento: 'Saxofone Soprano', nome: 'Samuel Nogueira Gonçalves', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: true, oficializado: false, batizado: true, telefone: '' },
  { instrumento: 'Saxofone Soprano', nome: 'Jonathan Diego Batista Cardoso', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 98608-6653' },

  // MADEIRAS - Saxofone Alto
  { instrumento: 'Saxofone Alto', nome: 'Jairo Ferreira da Silva', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97180-7110' },
  { instrumento: 'Saxofone Alto', nome: 'Pedro Carlos de Oliveira', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 94456-2665' },
  { instrumento: 'Saxofone Alto', nome: 'Walter de Jesus Cassemiro', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99662-7403' },
  { instrumento: 'Saxofone Alto', nome: 'Alexandre Xavier Rodrigues', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99662-7403' },
  { instrumento: 'Saxofone Alto', nome: 'Weslei Gabriel de Almeida', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '' },
  { instrumento: 'Saxofone Alto', nome: 'Edson', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '' },

  // METAIS - Trompete
  { instrumento: 'Trompete', nome: 'Matheus Martins de Souza', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 93426-7407' },
  { instrumento: 'Trompete', nome: 'Bruno Duarte dos Santos', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99819-8037' },
  { instrumento: 'Trompete', nome: 'Filipe Lima da Silva Melo', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97756-1370' },

  // METAIS - Trombone
  { instrumento: 'Trombone', nome: 'Silvio Pantalião', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99557-6421' },
  { instrumento: 'Trombone', nome: 'Vanderval da Cruz', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97360-5368' },
  { instrumento: 'Trombone', nome: 'Lucas Alessandro de Oliveira', ensaios: false, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99567-8612' },

  // METAIS - Trombonito
  { instrumento: 'Trombonito', nome: 'Tiago Silva de Souza Lopes', ensaios: true, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false, batizado: false, telefone: '' },

  // METAIS - Eufônio
  { instrumento: 'Eufônio', nome: 'Jair Xavier Rodrigues', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97157-2456' },
  { instrumento: 'Eufônio', nome: 'Kleber Xavier Rodrigues', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 96377-0107' },

  // METAIS - Tuba
  { instrumento: 'Tuba', nome: 'Jefferson Xavier Rodrigues', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 96405-5271' },
  { instrumento: 'Tuba', nome: 'Lucas Martins da Silva', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97529-6423' },
  { instrumento: 'Tuba', nome: 'Anderson Aparecido de Arantes', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 93931-4931' },
  { instrumento: 'Tuba', nome: 'José Aparecido de Souza', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97103-8366' },
  { instrumento: 'Tuba', nome: 'Taylor Nayan da Rosa Santos', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false, batizado: false, telefone: '' },

  // TECLAS - Organistas
  { instrumento: 'Órgão Eletrônico', nome: 'Rosely Miurim da Silva', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97647-0730' },
  { instrumento: 'Órgão Eletrônico', nome: 'Karina Miurim da Silva Rodrigues', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99854-9059' },
  { instrumento: 'Órgão Eletrônico', nome: 'Thamiris Miurim Rodrigues', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 99537-1236' },
  { instrumento: 'Órgão Eletrônico', nome: 'Gracieli Mariano Cruz', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 97294-0283' },
  { instrumento: 'Órgão Eletrônico', nome: 'Eliana Soares', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 95530-3679' },
  { instrumento: 'Órgão Eletrônico', nome: 'Priscila Vianna Mompean Salles', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 94953-8569' },
  { instrumento: 'Órgão Eletrônico', nome: 'Gisele Guimarães França', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '' },
  { instrumento: 'Órgão Eletrônico', nome: 'Larissa Laís Souza', categoria: 'Organista', ensaios: false, rjm: true, meiaHora: true, cultosOficiais: true, oficializado: false, batizado: true, telefone: '(11) 95782-5835' },
  { instrumento: 'Órgão Eletrônico', nome: 'Júlia Miguel Ferreira', categoria: 'Organista', ensaios: false, rjm: true, meiaHora: true, cultosOficiais: true, oficializado: false, batizado: true, telefone: '(11) 97303-6110' },
  { instrumento: 'Órgão Eletrônico', nome: 'Camili dos Santos', categoria: 'Organista', ensaios: false, rjm: true, meiaHora: true, cultosOficiais: true, oficializado: false, batizado: true, telefone: '(11) 94452-3720' },
  { instrumento: 'Órgão Eletrônico', nome: 'Luana Weitzel', categoria: 'Organista', ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: true, batizado: true, telefone: '(11) 95048-7819' }
];

function detectarNaipe(inst, cat) {
  if (cat === 'Organista' || inst.toLowerCase().includes('órgão')) return 'Teclas / Organistas';
  const i = inst.toLowerCase();
  if (i.includes('viol') || i.includes('corda')) return 'Cordas';
  if (i.includes('flaut') || i.includes('clarin') || i.includes('sax') || i.includes('obo') || i.includes('fagot')) return 'Madeiras';
  if (i.includes('tromp') || i.includes('tromb') || i.includes('tuba') || i.includes('euf') || i.includes('flugel') || i.includes('cornet') || i.includes('bombardin')) return 'Metais';
  return 'Cordas';
}

const integrantes = csvData.map((item, idx) => {
  const cat = item.categoria || 'Músico';
  return {
    id: idx + 1,
    nome: item.nome,
    instrumento: item.instrumento,
    categoria: cat,
    naipe: detectarNaipe(item.instrumento, cat),
    ensaios: item.ensaios,
    rjm: item.rjm,
    meiaHora: item.meiaHora,
    cultosOficiais: item.cultosOficiais,
    oficializado: item.oficializado,
    batizado: item.batizado,
    telefone: item.telefone,
    observacao: ''
  };
});

const fullDatabase = {
  config: {
    localidade: 'Vila Rui Barbosa',
    cidade: 'Jundiaí - SP',
    tipoOrquestra: 'Simples',
    metaOficializados: 33,
    totalMusicos: 40,
    totalComAprendizes: 51,
    totalOrganistas: 11,
    ultimaAtualizacao: new Date().toISOString()
  },
  integrantes
};

fs.writeFileSync(DATA_FILE, JSON.stringify(fullDatabase, null, 2), 'utf-8');
fs.writeFileSync(INITIAL_FILE, JSON.stringify(fullDatabase, null, 2), 'utf-8');

console.log('Banco de dados inicializado com sucesso com os 53 integrantes da planilha!');
