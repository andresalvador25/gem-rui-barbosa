const fs = require('fs');
const path = require('path');

const rawCsv = `Instrumento,Nome,Ensaios,RJM (Somente Não casados),Meia Hora (Para irmãs somente),Cultos Oficiais,Oficializado (S/N),Batizados,Telefone
Violino,Marcelo Teixeira de Sena,,,,,S,S,
Violino,Eduardo Vergílio Zocarato,,,,,S,S,984101299
Violino,Pedro Carvalho Amancio,,S,,,S,S,972326688
Violino,Davi Mariano da Cruz,,S,,,S,S,973605368
Violino,Richard Davy de Souza Carvalho,,S,,,S,S,939314931
Violino,Lincoln Machado,,S,,,N,N,
Violino,Matheus Daniel Perera de Andrade,,S,,,N,N,
Violino,Eduardo H. Rosa,,S,,,N,S,938034343
Viola,Everton Mariano,,,,,S,S,959943418
Viola,Danilo Codogno,,,,,S,S,
Viola,Gustavo Xavier Rodrigues,,,,,S,S,995392913
Viola,Willian David de Oliveira,,,,S,N,S,964245513
Viola,Roger Saraiva da Silva,,,,,S,S,24999343639
Viola,Gabriel Martins de Souza,,S,,,N,N,
Flauta,Allan da Silva Salles,,,,,S,S,959297343
Flauta,Claudemir Rodrigues de Freitas,,S,,S,N,S,11968682389
Flauta,Reinaldo Moraes Bezerra,,,,,S,S,
Clarinete,Luiz Gonzaga da Cruz,,,,,S,S,915870375
Clarinete,Wagner Aparecido Lopes,,,,,S,S,998778263
Clarinete Alto,André Salvador,,,,,S,S,974483992
Saxofone Soprano,Samuel Nogueira Gonçalves,,,,S,N,S,
Saxofone Soprano,Jonathan Diego Batista Cardoso,,,,,S,S,986086653
Saxofone Alto,Jairo Ferreira da Silva,,,,,S,S,971807110
Saxofone Alto,Pedro Carlos de Oliveira,,,,,S,S,11944562665
Saxofone Alto,Walter de Jesus Cassemiro,,,,,S,S,996627403
Saxofone Alto,Alexandre Xavier Rodrigues,,,,,S,S,996627403
Saxofone Alto,Weslei Gabriel de Almeida,,,,,S,S,
Saxofone Alto,Edson,,,,,S,S,
Trompete,Matheus Martins de Souza,,S,,,S,S,934267407
Trompete,Bruno Duarte dos Santos,,,,,S,S,998198037
Trompete,Filipe Lima da Silva Melo,,,,,S,S,11977561370
Trombone,Silvio Pantalião,,,,,S,S,995576421
Trombone,Vanderval da Cruz,,,,,S,S,973605368
Trombone,Lucas Alessandro de Oliveira,,S,,,S,S,995678612
Trombonito,Tiago Silva de Souza Lopes,S,,,,,,
Eufônio,Jair Xavier Rodrigues,,,,,S,S,971572456
Eufônio,Kleber Xavier Rodrigues,,,,,S,S,963770107
Tuba,Jefferson Xavier Rodrigues,,,,,S,S,964055271
Tuba,Lucas Martins da Silva,,,,,S,S,975296423
Tuba,Anderson Aparecido de Arantes,,,,,S,S,939314931
Tuba,José Aparecido de Souza,,,,,S,S,11971038366
Tuba,Taylor Nayan da Rosa Santos,,,,,,,,
Organistas,Rosely Miurim da Silva,,,,,S,S,976470730
Organistas,Karina Miurim da Silva Rodrigues,,,,,S,S,998549059
Organistas,Thamiris Miurim Rodrigues,,,,,S,S,995371236
Organistas,Gracieli Mariano Cruz,,,,,S,S,972940283
Organistas,Eliana Soares,,,,,S,S,955303679
Organistas,Priscila Vianna Mompean Salles,,,,,S,S,949538569
Organistas,Gisele Guimarães França,,,,,S,S,
Organistas,Larissa Laís Souza,,S,S,S,N,S,957825835
Organistas,Júlia Miguel Ferreira,,S,S,S,N,S,973036110
Organistas,Camili dos Santos,,S,S,S,N,S,944523720
Organistas,Luana Weitzel,,,,,S,S,950487819`;

function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `(11) ${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 8) {
    return `(11) ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return phone;
}

function getNaipe(instrumento, isOrganista) {
  if (isOrganista || instrumento.toLowerCase().includes('órgão')) return 'Teclas / Organistas';
  const inst = instrumento.toLowerCase();
  if (inst.includes('viol') || inst.includes('corda')) return 'Cordas';
  if (inst.includes('flaut') || inst.includes('clarin') || inst.includes('sax') || inst.includes('obo') || inst.includes('fagot')) return 'Madeiras';
  if (inst.includes('tromp') || inst.includes('tromb') || inst.includes('tuba') || inst.includes('euf') || inst.includes('flugel') || inst.includes('cornet') || inst.includes('bombardin')) return 'Metais';
  return 'Cordas';
}

function getSituacao(ofic, cultos, rjm, ensaios) {
  if (ofic === 'S') return 'Oficializado';
  if (cultos === 'S') return 'Cultos Oficiais';
  if (rjm === 'S') return 'RJM';
  if (ensaios === 'S') return 'Ensaios';
  return 'Aluno GEM / Estudos';
}

const lines = rawCsv.trim().split('\n');
const headers = lines[0].split(',');

const integrantes = [];
let idCounter = 1;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(',');
  const instrumentoRaw = parts[0]?.trim();
  const nome = parts[1]?.trim();
  const ensaios = parts[2]?.trim().toUpperCase();
  const rjm = parts[3]?.trim().toUpperCase();
  const meiaHora = parts[4]?.trim().toUpperCase();
  const cultos = parts[5]?.trim().toUpperCase();
  const oficializado = parts[6]?.trim().toUpperCase();
  const batizado = parts[7]?.trim().toUpperCase();
  const telRaw = parts[8]?.trim();

  if (!nome) continue;

  const isOrganista = instrumentoRaw.toLowerCase().includes('organista');
  const instrumento = isOrganista ? 'Órgão Eletrônico' : instrumentoRaw;
  const categoria = isOrganista ? 'Organista' : 'Músico';
  const naipe = getNaipe(instrumento, isOrganista);
  const situacao = getSituacao(oficializado, cultos, rjm, ensaios);

  let observacoes = [];
  if (rjm === 'S' && situacao !== 'RJM') observacoes.push('Toca na RJM');
  if (meiaHora === 'S') observacoes.push('Meia Hora');
  if (cultos === 'S' && situacao !== 'Cultos Oficiais') observacoes.push('Toca Cultos Oficiais');
  if (batizado === 'N') observacoes.push('Não batizado');

  integrantes.push({
    id: idCounter++,
    nome,
    categoria,
    instrumento,
    naipe,
    situacao,
    oficializado: oficializado === 'S',
    batizado: batizado !== 'N',
    telefone: formatPhone(telRaw),
    observacao: observacoes.join(' • ')
  });
}

// MOO & Recomendações extraídas do Excel
const mooRecomendacoes = {
  orquestraSimples: {
    metaTotal: 29,
    oficializados: 33,
    distribuicao: [
      { instrumento: 'Violino', naipe: 'Cordas', recomendado: 10, atualOfic: 5, gem: 6, orqGem: 11 },
      { instrumento: 'Viola', naipe: 'Cordas', recomendado: 3, atualOfic: 4, gem: 1, orqGem: 5 },
      { instrumento: 'Violoncelo', naipe: 'Cordas', recomendado: 2, atualOfic: 0, gem: 1, orqGem: 1 },
      { instrumento: 'Flauta Transversal', naipe: 'Madeiras', recomendado: 2, atualOfic: 2, gem: 1, orqGem: 3 },
      { instrumento: 'Oboé', naipe: 'Madeiras', recomendado: 0, atualOfic: 0, gem: 1, orqGem: 1 },
      { instrumento: 'Clarinete', naipe: 'Madeiras', recomendado: 1, atualOfic: 2, gem: 0, orqGem: 2 },
      { instrumento: 'Clarinete Alto', naipe: 'Madeiras', recomendado: 0, atualOfic: 1, gem: 0, orqGem: 1 },
      { instrumento: 'Saxofone Soprano', naipe: 'Madeiras', recomendado: 1, atualOfic: 1, gem: 2, orqGem: 3 },
      { instrumento: 'Saxofone Alto', naipe: 'Madeiras', recomendado: 2, atualOfic: 6, gem: 0, orqGem: 6 },
      { instrumento: 'Saxofone Tenor', naipe: 'Madeiras', recomendado: 1, atualOfic: 0, gem: 1, orqGem: 1 },
      { instrumento: 'Trompete', naipe: 'Metais', recomendado: 0, atualOfic: 3, gem: 0, orqGem: 3 },
      { instrumento: 'Flugelhorn', naipe: 'Metais', recomendado: 0, atualOfic: 0, gem: 1, orqGem: 1 },
      { instrumento: 'Trompa', naipe: 'Metais', recomendado: 2, atualOfic: 0, gem: 2, orqGem: 2 },
      { instrumento: 'Trombone', naipe: 'Metais', recomendado: 2, atualOfic: 3, gem: 0, orqGem: 3 },
      { instrumento: 'Trombonito', naipe: 'Metais', recomendado: 0, atualOfic: 0, gem: 1, orqGem: 1 },
      { instrumento: 'Eufônio', naipe: 'Metais', recomendado: 1, atualOfic: 2, gem: 1, orqGem: 3 },
      { instrumento: 'Tuba', naipe: 'Metais', recomendado: 1, atualOfic: 4, gem: 0, orqGem: 4 }
    ],
    resumoNaipesOfic: {
      Cordas: { atual: 9, ideal: 16 },
      Madeiras: { atual: 12, ideal: 8 },
      Metais: { atual: 12, ideal: 8 }
    },
    resumoNaipesGem: {
      Cordas: { atual: 17, ideal: 25 },
      Madeiras: { atual: 17, ideal: 12 },
      Metais: { atual: 17, ideal: 13 }
    }
  }
};

const fullData = {
  config: {
    localidade: 'Vila Rui Barbosa',
    cidade: 'Jundiaí - SP',
    tipoOrquestra: 'Simples',
    quantidadeDesejada: 32,
    fonteDados: 'Planilha Oficial - Corpo Musical Vila Rui Barbosa',
    ultimaAtualizacao: new Date().toISOString()
  },
  integrantes,
  mooRecomendacoes
};

fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(fullData, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, 'initialData.json'), JSON.stringify(fullData, null, 2), 'utf-8');

console.log(`Processado com sucesso!`);
console.log(`Total integrantes: ${integrantes.length}`);
console.log(`Músicos: ${integrantes.filter(i => i.categoria === 'Músico').length}`);
console.log(`Organistas: ${integrantes.filter(i => i.categoria === 'Organista').length}`);
console.log(`Oficializados: ${integrantes.filter(i => i.situacao === 'Oficializado').length}`);
