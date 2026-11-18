import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  KeyRound,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  UserCheck,
  Lock
} from 'lucide-react';
import {
  ROLES,
  ROLE_META,
  PERMISSION_LABELS,
  getRoleMeta,
  getDefaultPermissionsForRole,
  getUserAlunoIds
} from '../utils/auth.js';

export default function PerfisModal({ isOpen, onClose, alunosGem = [], currentUser, onUsersChanged }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [aba, setAba] = useState('usuarios'); // 'usuarios' | 'candidatos_vinculos' | 'permissoes'
  const [buscaAluno, setBuscaAluno] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'pendentes' | 'ativos'

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    username: '',
    senha: '',
    role: ROLES.CANDIDATO,
    alunoIds: [],
    permissoes: getDefaultPermissionsForRole(ROLES.CANDIDATO),
    observacaoCadastro: '',
    ativo: true
  });

  const alunosOrdenados = useMemo(
    () =>
      [...alunosGem].sort((a, b) =>
        (a?.nome || '').trim().localeCompare((b?.nome || '').trim(), 'pt-BR', { sensitivity: 'base' })
      ),
    [alunosGem]
  );

  const alunosFiltrados = useMemo(() => {
    const q = buscaAluno.trim().toLowerCase();
    if (!q) return alunosOrdenados;
    return alunosOrdenados.filter(
      a =>
        (a.nome || '').toLowerCase().includes(q) ||
        (a.instrumento || '').toLowerCase().includes(q) ||
        (a.cargo || '').toLowerCase().includes(q)
    );
  }, [alunosOrdenados, buscaAluno]);

  // Mapa de quantos/quais acessos cada aluno possui
  const acessosPorAluno = useMemo(() => {
    const map = {};
    users.forEach(u => {
      const ids = getUserAlunoIds(u);
      ids.forEach(aid => {
        if (!map[aid]) map[aid] = [];
        map[aid].push(u);
      });
    });
    return map;
  }, [users]);

  const pendentesCount = useMemo(
    () => users.filter(u => u.status === 'pendente' || u.ativo === false).length,
    [users]
  );

  const carregarUsers = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch('/api/auth/users');
      const json = await res.json();
      if (res.ok && json.users) {
        setUsers(json.users);
        if (onUsersChanged) onUsersChanged(json.users);
      } else {
        setErro(json.message || 'Erro ao carregar usuários.');
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarUsers();
      limparForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const limparForm = () => {
    setEditId(null);
    setBuscaAluno('');
    setForm({
      nome: '',
      email: '',
      username: '',
      senha: '',
      role: ROLES.CANDIDATO,
      alunoIds: [],
      permissoes: getDefaultPermissionsForRole(ROLES.CANDIDATO),
      observacaoCadastro: '',
      ativo: true
    });
  };

  const handleRoleChange = (novoRole) => {
    setForm(prev => ({
      ...prev,
      role: novoRole,
      permissoes: getDefaultPermissionsForRole(novoRole)
    }));
  };

  const toggleAlunoId = (id) => {
    const numId = Number(id) || id;
    setForm(prev => {
      const exists = prev.alunoIds.some(x => String(x) === String(numId));
      const next = exists
        ? prev.alunoIds.filter(x => String(x) !== String(numId))
        : [...prev.alunoIds, numId];
      return { ...prev, alunoIds: next };
    });
  };

  const togglePermissao = (key) => {
    setForm(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [key]: !prev.permissoes?.[key]
      }
    }));
  };

  const handleEdit = (u, aprovarDireto = false) => {
    const role = u.role || u.roleSolicitado || ROLES.CANDIDATO;
    const basePerms = getDefaultPermissionsForRole(role);
    const mergedPerms = u.permissoes ? { ...basePerms, ...u.permissoes } : basePerms;

    setEditId(u.id);
    setForm({
      nome: u.nome || '',
      email: u.email || u.username || '',
      username: u.username || u.email || '',
      senha: '',
      role,
      alunoIds: getUserAlunoIds(u),
      permissoes: mergedPerms,
      observacaoCadastro: u.observacaoCadastro || '',
      ativo: aprovarDireto ? true : u.ativo !== false
    });
    setAba('usuarios');
    if (aprovarDireto) {
      setSucesso(
        `Configurando liberação de "${u.nome}". Escolha o perfil, candidatos vinculados e permissões abaixo e clique em "Salvar e Liberar Acesso".`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    try {
      const payload = {
        ...form,
        id: editId || undefined,
        username: form.email || form.username,
        alunoIds: form.alunoIds,
        permissoes: form.permissoes
      };
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErro(json.message || 'Não foi possível salvar usuário.');
        return;
      }
      setSucesso(
        editId
          ? `Acesso e permissões de "${form.nome}" salvos com sucesso!`
          : `Novo acesso criado e liberado para "${form.nome}"!`
      );
      limparForm();
      await carregarUsers();
    } catch {
      setErro('Erro ao conectar ao servidor.');
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Deseja excluir o acesso de "${u.nome}" (${u.email || u.username})?`)) return;
    setErro('');
    setSucesso('');
    try {
      const res = await fetch(`/api/auth/users/${u.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErro(json.message || 'Erro ao excluir.');
        return;
      }
      setSucesso('Usuário removido com sucesso.');
      await carregarUsers();
    } catch {
      setErro('Erro de conexão ao excluir.');
    }
  };

  const usuariosExibidos = useMemo(() => {
    const list = [...users].sort((a, b) => {
      const aPend = a.status === 'pendente' || a.ativo === false ? 0 : 1;
      const bPend = b.status === 'pendente' || b.ativo === false ? 0 : 1;
      if (aPend !== bPend) return aPend - bPend;
      return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
    });
    if (filtroStatus === 'pendentes') {
      return list.filter(u => u.status === 'pendente' || u.ativo === false);
    }
    if (filtroStatus === 'ativos') {
      return list.filter(u => u.ativo !== false && u.status !== 'pendente');
    }
    return list;
  }, [users, filtroStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base">
                  Painel do Administrador (ADM) — Liberação de Acessos e Permissões
                </h3>
                {pendentesCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {pendentesCount} aguardando liberação
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-200/80">
                Aprove quem se cadastrou, defina o perfil (Encarregado, Instrutor, Candidato/Pai), vincule 1 ou mais alunos e escolha quais informações cada pessoa pode acessar.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-abas do Modal */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAba('usuarios')}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                aba === 'usuarios'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuários & Liberação ({users.length})</span>
            </button>
            <button
              onClick={() => setAba('candidatos_vinculos')}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                aba === 'candidatos_vinculos'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Vínculos por Candidato (Pais / Alunos)</span>
            </button>
            <button
              onClick={() => setAba('permissoes')}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                aba === 'permissoes'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Resumo dos Perfis</span>
            </button>
          </div>

          {aba === 'usuarios' && (
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-[11px]">
              <button
                type="button"
                onClick={() => setFiltroStatus('todos')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  filtroStatus === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('pendentes')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  filtroStatus === 'pendentes'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-amber-800 hover:bg-amber-100'
                }`}
              >
                ⏳ Pendentes ({pendentesCount})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('ativos')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  filtroStatus === 'ativos'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                ✅ Liberados ({users.length - pendentesCount})
              </button>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}
          {sucesso && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{sucesso}</span>
            </div>
          )}

          {aba === 'usuarios' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Formulário de Criação / Aprovação / Edição */}
              <form
                onSubmit={handleSubmit}
                className="lg:col-span-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="font-black text-slate-900 uppercase text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    {editId ? 'Editar / Liberar Acesso do Usuário' : 'Cadastrar Novo Acesso (ADM)'}
                  </h4>
                  {editId && (
                    <button
                      type="button"
                      onClick={limparForm}
                      className="text-[11px] text-blue-600 font-bold hover:underline"
                    >
                      + Criar novo acesso em branco
                    </button>
                  )}
                </div>

                {/* Dados básicos: Nome, E-mail e Senha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={form.nome}
                      onChange={e => setForm({ ...form, nome: e.target.value })}
                      placeholder="Ex: João Evangelista (Pai do Davi)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">E-mail de Login *</label>
                    <input
                      type="text"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value, username: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {editId ? 'Redefinir Senha (opcional)' : 'Senha de Acesso *'}
                    </label>
                    <input
                      type="password"
                      required={!editId}
                      value={form.senha}
                      onChange={e => setForm({ ...form, senha: e.target.value })}
                      placeholder={editId ? 'Em branco mantém a senha atual' : 'Mínimo 4 caracteres'}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Perfil Principal *</label>
                    <select
                      value={form.role}
                      onChange={e => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                    >
                      <option value={ROLES.ADMIN}>🛡️ Administrador (ADM)</option>
                      <option value={ROLES.ENCARREGADO}>🎼 Encarregado (Local / Regional)</option>
                      <option value={ROLES.INSTRUTOR}>📘 Instrutor(a) / Examinadora</option>
                      <option value={ROLES.CANDIDATO}>🎵 Candidato(a) / Responsável (Pai/Mãe)</option>
                    </select>
                  </div>
                </div>

                {form.observacaoCadastro && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900">
                    <span className="font-black uppercase block text-[10px] text-amber-700">
                      Observação informada no cadastro:
                    </span>
                    <span>"{form.observacaoCadastro}"</span>
                  </div>
                )}

                {/* VÍNCULO DE 1 OU MAIS CANDIDATOS (Múltiplos filhos por Responsável e Múltiplos acessos por Candidato) */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-emerald-950 uppercase text-[11px] block">
                        🎓 Candidato(s) Vinculado(s) a este Acesso ({form.alunoIds.length} selecionado{form.alunoIds.length === 1 ? '' : 's'})
                      </span>
                      <span className="text-[10px] text-emerald-800">
                        Você pode marcar <strong>1 ou vários candidatos</strong> (ex.: pai com 2 filhos no GEM), e o mesmo candidato pode ser vinculado a mais de um acesso.
                      </span>
                    </div>
                    {form.alunoIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, alunoIds: [] }))}
                        className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0"
                      >
                        Limpar seleção
                      </button>
                    )}
                  </div>

                  {/* Busca rápida de aluno */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={buscaAluno}
                      onChange={e => setBuscaAluno(e.target.value)}
                      placeholder="Buscar candidato por nome ou instrumento..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Lista de checkboxes de alunos */}
                  <div className="max-h-36 overflow-y-auto bg-white rounded-lg border border-emerald-200 divide-y divide-slate-100 p-1">
                    {alunosFiltrados.map(a => {
                      const checked = form.alunoIds.some(x => String(x) === String(a.id));
                      const vinculados = acessosPorAluno[a.id] || [];
                      return (
                        <label
                          key={a.id}
                          className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer transition ${
                            checked ? 'bg-emerald-100/80 font-bold text-emerald-950' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAlunoId(a.id)}
                              className="rounded border-emerald-400 text-emerald-600"
                            />
                            <span className="truncate">{a.nome}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">({a.instrumento})</span>
                          </div>
                          {vinculados.length > 0 && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold shrink-0">
                              {vinculados.length} acesso{vinculados.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* CONTROLE GRANULAR DE ACESSO ÀS INFORMAÇÕES */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 uppercase text-[11px]">
                      🔐 Qual acesso este usuário terá às informações?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm(prev => ({ ...prev, permissoes: getDefaultPermissionsForRole(prev.role) }))
                      }
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      Restaurar padrão do perfil
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {PERMISSION_LABELS.map(p => {
                      const isChecked = Boolean(form.permissoes?.[p.key]);
                      const disabled = form.role === ROLES.ADMIN && (p.key === 'gerenciarAcessos' || p.key === 'gerenciarConfig');
                      return (
                        <label
                          key={p.key}
                          title={p.desc}
                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                              : 'bg-slate-50/60 border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={isChecked}
                            onChange={() => togglePermissao(p.key)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600"
                          />
                          <div className="leading-tight">
                            <span className="font-bold block text-[11px]">{p.label}</span>
                            <span className="text-[9px] opacity-75">{p.group}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Status de Liberação */}
                <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={e => setForm({ ...form, ativo: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                    />
                    <div>
                      <span className="font-black text-slate-800 block">
                        {form.ativo ? '✅ Acesso Liberado (Ativo)' : '⏳ Acesso Bloqueado / Aguardando Liberação'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Desmarque caso queira suspender temporariamente o acesso deste usuário.
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-black py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editId
                      ? form.ativo
                        ? 'Salvar e Liberar Acesso'
                        : 'Salvar Alterações'
                      : 'Criar e Liberar Usuário'}
                  </span>
                </button>
              </form>

              {/* Lista de Usuários (Pendentes e Liberados) */}
              <div className="lg:col-span-6 space-y-2.5">
                <h4 className="font-black text-slate-800 uppercase text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Contas Cadastradas ({usuariosExibidos.length})
                  </span>
                </h4>

                {loading ? (
                  <p className="text-slate-400 py-8 text-center">Carregando usuários...</p>
                ) : usuariosExibidos.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400">
                    Nenhum usuário encontrado neste filtro.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                    {usuariosExibidos.map(u => {
                      const meta = getRoleMeta(u.role);
                      const idsVinc = getUserAlunoIds(u);
                      const nomesAlunos = idsVinc
                        .map(id => alunosGem.find(a => String(a.id) === String(id))?.nome)
                        .filter(Boolean);
                      const isPendente = u.status === 'pendente' || u.ativo === false;

                      return (
                        <div
                          key={u.id}
                          className={`p-3.5 rounded-xl border transition ${
                            isPendente
                              ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900 text-xs sm:text-sm">{u.nome}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${meta.pillClass}`}>
                                  {meta.shortLabel}
                                </span>
                                {isPendente ? (
                                  <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {u.status === 'pendente' ? 'Aguardando Liberação do ADM' : 'Bloqueado'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    Liberado
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                                <span>
                                  E-mail/Login: <strong className="text-slate-900">{u.email || u.username}</strong>
                                </span>
                              </div>

                              {u.observacaoCadastro && (
                                <p className="text-[11px] text-amber-900 bg-amber-100/70 px-2 py-1 rounded-lg">
                                  <strong>Solicitação:</strong> "{u.observacaoCadastro}"
                                </p>
                              )}

                              {nomesAlunos.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 pt-1">
                                  <span className="text-[10px] font-bold text-emerald-800">
                                    Candidato(s) vinculado(s) ({nomesAlunos.length}):
                                  </span>
                                  {nomesAlunos.map(nomeAl => (
                                    <span
                                      key={nomeAl}
                                      className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200"
                                    >
                                      🎵 {nomeAl}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isPendente && (
                                <button
                                  type="button"
                                  onClick={() => handleEdit(u, true)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-lg shadow-xs transition flex items-center gap-1"
                                  title="Configurar permissões e liberar acesso"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Liberar</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleEdit(u, false)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-slate-200 bg-white"
                                title="Editar acessos, senha e candidatos vinculados"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {String(currentUser?.id) !== String(u.id) && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(u)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-slate-200 bg-white"
                                  title="Excluir usuário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : aba === 'candidatos_vinculos' ? (
            /* Visão por Candidato: Mostra quais usuários (Próprio candidato, Pai, Mãe, etc.) acompanham cada aluno */
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900">
                <h4 className="font-black text-xs uppercase">
                  👨‍👩‍👦 Múltiplos Acessos por Candidato & Múltiplos Candidatos por Responsável
                </h4>
                <p className="text-[11px] mt-0.5">
                  Veja abaixo todos os alunos do GEM e quais contas de e-mail estão autorizadas a acompanhar cada um (ex.: login do próprio candidato + login do pai + login da mãe).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[450px] overflow-y-auto pr-1">
                {alunosOrdenados.map(a => {
                  const contas = acessosPorAluno[a.id] || [];
                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-black text-slate-900 block">{a.nome}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {a.instrumento} • {a.nivel}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            contas.length > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {contas.length} {contas.length === 1 ? 'acesso vinculado' : 'acessos vinculados'}
                        </span>
                      </div>

                      {contas.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                          {contas.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleEdit(c, false)}
                              className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1"
                              title="Clique para editar este usuário"
                            >
                              <span>👤 {c.nome}</span>
                              <span className="opacity-70">({c.email || c.username})</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">
                          Nenhum e-mail de candidato/pai vinculado ainda.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Resumo dos Perfis */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[ROLES.ADMIN, ROLES.ENCARREGADO, ROLES.INSTRUTOR, ROLES.CANDIDATO].map(r => {
                  const meta = ROLE_META[r];
                  return (
                    <div key={r} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-block ${meta.pillClass}`}>
                        {meta.label}
                      </span>
                      <p className="text-[11px] text-slate-600 pt-1">{meta.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
