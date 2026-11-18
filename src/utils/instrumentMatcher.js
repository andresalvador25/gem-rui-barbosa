/**
 * Utilitário canônico de correspondência de instrumentos da Orquestra CCB.
 * Garante que instrumentos como 'Clarinete', 'Clarinete Alto', 'Clarinete Baixo / Clarone',
 * 'Saxofone Alto / Tenor / Soprano / Barítono' e 'Viola / Violino / Violoncelo'
 * sejam contabilizados estritamente e sem sobreposições indevidas.
 */

export function isMatchInstrumento(alvoOuPlanilha, instMusico) {
  if (!alvoOuPlanilha || !instMusico) return false;
  
  const alvo = (alvoOuPlanilha || '').toLowerCase().trim();
  const inst = (instMusico || '').toLowerCase().trim();

  // 1. Clarinete Soprano (Sib)
  if (alvo === 'clarinete' || alvo === 'clarinete soprano' || alvo === 'clarinete (si♭)' || alvo === 'clarinete(a)') {
    if (inst.includes('alto') || inst.includes('baixo') || inst.includes('clarone')) return false;
    return inst.includes('clarinete');
  }

  // 2. Clarinete Alto
  if (alvo === 'clarinete alto') {
    return inst.includes('clarinete alto') || (inst.includes('clarone') && inst.includes('alto'));
  }

  // 3. Clarinete Baixo / Clarone
  if (alvo === 'clarinete baixo' || alvo === 'clarone' || alvo === 'clarone (clarinete baixo)') {
    if (inst.includes('alto')) return false;
    return inst.includes('clarinete baixo') || inst.includes('clarone');
  }

  // 4. Saxofones
  if (alvo === 'saxofone soprano' || alvo === 'sax soprano') {
    return inst.includes('sax') && inst.includes('soprano');
  }
  if (alvo === 'saxofone alto' || alvo === 'sax alto') {
    return inst.includes('sax') && inst.includes('alto');
  }
  if (alvo === 'saxofone tenor' || alvo === 'sax tenor') {
    return inst.includes('sax') && inst.includes('tenor');
  }
  if (alvo === 'saxofone barítono' || alvo === 'sax barítono' || alvo === 'sax baritono' || alvo === 'saxofone baritono') {
    return inst.includes('sax') && (inst.includes('barítono') || inst.includes('baritono'));
  }

  // 5. Cordas (Viola não pode pegar Violino nem Violoncelo)
  if (alvo === 'viola') {
    if (inst.includes('violino') || inst.includes('violoncelo') || inst.includes('flauta')) return false;
    return inst === 'viola' || inst.startsWith('viola ') || inst.endsWith(' viola') || inst === 'violas';
  }
  if (alvo === 'violino') {
    return inst.includes('violino');
  }
  if (alvo === 'violoncelo' || alvo === 'cello') {
    return inst.includes('violoncelo') || inst.includes('cello');
  }

  // 6. Madeiras
  if (alvo === 'flauta' || alvo === 'flauta transversal') {
    return inst.includes('flauta');
  }
  if (alvo === 'oboé' || alvo === 'oboe') {
    if (inst.includes('amore') || inst.includes('corne')) return false;
    return inst === 'oboé' || inst === 'oboe' || inst.includes('oboé') || inst.includes('oboe');
  }
  if (alvo === "oboé d'amore" || alvo === "oboe d'amore") {
    return inst.includes('amore');
  }
  if (alvo === 'corne inglês' || alvo === 'corne ingles') {
    return inst.includes('corne');
  }
  if (alvo === 'fagote') {
    return inst.includes('fagote');
  }

  // 7. Metais
  if (alvo === 'trompete') {
    return inst.includes('trompete');
  }
  if (alvo === 'cornet') {
    return inst.includes('cornet');
  }
  if (alvo === 'flugelhorn') {
    return inst.includes('flugelhorn') || inst.includes('flügelhorn');
  }
  if (alvo === 'trompa') {
    if (inst.includes('trompete') || inst.includes('trombone') || inst.includes('trombonito')) return false;
    return inst.includes('trompa');
  }
  if (alvo === 'trombone') {
    if (inst.includes('trombonito')) return false;
    return inst.includes('trombone');
  }
  if (alvo === 'trombonito') {
    return inst.includes('trombonito');
  }
  if (alvo === 'eufônio' || alvo === 'eufonio' || alvo === 'bombardino') {
    return inst.includes('eufônio') || inst.includes('eufonio') || inst.includes('bombardino');
  }
  if (alvo === 'barítono sib' || alvo === 'barítono' || alvo === 'baritono sib' || alvo === 'baritono') {
    if (inst.includes('sax')) return false;
    return inst.includes('barítono') || inst.includes('baritono');
  }
  if (alvo === 'tuba' || alvo === 'sousafone') {
    return inst.includes('tuba') || inst.includes('sousafone');
  }

  // 8. Teclas / Órgão
  if (alvo.includes('órgão') || alvo.includes('orgao') || alvo.includes('organista')) {
    return inst.includes('órgão') || inst.includes('orgao') || inst.includes('organista');
  }

  return inst === alvo || inst.includes(alvo);
}
