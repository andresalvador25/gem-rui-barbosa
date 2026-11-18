import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Search, 
  Eye, 
  CheckSquare, 
  Download, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function FichasView({ fichas, config, musicos }) {
  const [busca, setBusca] = useState('');
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');

  const fichasLista = fichas || [];

  const filteredFichas = fichasLista.filter(f => 
    f.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    f.categoria.toLowerCase().includes(busca.toLowerCase()) ||
    f.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded">
              CCB SAM
            </span>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Acervo de Fichas e Formulários Oficiais CCB</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Índice completo dos 20 modelos e fichas padronizadas para administração musical e GEM.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar ficha ou formulário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Grid of Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFichas.map((ficha) => (
          <div 
            key={ficha.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  {ficha.codigo}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {ficha.categoria}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">
                {ficha.id}. {ficha.titulo}
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {ficha.descricao}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Modelo Oficial CCB
              </span>
              <button
                onClick={() => setSelectedFicha(ficha)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Visualizador de Impressão */}
      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-300 my-8">
            
            {/* Modal Bar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Visualização de Documento Oficial</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintDocument}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Formulário</span>
                </button>
                <button onClick={() => setSelectedFicha(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable Sheet */}
            <div className="p-8 bg-white text-slate-900 space-y-6 print:p-0">
              
              {/* CCB Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  CONGREGAÇÃO CRISTÃ NO BRASIL
                </p>
                <h2 className="text-lg font-black tracking-tight uppercase mt-0.5">
                  {selectedFicha.titulo}
                </h2>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                  <span>Localidade: <strong>{config?.localidade}</strong></span>
                  <span>•</span>
                  <span>Cidade: <strong>{config?.cidade}</strong></span>
                  <span>•</span>
                  <span>Código: <strong>{selectedFicha.codigo}</strong></span>
                </div>
              </div>

              {/* Form Content Preview */}
              <div className="space-y-4 text-xs">
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-3">1. Dados do Candidato / Músico</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Nome Completo:</span>
                      <p className="font-bold border-b border-dotted border-slate-400 pb-1">____________________________________________</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Instrumento / Tom:</span>
                      <p className="font-bold border-b border-dotted border-slate-400 pb-1">____________________________________________</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Fase Atual no MSA:</span>
                      <p className="font-bold border-b border-dotted border-slate-400 pb-1">Fase _____ (Módulos Concluídos: _____)</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Telefone de Contato:</span>
                      <p className="font-bold border-b border-dotted border-slate-400 pb-1">____________________________________________</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2">2. Parecer do Corpo de Instrutores e Encarregados</h4>
                  <p className="text-slate-600 text-justify leading-relaxed mb-4">
                    {selectedFicha.descricao} O presente formulário é submetido à apreciação do Encarregado Local e Regional conforme as diretrizes do Manual de Orientação Orquestral (MOO) da Congregação Cristã no Brasil.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Aptidão Técnica / Teórica:</span>
                      <div className="flex gap-4 mt-1 font-bold">
                        <span>(  ) Aprovado</span>
                        <span>(  ) Em Desenvolvimento</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Frequência no GEM / Ensaios:</span>
                      <div className="flex gap-4 mt-1 font-bold">
                        <span>(  ) Regular</span>
                        <span>(  ) Insuficiente</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
                  <div>
                    <p className="border-t border-slate-400 pt-1 font-bold">Assinatura do Instrutor Responsável</p>
                  </div>
                  <div>
                    <p className="border-t border-slate-400 pt-1 font-bold">Assinatura do Encarregado Local</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
