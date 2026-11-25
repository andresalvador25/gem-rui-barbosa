import React from 'react';

export default function NaipeCards({ integrantes = [], activeNaipeFilter, onSelectNaipe }) {
  // Contadores por naipe
  const stats = {
    Cordas: { total: 0, oficializados: 0, alunos: 0 },
    Madeiras: { total: 0, oficializados: 0, alunos: 0 },
    Metais: { total: 0, oficializados: 0, alunos: 0 },
    'Teclas / Organistas': { total: 0, oficializados: 0, alunos: 0 }
  };

  integrantes.forEach(item => {
    const naipe = item.naipe || 'Cordas';
    if (!stats[naipe]) {
      stats[naipe] = { total: 0, oficializados: 0, alunos: 0 };
    }
    stats[naipe].total += 1;
    const isOfic = item.oficializado === true || item.situacao === 'Oficializado';
    if (isOfic) {
      stats[naipe].oficializados += 1;
    } else {
      stats[naipe].alunos += 1;
    }
  });

  const cards = [
    {
      id: 'Cordas',
      title: 'Cordas',
      subtitle: 'Violinos, Violas, Violoncelos',
      icon: '🎻',
      accentColor: 'border-l-blue-500',
      activeRing: 'ring-2 ring-blue-600 bg-blue-50/40 border-blue-300'
    },
    {
      id: 'Madeiras',
      title: 'Madeiras',
      subtitle: 'Flautas, Clarinetes, Saxofones, Oboés',
      icon: '🪵',
      accentColor: 'border-l-emerald-500',
      activeRing: 'ring-2 ring-emerald-600 bg-emerald-50/40 border-emerald-300'
    },
    {
      id: 'Metais',
      title: 'Metais',
      subtitle: 'Trompetes, Trompas, Trombones, Tubas',
      icon: '🎺',
      accentColor: 'border-l-amber-500',
      activeRing: 'ring-2 ring-amber-600 bg-amber-50/40 border-amber-300'
    },
    {
      id: 'Teclas / Organistas',
      title: 'Organistas',
      subtitle: 'Órgão Eletrônico (Cultos e RJM)',
      icon: '🎹',
      accentColor: 'border-l-purple-500',
      activeRing: 'ring-2 ring-purple-600 bg-purple-50/40 border-purple-300'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-2">
      {cards.map(card => {
        const data = stats[card.id] || { total: 0, oficializados: 0, alunos: 0 };
        const isSelected = activeNaipeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectNaipe(isSelected ? 'Todos' : card.id)}
            className={`cursor-pointer rounded-xl p-3 sm:p-3.5 transition-all duration-150 border-l-4 shadow-2xs ${card.accentColor} ${
              isSelected
                ? `${card.activeRing} shadow-sm`
                : 'bg-white hover:bg-slate-50 border-t border-r border-b border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">{card.icon}</span>
                <div className="min-w-0 truncate">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate flex items-center gap-1">
                    {card.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                    {card.subtitle}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg sm:text-xl font-black text-slate-900">{data.total}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                  {data.oficializados} Ofic.
                </span>
                <span className="text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                  {data.alunos} Não Ofic.
                </span>
              </div>
              <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                {isSelected ? '✕ Limpar' : 'Filtrar'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
