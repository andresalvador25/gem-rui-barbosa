const AdmZip = require('adm-zip');
const file = 'C:/Users/dre_s/.gemini/antigravity/brain/02cb4605-7877-4979-945b-a13a968cfc90/.user_uploaded/media_1791848713610_c41bfb3e.xlsx';
const zip = new AdmZip(file);

['chart1.xml', 'chart2.xml', 'chart3.xml'].forEach(name => {
  const c = zip.getEntry('xl/charts/' + name);
  const xml = c.getData().toString('utf8');
  console.log('=== ' + name + ' ===');
  const barDir = xml.match(/<c:barDir val="([^"]+)"\/>/);
  const grouping = xml.match(/<c:grouping val="([^"]+)"\/>/);
  console.log('Direção:', barDir ? barDir[1] : 'col', 'Agrupamento:', grouping ? grouping[1] : 'standard');
  const series = xml.match(/<c:ser>[\s\S]*?<\/c:ser>/g);
  console.log('Número de séries:', series ? series.length : 0);
  if (series) {
    series.forEach((s, idx) => {
      const nameMatch = s.match(/<c:f>([^<]+)<\/c:f>/);
      const vals = s.match(/<c:v>([^<]+)<\/c:v>/g);
      console.log('  Série ' + (idx+1) + ':', nameMatch ? nameMatch[1] : 'sem nome', 'Valores:', vals ? vals.slice(0, 5).join(', ') : 'nenhum');
    });
  }
});
