import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Sparkles,
  Star,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Heart,
  MessageCircle,
  Trash2,
  Clock,
  User,
  Share2
} from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, currentUser }) {
  const [tipo, setTipo] = useState('Sugestão');
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [avaliacao, setAvaliacao] = useState(5);
  const [hoverAvaliacao, setHoverAvaliacao] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  // Para administradores: visualização de feedbacks recebidos
  const [abaAtiva, setAbaAtiva] = useState('enviar'); // 'enviar' ou 'lista'
  const [feedbacks, setFeedbacks] = useState([]);
  const [carregandoFeedbacks, setCarregandoFeedbacks] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      if (currentUser?.nome) {
        setNome(currentUser.nome);
      } else if (!nome) {
        setNome('');
      }
      setSucesso(false);
      setErro('');
      if (isAdmin) {
        carregarFeedbacks();
      }
    }
  }, [isOpen, currentUser]);

  const carregarFeedbacks = async () => {
    setCarregandoFeedbacks(true);
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.feedbacks)) {
          setFeedbacks(json.feedbacks);
          setCarregandoFeedbacks(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend feedback offline, usando local');
    }

    // Fallback localStorage
    try {
      const saved = localStorage.getItem('sam_feedbacks_storage');
      if (saved) {
        setFeedbacks(JSON.parse(saved));
      }
    } catch (e) {}
    setCarregandoFeedbacks(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) {
      setErro('Por favor, escreva uma mensagem antes de enviar.');
      return;
    }

    setEnviando(true);
    setErro('');

    const novoFeedback = {
      id: Date.now(),
      tipo,
      mensagem: mensagem.trim(),
      nome: nome.trim() || 'Irmão(ã) da CCB',
      avaliacao: Number(avaliacao) || 5,
      criadoEm: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoFeedback)
      });
      if (!res.ok) throw new Error('Falha ao enviar ao servidor');
    } catch (e) {
      console.warn('Salvando feedback localmente:', e);
    }

    // Grava também no localStorage para redundância
    try {
      const saved = localStorage.getItem('sam_feedbacks_storage');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(novoFeedback);
      localStorage.setItem('sam_feedbacks_storage', JSON.stringify(list));
      setFeedbacks(list);
    } catch (e) {}

    setEnviando(false);
    setSucesso(true);
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Deseja excluir este feedback?')) return;
    try {
      await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const updated = feedbacks.filter(f => f.id !== id);
    setFeedbacks(updated);
    try {
      localStorage.setItem('sam_feedbacks_storage', JSON.stringify(updated));
    } catch (e) {}
  };

  // Gerar link do WhatsApp para envio direto
  const handleEnviarWhatsApp = () => {
    const texto = `*Feedback SAM Musical CCB - Vila Rui Barbosa*\n\n` +
      `📌 *Tipo:* ${tipo}\n` +
      `👤 *Nome:* ${nome.trim() || 'Irmão(ã)'}\n` +
      `⭐ *Nota:* ${'⭐'.repeat(avaliacao)}\n\n` +
      `💬 *Mensagem / Sugestão:*\n${mensagem.trim() || '(Não informada)'}`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const tipos = [
    { label: 'Sugestão', icon: Sparkles, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { label: 'Problema / Erro', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { label: 'Elogio', icon: Heart, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { label: 'Outro', icon: MessageCircle, color: 'text-blue-500 bg-blue-50 border-blue-200' }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Elegante */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                Ajude a Melhorar o SAM Musical
              </h3>
              <p className="text-[11px] text-slate-300">
                Sua sugestão ou relato é fundamental para nós!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas para Administradores */}
        {isAdmin && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 shrink-0">
            <button
              type="button"
              onClick={() => setAbaAtiva('enviar')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                abaAtiva === 'enviar'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ✍️ Enviar Novo Feedback
            </button>
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('lista');
                carregarFeedbacks();
              }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                abaAtiva === 'lista'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📋 Feedbacks Recebidos</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {feedbacks.length}
              </span>
            </button>
          </div>
        )}

        {/* Conteúdo com rolagem */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {abaAtiva === 'enviar' ? (
            sucesso ? (
              <div className="text-center py-8 space-y-3 animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 text-base">
                  Deus abençoe pela sua colaboração!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Sua mensagem foi registrada com sucesso. Vamos analisar sua contribuição com muito carinho para continuar melhorando o sistema.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMensagem('');
                      setSucesso(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Enviar Outro Feedback
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    Concluir e Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Tipo de Feedback */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-600 tracking-wider block">
                    O que você gostaria de nos dizer?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {tipos.map(t => {
                      const IconComp = t.icon;
                      const isSelected = tipo === t.label;
                      return (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setTipo(t.label)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Avaliação por Estrelas */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">
                      Como você avalia a sua experiência no app?
                    </span>
                    <span className="text-xs font-black text-amber-500">
                      {avaliacao} / 5 ⭐
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAvaliacao(star)}
                        onMouseEnter={() => setHoverAvaliacao(star)}
                        onMouseLeave={() => setHoverAvaliacao(0)}
                        className="p-1 transition transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverAvaliacao || avaliacao) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Mensagem */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-600 tracking-wider block">
                    Sua Mensagem ou Ideia <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Ex: Gostaria de sugerir uma forma mais rápida de marcar presença, ou notei que no meu celular o botão X ficou pequeno..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                    required
                  />
                </div>

                {/* 4. Nome / Identificação (Opcional) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Seu Nome (Opcional)
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Irmão David (Violino) ou Deixe em branco para anônimo"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {erro && (
                  <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {erro}
                  </p>
                )}

                {/* Botões de Ação */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{enviando ? 'Enviando...' : 'Enviar Feedback no Sistema'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnviarWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                    title="Abre o WhatsApp com sua mensagem pronta para enviar ao encarregado ou grupo"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Enviar também via WhatsApp 📱</span>
                  </button>
                </div>

              </form>
            )
          ) : (
            /* Lista de Feedbacks (Visualização Admin) */
            <div className="space-y-3">
              {carregandoFeedbacks ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Carregando feedbacks...
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                  <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold">Nenhum feedback recebido ainda.</p>
                </div>
              ) : (
                feedbacks.map((fb) => {
                  const dataFmt = fb.criadoEm ? new Date(fb.criadoEm).toLocaleString('pt-BR') : '-';
                  return (
                    <div
                      key={fb.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">
                            {fb.tipo || 'Sugestão'}
                          </span>
                          <span className="text-amber-500 font-bold">
                            {'⭐'.repeat(fb.avaliacao || 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dataFmt}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteFeedback(fb.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Excluir feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-slate-200/80">
                        "{fb.mensagem}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Por: <strong className="text-slate-700">{fb.nome || 'Anônimo'}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400 px-5 shrink-0">
          <span>SAM Musical • CCB Vila Rui Barbosa</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold text-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
