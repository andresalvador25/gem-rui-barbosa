import React from 'react';
import { Clock, Users, BookOpen, Music, CheckCircle2 } from 'lucide-react';

export default function GemEscalaView({ gemAlunos }) {
  // Dados de instrutores e salas extraídos das tabelas fornecidas
  const escalaGeral = [
    {
      instrutor: 'ANDRÉ',
      funcao: 'Instrutor MSA',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Teoria Musical (M.S.A.)', alunos: ['Bruno César (Sax Soprano)', 'Kayque (Eufônio)', 'Lincoln (Violino)', 'Matheus Daniel (Violino)'] },
        { hora: '16:00h - 17:00h', materia: 'Teoria Musical (M.S.A.)', alunos: ['Gabriel (Viola)', 'Davi Evangelista (Violino)', 'Misael Felipe (Violino)'] }
      ]
    },
    {
      instrutor: 'MATHEUS',
      funcao: 'Instrutor MSA e Metais',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Teoria Musical (M.S.A.)', alunos: ['Edgard Maciel (Flugelhorn)', 'Renato Ferreira (Trompete)', 'Giovanni Miguel (Trompa)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Edgard Maciel (Flugelhorn)', 'Renato Ferreira (Trompete)'] }
      ]
    },
    {
      instrutor: 'ANDERSON',
      funcao: 'Instrutor MSA e Eufônio/Trombone',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Teoria Musical (M.S.A.)', alunos: ['Alex da Cruz (Trompa)', 'Tiago Silva (Trombonito)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Gabriel Xavier (Eufônio)', 'Kayque Xavier (Eufônio)'] }
      ]
    },
    {
      instrutor: 'VANDER',
      funcao: 'Instrutor de Cordas (Violino/Cello)',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Prática de Instrumento', alunos: ['Davi Evangelista (Violino)', 'Misael Felipe (Violino)', 'Jhony Pinheiro (Violoncelo)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Matheus Daniel (Violino)', 'Tiago Silva (Trombonito)'] }
      ]
    },
    {
      instrutor: 'DANILO',
      funcao: 'Instrutor de Viola e Violino',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Teoria Musical (M.S.A.)', alunos: ['Eduardo Rosa (Violino)', 'Gabriel Martins (Viola)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Lincoln Machado (Violino)', 'Eduardo Rosa (Violino)'] }
      ]
    },
    {
      instrutor: 'ALEXANDRE',
      funcao: 'Instrutor de Palhetas e Saxofones',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Teoria Musical (M.S.A.)', alunos: ['Gabriel Xavier (Eufônio)', 'Nelson (Oboé)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Bruno César (Saxofone Soprano)', 'Anderson Flávio (Saxofone Tenor)'] }
      ]
    },
    {
      instrutor: 'ALLAN',
      funcao: 'Instrutor de Madeiras (Flauta Transversal)',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Prática de Instrumento', alunos: ['Claudemir Rodrigues (Flauta Transversal)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Claudemir Rodrigues (Flauta Transversal)', 'Nelson (Oboé)'] }
      ]
    },
    {
      instrutor: 'ELIEZER',
      funcao: 'Instrutor de Metais Graves e Trompa',
      horarios: [
        { hora: '15:00h - 16:00h', materia: 'Prática de Instrumento', alunos: ['Alex da Cruz (Trompa)'] },
        { hora: '16:00h - 17:00h', materia: 'Prática de Instrumento', alunos: ['Giovanni Miguel (Trompa)'] }
      ]
    }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded">
              GEM CCB
            </span>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Escala Semanal de Aulas & Instrutores</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Distribuição dos sábados: 1ª Hora (15h às 16h) e 2ª Hora (16h às 17h) alternando Teoria Musical (MSA) e Prática de Instrumento.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-xs font-semibold text-blue-900">
          Encarregado Local & Responsável: Vila Rui Barbosa
        </div>
      </div>

      {/* Grid de Instrutores e Horários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {escalaGeral.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                {item.funcao}
              </span>
              <h3 className="text-base font-extrabold tracking-tight mt-0.5">
                {item.instrutor}
              </h3>
            </div>

            <div className="p-3.5 space-y-3 flex-1 bg-slate-50/50">
              {item.horarios.map((h, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xl/5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {h.hora}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {h.materia.includes('M.S.A.') ? 'Teoria' : 'Instrumento'}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold text-slate-500 mb-2">
                    {h.materia}
                  </p>

                  <div className="space-y-1">
                    {h.alunos.map((aluno, aIdx) => (
                      <div key={aIdx} className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span className="truncate">{aluno}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-white border-t border-slate-100 text-[10px] text-center text-slate-400 font-semibold">
              Vila Rui Barbosa • Jundiaí
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
