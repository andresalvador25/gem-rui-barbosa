import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  Users, 
  Sparkles, 
  CalendarCheck, 
  Clock, 
  FileText, 
  Settings 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts }) {
  const navItems = [
    { id: 'dashboard', label: 'Visão Geral / Painel', icon: LayoutDashboard },
    { id: 'orquestra', label: 'Orquestra & Diagnóstico', icon: Sliders, badge: 'MOO' },
    { id: 'musicos', label: 'Corpo Musical (Músicos)', icon: Users, count: counts?.musicos || 0 },
    { id: 'organistas', label: 'Organistas', icon: Sparkles, count: counts?.organistas || 0 },
    { id: 'gem-chamada', label: 'GEM & Chamada', icon: CalendarCheck, count: counts?.gem || 0 },
    { id: 'gem-escala', label: 'Escala & Horários GEM', icon: Clock },
    { id: 'fichas', label: 'Fichas & Formulários CCB', icon: FileText, badge: '20' },
    { id: 'config', label: 'Configurações & Dados', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] no-print">
      <div className="p-4 border-b border-slate-100">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Módulos de Gestão
        </span>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-[11px] font-bold text-blue-900">Manual de Orientação Orquestral</p>
          <p className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
            Parâmetros oficiais de equilíbrio tímbrico e formação progressiva.
          </p>
        </div>
      </div>
    </aside>
  );
}
