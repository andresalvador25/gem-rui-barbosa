import React, { useState } from 'react';
import {
  Music,
  Lock,
  Mail,
  User,
  LogIn,
  UserPlus,
  Shield,
  BookOpen,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function LoginView({ localidade = 'Vila Rui Barbosa', cidade = 'Jundiaí - SP', onLoginSuccess }) {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'

  // Login State
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  // Cadastro State
  const [nomeCad, setNomeCad] = useState('');
  const [emailCad, setEmailCad] = useState('');
  const [senhaCad, setSenhaCad] = useState('');
  const [confirmaSenhaCad, setConfirmaSenhaCad] = useState('');
  const [roleSolicitado, setRoleSolicitado] = useState('candidato');
  const [observacaoCadastro, setObservacaoCadastro] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucessoCadastro, setSucessoCadastro] = useState('');

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    await realizarLogin(emailLogin, senhaLogin);
  };

  const realizarLogin = async (loginUser, loginPass) => {
    setErro('');
    setSucessoCadastro('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginUser, username: loginUser, senha: loginPass })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErro(json.message || 'E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }
      onLoginSuccess(json.user, json.token);
    } catch (err) {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setSucessoCadastro('');

    if (senhaCad.length < 4) {
      setErro('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (senhaCad !== confirmaSenhaCad) {
      setErro('As senhas digitadas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCad,
          email: emailCad,
          senha: senhaCad,
          roleSolicitado,
          observacaoCadastro
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErro(json.message || 'Não foi possível realizar o cadastro.');
        setLoading(false);
        return;
      }
      setSucessoCadastro(
        json.message ||
          'Solicitação de acesso enviada! O Administrador (ADM) irá liberar seu acesso e definir suas permissões.'
      );
      setEmailLogin(emailCad);
      setNomeCad('');
      setEmailCad('');
      setSenhaCad('');
      setConfirmaSenhaCad('');
      setObservacaoCadastro('');
      setModo('login');
    } catch {
      setErro('Erro ao conectar ao servidor para enviar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full space-y-5 animate-fadeIn">
        {/* Identificação CCB */}
        <div className="text-center text-white space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shadow-lg">
            <Music className="w-7 h-7 text-blue-300" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">SAM MUSICAL</h1>
            <span className="bg-blue-700 text-blue-100 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-500">
              CCB
            </span>
          </div>
          <p className="text-xs text-blue-200/80 font-medium">
            {localidade} • {cidade}
          </p>
        </div>

        {/* Cartão Principal */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Seletor de Modo: Entrar vs Criar Conta */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                modo === 'login'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar com E-mail</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('cadastro');
                setErro('');
                setSucessoCadastro('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                modo === 'cadastro'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Conta / Acesso</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            {sucessoCadastro && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-3 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-emerald-900">Cadastro enviado para o ADM!</p>
                  <p>{sucessoCadastro}</p>
                </div>
              </div>
            )}

            {modo === 'login' ? (
              <>
                <div>
                  <h2 className="text-base font-black text-slate-900">Acessar o Sistema</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Entre com seu <strong>E-mail</strong> e <strong>Senha</strong> liberados pelo Administrador.
                  </p>
                </div>

                <form onSubmit={handleSubmitLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">E-mail (ou Usuário)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={emailLogin}
                        onChange={e => setEmailLogin(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={senhaLogin}
                        onChange={e => setSenhaLogin(e.target.value)}
                        placeholder="Digite sua senha"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-black py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
                  </button>
                </form>

                {/* Atalhos Rápidos de Demonstração / Acesso Rápido */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
                    Acesso Rápido — Testar Perfis
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => realizarLogin('encarregado', 'admin123')}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 transition"
                      title="ADM | Senha: admin123"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-black leading-tight">ADM / Encar.</span>
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => realizarLogin('instrutor', '123456')}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 transition"
                      title="Instrutor | Senha: 123456"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-black leading-tight">Instrutor</span>
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => realizarLogin('candidato', '123456')}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition"
                      title="Candidato / Responsável | Senha: 123456"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-black leading-tight">Candidato / Pai</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-base font-black text-slate-900">Solicitar Acesso</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Crie seu acesso com e-mail e senha. O <strong>ADM</strong> irá aprovar seu cadastro e liberar as informações correspondentes.
                  </p>
                </div>

                <form onSubmit={handleSubmitCadastro} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Seu Nome Completo *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={nomeCad}
                        onChange={e => setNomeCad(e.target.value)}
                        placeholder="Ex: João Evangelista (Pai) ou Davi Evangelista"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Seu E-mail de Acesso *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={emailCad}
                        onChange={e => setEmailCad(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Criar Senha *</label>
                      <input
                        type="password"
                        required
                        value={senhaCad}
                        onChange={e => setSenhaCad(e.target.value)}
                        placeholder="Mín. 4 dígitos"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Confirmar Senha *</label>
                      <input
                        type="password"
                        required
                        value={confirmaSenhaCad}
                        onChange={e => setConfirmaSenhaCad(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Qual tipo de acesso você precisa? *</label>
                    <select
                      value={roleSolicitado}
                      onChange={e => setRoleSolicitado(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="candidato">🎵 Candidato(a) ou Pai / Responsável (Acompanhar Aluno)</option>
                      <option value="instrutor">📘 Instrutor(a) / Examinadora do GEM</option>
                      <option value="encarregado">🎼 Encarregado (Local / Regional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Identificação / Nome do(s) Candidato(s) que vai acompanhar
                    </label>
                    <input
                      type="text"
                      value={observacaoCadastro}
                      onChange={e => setObservacaoCadastro(e.target.value)}
                      placeholder="Ex: Sou pai do Davi e do Lucas / Instrutor de Cordas"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Ajuda o Administrador a vincular sua conta aos alunos ou módulos corretos.
                    </span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Após cadastrar, seu acesso ficará <strong>Aguardando Liberação do ADM</strong>.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Enviando...' : 'Solicitar Cadastro'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
