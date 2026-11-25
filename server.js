const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'data.json');
const INITIAL_FILE = path.join(__dirname, 'initialData.json');
const BACKUP_FILE = path.join(__dirname, 'data_backup.json');
const GEM_FILE = path.join(__dirname, 'gem_database.json');
const USERS_FILE = path.join(__dirname, 'users_auth.json');
const AUTH_SECRET = process.env.AUTH_SECRET || 'sam-musical-ccb-vrb-2026-secret';

// ============================================================================
// MOTOR HÍBRIDO DE ARMAZENAMENTO: ARQUIVOS LOCAIS (.JSON) + SUPABASE CLOUD
// ============================================================================
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://gjvncchcvfqugyzduore.supabase.co'
)
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/i, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqdm5jY2hjdmZxdWd5emR1b3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjYyMTcsImV4cCI6MjExMDU0MjIxN30.vfMxgULKmuAiBW1pTGjXDzPwHqp8_J6IS3MBEMl9ERM';
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || 'sam_ccb_storage';

function isSupabaseEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

const cloudCache = {
  orquestra_data: null,
  gem_database: null,
  users_auth: null,
  feedbacks: null
};

let pendingCloudWrites = [];

async function supabaseUpsertKey(key, dataObj) {
  if (!isSupabaseEnabled()) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        key,
        data: dataObj,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error(`[Supabase] Erro ao salvar chave "${key}":`, res.status, txt);
    }
  } catch (err) {
    console.error(`[Supabase] Falha de conexão ao salvar "${key}":`, err.message);
  }
}

function queueCloudWrite(key, dataObj) {
  cloudCache[key] = dataObj;
  if (isSupabaseEnabled()) {
    const p = supabaseUpsertKey(key, dataObj);
    pendingCloudWrites.push(p);
  }
}

async function syncFromSupabaseIfEnabled() {
  if (!isSupabaseEnabled()) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=key,data`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return;
    const rows = await res.json();
    const foundKeys = new Set();
    if (Array.isArray(rows)) {
      rows.forEach(r => {
        if (r && r.key && r.data !== undefined) {
          cloudCache[r.key] = r.data;
          foundKeys.add(r.key);
        }
      });
    }

    // Auto-seed no primeiro acesso no Supabase (sobe automaticamente os dados locais iniciais!)
    const seedPromises = [];
    if (!foundKeys.has('orquestra_data')) {
      const localOrq = readLocalOrquestraFile();
      cloudCache.orquestra_data = localOrq;
      seedPromises.push(supabaseUpsertKey('orquestra_data', localOrq));
    }
    if (!foundKeys.has('gem_database')) {
      const localGem = readLocalGemFile();
      cloudCache.gem_database = localGem;
      seedPromises.push(supabaseUpsertKey('gem_database', localGem));
    }
    if (!foundKeys.has('users_auth')) {
      const localUsers = readLocalUsersFile();
      cloudCache.users_auth = { users: localUsers };
      seedPromises.push(supabaseUpsertKey('users_auth', { users: localUsers }));
    }
    if (seedPromises.length > 0) {
      await Promise.all(seedPromises);
    }
  } catch (err) {
    console.error('[Supabase] Erro ao sincronizar leitura:', err.message);
  }
}

// Middleware que garante leitura fresca do Supabase no início e conclusão da escrita antes da resposta (Vercel Serverless)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    await syncFromSupabaseIfEnabled();
    const origJson = res.json.bind(res);
    res.json = async function (body) {
      if (pendingCloudWrites.length > 0) {
        const toWait = [...pendingCloudWrites];
        pendingCloudWrites = [];
        await Promise.all(toWait);
      }
      return origJson(body);
    };
  }
  next();
});

const VALID_ROLES = ['admin', 'encarregado', 'instrutor', 'candidato'];

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHex] = storedHash.split(':');
  const derivedHex = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const a = Buffer.from(originalHex, 'hex');
  const b = Buffer.from(derivedHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signAuthToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 dias
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAuthToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function normalizeUserRecord(u) {
  if (!u) return null;
  const alunoIds = [];
  if (Array.isArray(u.alunoIds)) {
    u.alunoIds.forEach(id => {
      if (id !== null && id !== undefined && id !== '') {
        const val = Number(id) || id;
        if (!alunoIds.includes(val)) alunoIds.push(val);
      }
    });
  }
  if (u.alunoId !== null && u.alunoId !== undefined && u.alunoId !== '') {
    const val = Number(u.alunoId) || u.alunoId;
    if (!alunoIds.includes(val)) alunoIds.push(val);
  }
  return {
    ...u,
    email: u.email || u.username || '',
    username: u.username || u.email || '',
    alunoIds,
    alunoId: alunoIds.length > 0 ? alunoIds[0] : null,
    status: u.status || (u.ativo === false ? 'bloqueado' : 'aprovado'),
    permissoes: u.permissoes || null
  };
}

function sanitizeUser(u) {
  if (!u) return null;
  const norm = normalizeUserRecord(u);
  const { passwordHash, ...safe } = norm;
  return safe;
}

function readLocalUsersFile() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      let exampleAlunoId = null;
      try {
        if (fs.existsSync(GEM_FILE)) {
          const gemParsed = JSON.parse(fs.readFileSync(GEM_FILE, 'utf-8'));
          const davi = (gemParsed.alunos || []).find(a => (a.nome || '').toUpperCase().includes('DAVI EVANGELISTA'));
          exampleAlunoId = davi ? davi.id : (gemParsed.alunos?.[0]?.id || null);
        }
      } catch {}

      const initialUsers = [
        {
          id: 1,
          nome: 'Administrador (ADM)',
          username: 'encarregado',
          email: 'andresalvador4@gmail.com',
          role: 'admin',
          alunoIds: [],
          alunoId: null,
          status: 'aprovado',
          ativo: true,
          permissoes: null,
          passwordHash: hashPassword('admin123'),
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Instrutor GEM',
          username: 'instrutor',
          email: 'instrutor@sammusical.com',
          role: 'instrutor',
          alunoIds: [],
          alunoId: null,
          status: 'aprovado',
          ativo: true,
          permissoes: null,
          passwordHash: hashPassword('123456'),
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          nome: 'Davi Evangelista (Candidato / Resp.)',
          username: 'candidato',
          email: 'candidato@sammusical.com',
          role: 'candidato',
          alunoIds: exampleAlunoId ? [exampleAlunoId] : [],
          alunoId: exampleAlunoId,
          status: 'aprovado',
          ativo: true,
          permissoes: null,
          passwordHash: hashPassword('123456'),
          createdAt: new Date().toISOString()
        }
      ];
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: initialUsers }, null, 2), 'utf-8');
      } catch {}
      return initialUsers.map(normalizeUserRecord);
    }
    const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    return Array.isArray(parsed.users) ? parsed.users.map(normalizeUserRecord) : [];
  } catch (e) {
    console.error('Erro ao ler users_auth.json:', e);
    return [];
  }
}

function getUsersData() {
  if (isSupabaseEnabled() && cloudCache.users_auth && Array.isArray(cloudCache.users_auth.users)) {
    return cloudCache.users_auth.users.map(normalizeUserRecord);
  }
  return readLocalUsersFile();
}

function saveUsersData(users) {
  const normalized = (users || []).map(normalizeUserRecord);
  queueCloudWrite('users_auth', { users: normalized });
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: normalized }, null, 2), 'utf-8');
  } catch (e) {
    // Em ambiente Serverless (Vercel), o sistema usa o Supabase; escrita em disco local é ignorada
  }
}

app.use((req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const decoded = verifyAuthToken(token);
    if (decoded) {
      const users = getUsersData();
      const found = users.find(u => u.id === decoded.id && u.ativo !== false);
      if (found) {
        req.user = sanitizeUser(found);
      }
    }
  }
  next();
});

function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Autenticação necessária.' });
    }
    const isAdminOrEncarregado =
      (allowedRoles.includes('admin') || allowedRoles.includes('encarregado')) &&
      (req.user.role === 'admin' || req.user.role === 'encarregado' || req.user.permissoes?.gerenciarAcessos === true);
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role) && !isAdminOrEncarregado) {
      return res.status(403).json({ success: false, message: 'Seu perfil não possui permissão para esta ação.' });
    }
    next();
  };
}

// Endpoints de Autenticação, Auto-Cadastro e Liberação pelo ADM
app.post('/api/auth/login', (req, res) => {
  const { username, email, senha } = req.body || {};
  const loginNorm = String(email || username || '').trim().toLowerCase();
  if (!loginNorm || !senha) {
    return res.status(400).json({ success: false, message: 'Informe seu e-mail e senha.' });
  }
  const users = getUsersData();
  const user = users.find(
    u => (u.email || '').toLowerCase() === loginNorm || (u.username || '').toLowerCase() === loginNorm
  );
  if (!user || !verifyPassword(senha, user.passwordHash)) {
    return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
  }
  if (user.status === 'pendente') {
    return res.status(403).json({
      success: false,
      status: 'pendente',
      message: 'Seu cadastro já foi recebido e está aguardando a liberação do Administrador (ADM).'
    });
  }
  if (user.ativo === false) {
    return res.status(403).json({
      success: false,
      status: 'bloqueado',
      message: 'Este acesso está aguardando liberação ou foi desativado pelo Administrador (ADM).'
    });
  }
  const safeUser = sanitizeUser(user);
  const token = signAuthToken(safeUser);
  res.json({ success: true, user: safeUser, token });
});

// Auto-cadastro público (fica pendente até o ADM liberar e definir permissões)
app.post('/api/auth/register', (req, res) => {
  const { nome, email, senha, roleSolicitado, observacaoCadastro } = req.body || {};
  const cleanNome = String(nome || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanSenha = String(senha || '').trim();
  const cleanRoleSol = ['encarregado', 'instrutor', 'candidato'].includes(roleSolicitado)
    ? roleSolicitado
    : 'candidato';

  if (!cleanNome || !cleanEmail) {
    return res.status(400).json({ success: false, message: 'Informe seu nome completo e e-mail.' });
  }
  if (!cleanEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'Informe um endereço de e-mail válido.' });
  }
  if (cleanSenha.length < 4) {
    return res.status(400).json({ success: false, message: 'Crie uma senha com pelo menos 4 caracteres.' });
  }

  const users = getUsersData();
  const duplicate = users.find(
    u => (u.email || '').toLowerCase() === cleanEmail || (u.username || '').toLowerCase() === cleanEmail
  );
  if (duplicate) {
    if (duplicate.status === 'pendente') {
      return res.status(409).json({
        success: false,
        message: 'Este e-mail já foi cadastrado e está aguardando liberação do Administrador (ADM).'
      });
    }
    return res.status(409).json({
      success: false,
      message: 'Já existe uma conta cadastrada com este e-mail.'
    });
  }

  const novo = normalizeUserRecord({
    id: Date.now(),
    nome: cleanNome,
    username: cleanEmail,
    email: cleanEmail,
    role: cleanRoleSol,
    roleSolicitado: cleanRoleSol,
    observacaoCadastro: String(observacaoCadastro || '').trim(),
    alunoIds: [],
    alunoId: null,
    permissoes: null,
    status: 'pendente',
    ativo: false,
    passwordHash: hashPassword(cleanSenha),
    createdAt: new Date().toISOString()
  });

  users.push(novo);
  saveUsersData(users);

  res.json({
    success: true,
    message: 'Cadastro realizado com sucesso! Agora aguarde o Administrador (ADM) liberar seu acesso.'
  });
});

app.get('/api/auth/me', requireRoles([]), (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/auth/users', requireRoles(['admin', 'encarregado']), (req, res) => {
  const users = getUsersData().map(sanitizeUser);
  res.json({ success: true, users });
});

app.post('/api/auth/users', requireRoles(['admin', 'encarregado']), (req, res) => {
  const {
    id,
    nome,
    username,
    email,
    senha,
    role,
    alunoId,
    alunoIds,
    permissoes,
    status,
    ativo,
    observacaoCadastro
  } = req.body || {};

  const cleanEmail = String(email || username || '').trim().toLowerCase();
  const cleanUser = String(username || cleanEmail).trim().toLowerCase();
  const cleanNome = String(nome || '').trim();
  const cleanRole = VALID_ROLES.includes(role) ? role : 'candidato';

  if (!cleanNome || !cleanEmail) {
    return res.status(400).json({ success: false, message: 'Nome completo e e-mail são obrigatórios.' });
  }

  // Normaliza lista de alunos vinculados (permite 1 ou vários candidatos vinculados ao mesmo responsável/candidato)
  const parsedAlunoIds = [];
  if (Array.isArray(alunoIds)) {
    alunoIds.forEach(aid => {
      if (aid !== null && aid !== undefined && aid !== '') {
        const val = Number(aid) || aid;
        if (!parsedAlunoIds.includes(val)) parsedAlunoIds.push(val);
      }
    });
  } else if (alunoId !== null && alunoId !== undefined && alunoId !== '') {
    const val = Number(alunoId) || alunoId;
    parsedAlunoIds.push(val);
  }

  const users = getUsersData();
  const duplicate = users.find(
    u =>
      ((u.email || '').toLowerCase() === cleanEmail || (u.username || '').toLowerCase() === cleanUser) &&
      String(u.id) !== String(id)
  );
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'Já existe outro usuário com este e-mail/login.' });
  }

  if (id) {
    const idx = users.findIndex(u => String(u.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    const isAtivo = ativo !== undefined ? Boolean(ativo) : users[idx].ativo;
    const novoStatus = isAtivo ? 'aprovado' : (status === 'pendente' ? 'pendente' : 'bloqueado');

    const updated = normalizeUserRecord({
      ...users[idx],
      nome: cleanNome,
      username: cleanUser,
      email: cleanEmail,
      role: cleanRole,
      alunoIds: parsedAlunoIds,
      alunoId: parsedAlunoIds.length > 0 ? parsedAlunoIds[0] : null,
      permissoes: permissoes && typeof permissoes === 'object' ? permissoes : users[idx].permissoes || null,
      observacaoCadastro: observacaoCadastro !== undefined ? String(observacaoCadastro) : (users[idx].observacaoCadastro || ''),
      ativo: isAtivo,
      status: novoStatus
    });
    if (senha && String(senha).trim()) {
      updated.passwordHash = hashPassword(String(senha).trim());
    }
    users[idx] = updated;
    saveUsersData(users);
    return res.json({ success: true, user: sanitizeUser(updated) });
  }

  if (!senha || String(senha).trim().length < 4) {
    return res.status(400).json({ success: false, message: 'Informe uma senha com pelo menos 4 caracteres.' });
  }

  const isAtivo = ativo !== undefined ? Boolean(ativo) : true;
  const novo = normalizeUserRecord({
    id: Date.now(),
    nome: cleanNome,
    username: cleanUser,
    email: cleanEmail,
    role: cleanRole,
    alunoIds: parsedAlunoIds,
    alunoId: parsedAlunoIds.length > 0 ? parsedAlunoIds[0] : null,
    permissoes: permissoes && typeof permissoes === 'object' ? permissoes : null,
    observacaoCadastro: String(observacaoCadastro || '').trim(),
    ativo: isAtivo,
    status: isAtivo ? 'aprovado' : 'pendente',
    passwordHash: hashPassword(String(senha).trim()),
    createdAt: new Date().toISOString()
  });
  users.push(novo);
  saveUsersData(users);
  res.json({ success: true, user: sanitizeUser(novo) });
});

app.delete('/api/auth/users/:id', requireRoles(['admin', 'encarregado']), (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  if (String(req.user.id) === String(id)) {
    return res.status(400).json({ success: false, message: 'Você não pode excluir o próprio usuário conectado.' });
  }
  const users = getUsersData();
  const target = users.find(u => String(u.id) === String(id));
  if (!target) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
  }
  const adminsAtivos = users.filter(u => u.role === 'admin' && u.ativo !== false && String(u.id) !== String(id));
  if (target.role === 'admin' && adminsAtivos.length === 0) {
    return res.status(400).json({ success: false, message: 'Deve permanecer ao menos um Administrador (ADM) ativo.' });
  }
  saveUsersData(users.filter(u => String(u.id) !== String(id)));
  res.json({ success: true, id });
});

const DEFAULT_EMPTY = {
  config: {
    localidade: 'Vila Rui Barbosa',
    cidade: 'Jundiaí - SP',
    tipoOrquestra: 'Simples',
    quantidadeDesejada: 32,
    ultimaAtualizacao: new Date().toISOString()
  },
  integrantes: []
};

function readLocalOrquestraFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return DEFAULT_EMPTY;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.integrantes) parsed.integrantes = [];
    if (!parsed.config) parsed.config = DEFAULT_EMPTY.config;
    return parsed;
  } catch (e) {
    console.error('Erro ao ler data.json:', e);
    return DEFAULT_EMPTY;
  }
}

function getData() {
  if (isSupabaseEnabled() && cloudCache.orquestra_data) {
    const d = cloudCache.orquestra_data;
    if (!d.integrantes) d.integrantes = [];
    if (!d.config) d.config = DEFAULT_EMPTY.config;
    return d;
  }
  return readLocalOrquestraFile();
}

function saveData(data) {
  if (!data.config) data.config = DEFAULT_EMPTY.config;
  data.config.ultimaAtualizacao = new Date().toISOString();
  queueCloudWrite('orquestra_data', data);
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Em ambiente Serverless (Vercel), persiste via Supabase
  }
}

// REST Endpoints
app.get('/api/all', (req, res) => {
  res.json(getData());
});

app.post('/api/config', requireRoles(['admin']), (req, res) => {
  const data = getData();
  data.config = { ...data.config, ...req.body };
  saveData(data);
  res.json({ success: true, config: data.config });
});

// ============================================================================
// FUNÇÕES DE SINCRONIZAÇÃO AUTOMÁTICA: GEM <-> CORPO MUSICAL (ORQUESTRA)
// ============================================================================
function normalizePersonName(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(DE|DA|DO|DOS|DAS|E)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase()
    .trim();
}

function isSamePersonServer(a, b) {
  if (!a || !b) return false;
  if (a.gemId && b.id && String(a.gemId) === String(b.id)) return true;
  if (b.gemId && a.id && String(b.gemId) === String(a.id)) return true;
  if (a.integranteId && b.id && String(a.integranteId) === String(b.id)) return true;
  if (b.integranteId && a.id && String(b.integranteId) === String(a.id)) return true;

  const normA = normalizePersonName(a.nome);
  const normB = normalizePersonName(b.nome);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const wordsA = normA.split(' ').filter(w => w.length > 1);
  const wordsB = normB.split(' ').filter(w => w.length > 1);
  if (wordsA.length === 1 || wordsB.length === 1) {
    return normA === normB;
  }
  if (wordsA[0] === wordsB[0] && wordsA[wordsA.length - 1] === wordsB[wordsB.length - 1]) {
    return true;
  }
  if (wordsA[0] === wordsB[0]) {
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    if (wordsA.every(w => setB.has(w)) || wordsB.every(w => setA.has(w))) return true;
  }
  return false;
}

const CANONICAL_INST_SERVER = {
  'VIOLINO': 'Violino',
  'VIOLA': 'Viola',
  'VIOLONCELO': 'Violoncelo',
  'FLAUTA': 'Flauta',
  'FLAUTA TRANSVERSAL': 'Flauta',
  'OBOÉ': 'Oboé',
  'OBOE': 'Oboé',
  "OBOÉ D'AMORE": "Oboé D'Amore",
  'CORNE INGLÊS': 'Corne Inglês',
  'FAGOTE': 'Fagote',
  'CLARINETE': 'Clarinete',
  'CLARINETE ALTO': 'Clarinete Alto',
  'CLARINETE BAIXO': 'Clarinete Baixo',
  'CLARONE': 'Clarinete Baixo',
  'SAXOFONE SOPRANO': 'Saxofone Soprano',
  'SAX SOPRANO': 'Saxofone Soprano',
  'SAXOFONE ALTO': 'Saxofone Alto',
  'SAX ALTO': 'Saxofone Alto',
  'SAXOFONE TENOR': 'Saxofone Tenor',
  'SAX TENOR': 'Saxofone Tenor',
  'SAXOFONE BARÍTONO': 'Saxofone Barítono',
  'SAX BARÍTONO': 'Saxofone Barítono',
  'TROMPETE': 'Trompete',
  'CORNET': 'Cornet',
  'FLUGELHORN': 'Flugelhorn',
  'TROMPA': 'Trompa',
  'TROMBONITO': 'Trombonito',
  'TROMBONE': 'Trombone',
  'EUFÔNIO': 'Eufônio',
  'EUFONIO': 'Eufônio',
  'BOMBARDINO': 'Eufônio',
  'BARÍTONO SIB': 'Barítono Sib',
  'BARITONO SIB': 'Barítono Sib',
  'BARÍTONO': 'Barítono Sib',
  'TUBA': 'Tuba',
  'ÓRGÃO ELETRÔNICO': 'Órgão Eletrônico',
  'ORGAO ELETRONICO': 'Órgão Eletrônico',
  'ÓRGÃO': 'Órgão Eletrônico'
};

function formatInstServer(inst, categoria = 'Músico') {
  if (categoria === 'Organista' || String(categoria).toUpperCase() === 'ORGANISTA') {
    return 'Órgão Eletrônico';
  }
  const upper = String(inst || 'Violino').toUpperCase().trim();
  return CANONICAL_INST_SERVER[upper] || inst || 'Violino';
}

function detectNaipeServer(inst, categoria = 'Músico') {
  if (categoria === 'Organista' || String(categoria).toUpperCase() === 'ORGANISTA') {
    return 'Teclas / Organistas';
  }
  const low = String(inst || '').toLowerCase();
  if (low.includes('org')) return 'Teclas / Organistas';
  if (low.includes('violino') || low.includes('viola') || low.includes('violoncelo')) return 'Cordas';
  if (low.includes('flaut') || low.includes('obo') || low.includes('corne') || low.includes('fagot') || low.includes('clar') || low.includes('sax')) return 'Madeiras';
  return 'Metais';
}

function flagsFromNivelServer(nivel, currentMeiaHora = false) {
  const n = String(nivel || '').toUpperCase().trim();
  if (n === 'CANDIDATO(A)' || n === 'CANDIDATO' || n === 'CANDIDATA') {
    return { ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false };
  }
  if (n === 'ENSAIO' || n === 'ENSAIOS') {
    return { ensaios: true, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false };
  }
  if (n === 'RJM' || n === 'REUNIÃO DE JOVENS' || n === 'RJM / ENSAIOS' || n === 'RJM/ENSAIOS') {
    return { ensaios: true, rjm: true, meiaHora: false, cultosOficiais: false, oficializado: false };
  }
  if (n === 'MEIA HORA') {
    return { ensaios: true, rjm: false, meiaHora: true, cultosOficiais: false, oficializado: false };
  }
  if (n === 'RJM / MEIA HORA' || n === 'RJM/MEIA HORA') {
    return { ensaios: true, rjm: true, meiaHora: true, cultosOficiais: false, oficializado: false };
  }
  if (n === 'RJM / CULTOS OFICIAIS' || n === 'RJM/CULTOS OFICIAIS' || n === 'RJM / CULTO OFICIAL' || n === 'RJM/CULTO OFICIAL') {
    return { ensaios: true, rjm: true, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: false };
  }
  if (n === 'CULTO OFICIAL' || n === 'CULTOS OFICIAIS') {
    return { ensaios: true, rjm: false, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: false };
  }
  if (n === 'RJM OFICIALIZADO' || n === 'RJM / OFICIALIZADO' || n === 'RJM/OFICIALIZADO') {
    return { ensaios: true, rjm: true, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: true };
  }
  if (n === 'OFICIALIZADO' || n === 'OFICIALIZADA') {
    return { ensaios: true, rjm: false, meiaHora: !!currentMeiaHora, cultosOficiais: true, oficializado: true };
  }
  return { ensaios: false, rjm: false, meiaHora: false, cultosOficiais: false, oficializado: false };
}

function nivelFromFlagsServer(item = {}) {
  const raw = String(item.nivel || '').toUpperCase().trim();
  if (raw === 'RJM OFICIALIZADO') return 'RJM / OFICIALIZADO';
  if (item.oficializado) {
    return item.rjm ? 'RJM / OFICIALIZADO' : 'OFICIALIZADO';
  }
  if (item.cultosOficiais) {
    return item.rjm ? 'RJM / CULTOS OFICIAIS' : 'CULTO OFICIAL';
  }
  if (item.meiaHora) {
    return item.rjm ? 'RJM / MEIA HORA' : 'MEIA HORA';
  }
  if (item.rjm) {
    if (raw === 'RJM') return 'RJM';
    return 'RJM / ENSAIOS';
  }
  if (item.ensaios) {
    return 'ENSAIO';
  }
  return item.nivel || 'CANDIDATO(A)';
}

function syncGemAlunoToOrquestra(aluno) {
  const orqData = getData();
  if (!Array.isArray(orqData.integrantes)) orqData.integrantes = [];

  const idx = orqData.integrantes.findIndex(i => isSamePersonServer(i, aluno));
  const categoria = String(aluno.cargo || '').toUpperCase() === 'ORGANISTA' ? 'Organista' : 'Músico';
  const instrumento = formatInstServer(aluno.instrumento, categoria);
  const naipe = detectNaipeServer(instrumento, categoria);
  const nivel = String(aluno.nivel || 'CANDIDATO(A)').toUpperCase().trim();
  const flags = flagsFromNivelServer(nivel, idx !== -1 ? orqData.integrantes[idx].meiaHora : false);

  if (idx !== -1) {
    orqData.integrantes[idx] = {
      ...orqData.integrantes[idx],
      gemId: aluno.id,
      nome: aluno.nome || orqData.integrantes[idx].nome,
      categoria,
      instrumento,
      naipe,
      nivel,
      comum: aluno.comum || orqData.integrantes[idx].comum || 'VILA RUI BARBOSA',
      possuiInstrumento: aluno.possuiInstrumento || 'SIM',
      instrumentoProprio: aluno.instrumentoProprio || 'SIM',
      tonalidade: aluno.tonalidade || 'DÓ',
      dataInicioGem: aluno.dataInicioGem || '',
      ensaios: flags.ensaios,
      rjm: flags.rjm,
      meiaHora: flags.meiaHora,
      cultosOficiais: flags.cultosOficiais,
      oficializado: flags.oficializado,
      batizado: aluno.batizado === false || aluno.batizado === 'NÃO' ? false : (orqData.integrantes[idx].batizado !== false),
      telefone: aluno.telefone || aluno.contato || orqData.integrantes[idx].telefone || '',
      observacao: aluno.observacoes || orqData.integrantes[idx].observacao || ''
    };
    saveData(orqData);
  } else if (nivel !== 'CANDIDATO(A)' && nivel !== 'CANDIDATO' && nivel !== 'CANDIDATA') {
    // Se já toca em Ensaio, RJM, Meia Hora, Culto Oficial ou Oficializado, integra automaticamente ao Corpo Musical
    const novoIntg = {
      id: Date.now(),
      gemId: aluno.id,
      nome: aluno.nome,
      categoria,
      instrumento,
      naipe,
      nivel,
      comum: aluno.comum || 'VILA RUI BARBOSA',
      possuiInstrumento: aluno.possuiInstrumento || 'SIM',
      instrumentoProprio: aluno.instrumentoProprio || 'SIM',
      tonalidade: aluno.tonalidade || 'DÓ',
      dataInicioGem: aluno.dataInicioGem || '',
      ensaios: flags.ensaios,
      rjm: flags.rjm,
      meiaHora: flags.meiaHora,
      cultosOficiais: flags.cultosOficiais,
      oficializado: flags.oficializado,
      batizado: aluno.batizado === false || aluno.batizado === 'NÃO' ? false : true,
      telefone: aluno.telefone || aluno.contato || '',
      observacao: aluno.observacoes || ''
    };
    orqData.integrantes.push(novoIntg);
    saveData(orqData);
  }
}

function syncIntegranteToGem(item) {
  const gemData = getGemData();
  if (!Array.isArray(gemData.alunos)) gemData.alunos = [];

  const idx = gemData.alunos.findIndex(a => isSamePersonServer(item, a));
  const nivel = item.nivel ? String(item.nivel).toUpperCase().trim() : nivelFromFlagsServer(item);

  if (idx !== -1) {
    gemData.alunos[idx] = {
      ...gemData.alunos[idx],
      nome: (item.nome || gemData.alunos[idx].nome || '').toUpperCase(),
      comum: (item.comum || gemData.alunos[idx].comum || 'VILA RUI BARBOSA').toUpperCase(),
      cargo: item.categoria === 'Organista' ? 'ORGANISTA' : 'MÚSICO',
      nivel,
      possuiInstrumento: (item.possuiInstrumento || gemData.alunos[idx].possuiInstrumento || 'SIM').toUpperCase(),
      instrumentoProprio: (item.instrumentoProprio || gemData.alunos[idx].instrumentoProprio || 'SIM').toUpperCase(),
      instrumento: (item.instrumento || gemData.alunos[idx].instrumento || 'VIOLINO').toUpperCase(),
      tonalidade: item.tonalidade || gemData.alunos[idx].tonalidade || 'DÓ',
      dataInicioGem: item.dataInicioGem || gemData.alunos[idx].dataInicioGem || new Date().toISOString().split('T')[0],
      batizado: item.batizado === false ? 'NÃO' : 'SIM',
      telefone: item.telefone !== undefined ? item.telefone : (gemData.alunos[idx].telefone || ''),
      observacoes: item.observacao || gemData.alunos[idx].observacoes || ''
    };
    gemData.alunos = sortByNomePtBr(gemData.alunos);
    saveGemData(gemData);
    return gemData.alunos[idx].id;
  } else if (!item.oficializado || nivel === 'CANDIDATO(A)' || nivel === 'ENSAIO' || nivel.includes('RJM')) {
    // Se for aprendiz/candidato ou jovem em acompanhamento, garante ficha no GEM se solicitado
    if (item.syncGem || !item.oficializado) {
      const novoAluno = {
        id: item.gemId || Date.now(),
        nome: (item.nome || '').toUpperCase(),
        comum: (item.comum || 'VILA RUI BARBOSA').toUpperCase(),
        cargo: item.categoria === 'Organista' ? 'ORGANISTA' : 'MÚSICO',
        nivel,
        possuiInstrumento: (item.possuiInstrumento || 'SIM').toUpperCase(),
        instrumentoProprio: (item.instrumentoProprio || 'SIM').toUpperCase(),
        instrumento: (item.instrumento || 'VIOLINO').toUpperCase(),
        tonalidade: item.tonalidade || 'DÓ',
        dataInicioGem: item.dataInicioGem || new Date().toISOString().split('T')[0],
        batizado: item.batizado === false ? 'NÃO' : 'SIM',
        telefone: item.telefone || '',
        observacoes: item.observacao || ''
      };
      gemData.alunos.push(novoAluno);
      gemData.alunos = sortByNomePtBr(gemData.alunos);
      saveGemData(gemData);
      return novoAluno.id;
    }
  }
  return item.gemId || null;
}

// Integrantes CRUD
app.post('/api/integrantes', (req, res) => {
  const data = getData();
  const item = req.body;
  const nivel = item.nivel ? String(item.nivel).toUpperCase().trim() : nivelFromFlagsServer(item);
  const flags = item.nivel ? flagsFromNivelServer(nivel, item.meiaHora) : {
    ensaios: !!item.ensaios,
    rjm: !!item.rjm,
    meiaHora: !!item.meiaHora,
    cultosOficiais: !!item.cultosOficiais,
    oficializado: item.oficializado !== false
  };
  const enrichedItem = {
    ...item,
    nivel,
    ensaios: flags.ensaios,
    rjm: flags.rjm,
    meiaHora: flags.meiaHora,
    cultosOficiais: flags.cultosOficiais,
    oficializado: flags.oficializado
  };

  const gemId = syncIntegranteToGem(enrichedItem);
  if (gemId) enrichedItem.gemId = gemId;

  if (!enrichedItem.id || String(enrichedItem.id).startsWith('gem-')) {
    // Verifica se já existe integrante vinculado a esse gemId ou nome
    const existingIdx = data.integrantes.findIndex(i => isSamePersonServer(i, enrichedItem));
    if (existingIdx !== -1) {
      enrichedItem.id = data.integrantes[existingIdx].id;
      data.integrantes[existingIdx] = { ...data.integrantes[existingIdx], ...enrichedItem };
    } else {
      enrichedItem.id = Date.now();
      data.integrantes.push(enrichedItem);
    }
  } else {
    const idx = data.integrantes.findIndex(i => i.id === enrichedItem.id || i.id === Number(enrichedItem.id));
    if (idx !== -1) {
      data.integrantes[idx] = { ...data.integrantes[idx], ...enrichedItem };
    } else {
      data.integrantes.push(enrichedItem);
    }
  }
  saveData(data);
  res.json({ success: true, integrante: enrichedItem });
});

app.delete('/api/integrantes/:id', (req, res) => {
  const data = getData();
  const id = Number(req.params.id);
  data.integrantes = data.integrantes.filter(i => i.id !== id);
  saveData(data);
  res.json({ success: true, id });
});

// ============================================================================
// GEM (GRUPO DE ESTUDOS MUSICAIS) ENDPOINTS
// Compatível com Supabase futuramente
// ============================================================================
function readLocalGemFile() {
  try {
    if (!fs.existsSync(GEM_FILE)) {
      return { alunos: [], historico: [] };
    }
    const content = fs.readFileSync(GEM_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.alunos) parsed.alunos = [];
    if (!parsed.historico) parsed.historico = [];
    return parsed;
  } catch (e) {
    console.error('Erro ao ler gem_database.json:', e);
    return { alunos: [], historico: [] };
  }
}

function getGemData() {
  if (isSupabaseEnabled() && cloudCache.gem_database) {
    const g = cloudCache.gem_database;
    if (!g.alunos) g.alunos = [];
    if (!g.historico) g.historico = [];
    return g;
  }
  return readLocalGemFile();
}

function saveGemData(gemData) {
  queueCloudWrite('gem_database', gemData);
  try {
    fs.writeFileSync(GEM_FILE, JSON.stringify(gemData, null, 2), 'utf-8');
  } catch (e) {
    // Em ambiente Serverless (Vercel), persiste via Supabase
  }
}

const sortByNomePtBr = (list = []) =>
  [...list].sort((a, b) =>
    (a?.nome || '').trim().localeCompare((b?.nome || '').trim(), 'pt-BR', { sensitivity: 'base' })
  );

// 1. Alunos GEM: Listar todos (em ordem alfabética)
app.get('/api/gem/alunos', (req, res) => {
  const data = getGemData();
  const alunosOrdenados = sortByNomePtBr(data.alunos);
  res.json({ success: true, alunos: alunosOrdenados });
});

// 2. Alunos GEM: Criar ou Atualizar (Sincroniza automaticamente com Corpo Musical!)
app.post('/api/gem/alunos', (req, res) => {
  const data = getGemData();
  const aluno = req.body;
  if (!aluno.id) {
    const existingIdx = data.alunos.findIndex(a => isSamePersonServer(a, aluno));
    if (existingIdx !== -1) {
      aluno.id = data.alunos[existingIdx].id;
      data.alunos[existingIdx] = { ...data.alunos[existingIdx], ...aluno };
    } else {
      aluno.id = Date.now();
      data.alunos.push(aluno);
    }
  } else {
    const idx = data.alunos.findIndex(a => a.id === Number(aluno.id) || a.id === aluno.id || isSamePersonServer(a, aluno));
    if (idx !== -1) {
      aluno.id = data.alunos[idx].id;
      data.alunos[idx] = { ...data.alunos[idx], ...aluno };
    } else {
      data.alunos.push(aluno);
    }
  }
  data.alunos = sortByNomePtBr(data.alunos);
  saveGemData(data);

  // Sincroniza imediatamente com o Corpo Musical (data.json)
  syncGemAlunoToOrquestra(aluno);

  res.json({ success: true, aluno });
});

// 3. Alunos GEM: Deletar
app.delete('/api/gem/alunos/:id', (req, res) => {
  const data = getGemData();
  const id = Number(req.params.id) || req.params.id;
  data.alunos = data.alunos.filter(a => a.id !== id);
  data.historico = data.historico.filter(h => h.alunoId !== id);
  saveGemData(data);
  res.json({ success: true, id });
});

// 3b. Chamada & Planejamento GEM (Persistência no Servidor para 2026, 2027 e futuros anos)
app.get('/api/gem/chamada', (req, res) => {
  const data = getGemData();
  res.json({
    success: true,
    chamada: data.chamada || {
      anosDisponiveis: [2026, 2027],
      datasPorAno: {},
      statusDatasPorAno: {},
      presencasPorAno: {}
    }
  });
});

app.post('/api/gem/chamada', (req, res) => {
  const data = getGemData();
  if (!data.chamada) {
    data.chamada = {
      anosDisponiveis: [2026, 2027],
      datasPorAno: {},
      statusDatasPorAno: {},
      presencasPorAno: {}
    };
  }
  const { ano, anosDisponiveis, datasDoAno, statusDatas, alunosPresenca } = req.body || {};
  if (Array.isArray(anosDisponiveis) && anosDisponiveis.length > 0) {
    data.chamada.anosDisponiveis = [...new Set(anosDisponiveis)].sort((a, b) => a - b);
  }
  if (ano) {
    if (Array.isArray(datasDoAno)) {
      data.chamada.datasPorAno[ano] = datasDoAno;
    }
    if (statusDatas && typeof statusDatas === 'object') {
      data.chamada.statusDatasPorAno[ano] = statusDatas;
    }
    if (Array.isArray(alunosPresenca)) {
      const mapAno = {};
      alunosPresenca.forEach(a => {
        if (a && a.id) {
          mapAno[a.id] = {
            presencas: a.presencas || {},
            msa: a.msa || ''
          };
          // Também salva msa no cadastro do aluno se preenchido
          const idx = data.alunos.findIndex(al => al.id === a.id || isSamePersonServer(al, a));
          if (idx !== -1 && a.msa !== undefined) {
            data.alunos[idx].msa = a.msa;
          }
        }
      });
      data.chamada.presencasPorAno[ano] = mapAno;
    }
  }
  saveGemData(data);
  res.json({ success: true, chamada: data.chamada });
});

// 4. Histórico GEM: Listar histórico de um aluno
app.get('/api/gem/historico/:alunoId', (req, res) => {
  const data = getGemData();
  const alunoId = Number(req.params.alunoId) || req.params.alunoId;
  const list = data.historico
    .filter(h => h.alunoId === alunoId)
    .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  res.json({ success: true, historico: list });
});

// 5. Histórico GEM: Adicionar ou Atualizar lançamento de atividade
app.post('/api/gem/historico', (req, res) => {
  const data = getGemData();
  const item = req.body;
  if (!item.id) {
    item.id = Date.now();
    item.createdAt = new Date().toISOString();
    data.historico.push(item);
  } else {
    const idx = data.historico.findIndex(h => h.id === Number(item.id) || h.id === item.id);
    if (idx !== -1) {
      data.historico[idx] = { ...data.historico[idx], ...item };
    } else {
      data.historico.push(item);
    }
  }
  saveGemData(data);
  res.json({ success: true, item });
});

// 6. Histórico GEM: Deletar lançamento
app.delete('/api/gem/historico/:id', (req, res) => {
  const data = getGemData();
  const id = Number(req.params.id) || req.params.id;
  data.historico = data.historico.filter(h => h.id !== id);
  saveGemData(data);
  res.json({ success: true, id });
});

// 7. União Orquestra & GEM: Dados integrados e métricas
app.get('/api/uniao', (req, res) => {
  const orqData = getData();
  const gemData = getGemData();
  
  const integrantes = orqData.integrantes || [];
  const alunos = gemData.alunos || [];

  const todos = [];
  const processedGemIds = new Set();

  integrantes.forEach(intg => {
    const gemMatch = alunos.find(a => isSamePersonServer(intg, a));
    
    if (gemMatch) {
      processedGemIds.add(gemMatch.id);
      const categoria = gemMatch.cargo === 'ORGANISTA' || intg.categoria === 'Organista' ? 'Organista' : 'Músico';
      const instrumento = formatInstServer(gemMatch.instrumento || intg.instrumento, categoria);
      const naipe = detectNaipeServer(instrumento, categoria);
      const nivelGem = gemMatch.nivel || nivelFromFlagsServer(intg);
      const flags = flagsFromNivelServer(nivelGem, intg.meiaHora);

      todos.push({
        id: intg.id,
        gemId: gemMatch.id,
        nome: intg.nome || gemMatch.nome,
        categoria,
        instrumento,
        naipe,
        oficializado: flags.oficializado,
        rjm: flags.rjm,
        cultosOficiais: flags.cultosOficiais,
        ensaios: flags.ensaios,
        meiaHora: flags.meiaHora,
        telefone: intg.telefone || '',
        observacao: gemMatch.observacoes || intg.observacao || '',
        origem: 'AMBOS',
        nivelGem,
        comum: gemMatch.comum || intg.comum || 'VILA RUI BARBOSA',
        dataInicioGem: gemMatch.dataInicioGem || '',
        tonalidade: gemMatch.tonalidade || ''
      });
    } else {
      todos.push({
        ...intg,
        origem: 'ORQUESTRA',
        nivelGem: nivelFromFlagsServer(intg)
      });
    }
  });

  // Adiciona alunos do GEM que ainda não estão na Orquestra
  alunos.forEach(aluno => {
    if (!processedGemIds.has(aluno.id)) {
      const categoria = aluno.cargo === 'ORGANISTA' ? 'Organista' : 'Músico';
      const instrumento = formatInstServer(aluno.instrumento, categoria);
      const naipe = detectNaipeServer(instrumento, categoria);
      const nivelGem = aluno.nivel || 'CANDIDATO(A)';
      const flags = flagsFromNivelServer(nivelGem, false);

      todos.push({
        id: 'gem-' + aluno.id,
        gemId: aluno.id,
        nome: aluno.nome,
        categoria,
        instrumento,
        naipe,
        oficializado: flags.oficializado,
        rjm: flags.rjm,
        cultosOficiais: flags.cultosOficiais,
        ensaios: flags.ensaios,
        meiaHora: flags.meiaHora,
        telefone: '',
        observacao: aluno.observacoes || '',
        origem: 'GEM',
        nivelGem,
        comum: aluno.comum || 'VILA RUI BARBOSA',
        dataInicioGem: aluno.dataInicioGem || '',
        tonalidade: aluno.tonalidade || ''
      });
    }
  });

  res.json({
    success: true,
    totalIntegrantes: integrantes.length,
    totalAlunosGem: alunos.length,
    totalUnificado: todos.length,
    todos,
    integrantes,
    alunos
  });
});

// 8. Promoção de Aluno do GEM para a Orquestra
app.post('/api/gem/promover', (req, res) => {
  const { alunoId, novoNivel, cargo } = req.body;
  const gemData = getGemData();

  const aluno = gemData.alunos.find(a => a.id === Number(alunoId) || a.id === alunoId);
  if (!aluno) {
    return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
  }

  aluno.nivel = novoNivel || aluno.nivel;
  if (cargo) aluno.cargo = cargo;
  saveGemData(gemData);

  syncGemAlunoToOrquestra(aluno);

  res.json({
    success: true,
    message: `Aluno ${aluno.nome} atualizado para ${novoNivel} e integrado à Orquestra com sucesso!`,
    aluno
  });
});

// Reset para base vazia
app.post('/api/reset-empty', requireRoles(['admin']), (req, res) => {
  const emptyData = {
    config: {
      localidade: 'Vila Rui Barbosa',
      cidade: 'Jundiaí - SP',
      tipoOrquestra: 'Simples',
      quantidadeDesejada: 32,
      ultimaAtualizacao: new Date().toISOString()
    },
    integrantes: []
  };
  saveData(emptyData);
  res.json({ success: true, message: 'Banco de dados zerado com sucesso!', data: emptyData });
});

// Restaurar backup anterior
app.post('/api/restore-backup', requireRoles(['admin']), (req, res) => {
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      const backupRaw = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const backupData = JSON.parse(backupRaw);
      
      // Converte musicos e organistas antigos em lista unificada se necessário
      let unified = [];
      if (Array.isArray(backupData.integrantes) && backupData.integrantes.length > 0) {
        unified = backupData.integrantes;
      } else {
        if (Array.isArray(backupData.musicos)) {
          backupData.musicos.forEach(m => {
            unified.push({
              id: m.id || Date.now() + Math.random(),
              nome: m.nome,
              categoria: 'Músico',
              instrumento: m.instrumento || 'Violino',
              naipe: m.naipe || 'Cordas',
              situacao: m.oficializado || m.fase === 'Oficializado' ? 'Oficializado' : 'Aluno GEM / Estudos',
              telefone: m.telefone || '',
              observacao: m.observacao || ''
            });
          });
        }
        if (Array.isArray(backupData.organistas)) {
          backupData.organistas.forEach(o => {
            unified.push({
              id: o.id || Date.now() + Math.random(),
              nome: o.nome,
              categoria: 'Organista',
              instrumento: 'Órgão Eletrônico',
              naipe: 'Teclas / Organistas',
              situacao: o.oficializada || o.status === 'Oficializada' ? 'Oficializado' : 'Aluno GEM / Estudos',
              telefone: o.telefone || '',
              observacao: o.observacao || ''
            });
          });
        }
      }

      const restored = {
        config: backupData.config || DEFAULT_EMPTY.config,
        integrantes: unified
      };
      saveData(restored);
      return res.json({ success: true, message: 'Dados restaurados com sucesso!', data: restored });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Erro ao restaurar backup: ' + e.message });
    }
  }
  res.status(404).json({ success: false, message: 'Arquivo de backup não encontrado.' });
});

// ============================================================================
// SISTEMA DE FEEDBACK & SUGESTÕES DOS USUÁRIOS
// ============================================================================
function getFeedbacksData() {
  if (isSupabaseEnabled() && cloudCache.feedbacks) {
    return Array.isArray(cloudCache.feedbacks.list) ? cloudCache.feedbacks.list : [];
  }
  const feedbackFile = path.join(__dirname, 'feedbacks.json');
  try {
    if (fs.existsSync(feedbackFile)) {
      const parsed = JSON.parse(fs.readFileSync(feedbackFile, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {}
  return [];
}

function saveFeedbacksData(list) {
  cloudCache.feedbacks = { list };
  queueCloudWrite('feedbacks', { list });
  const feedbackFile = path.join(__dirname, 'feedbacks.json');
  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {}
}

app.get('/api/feedback', (req, res) => {
  const list = getFeedbacksData();
  res.json({ success: true, feedbacks: list });
});

app.post('/api/feedback', (req, res) => {
  const item = req.body || {};
  if (!item.mensagem || !item.mensagem.trim()) {
    return res.status(400).json({ success: false, message: 'Mensagem de feedback não pode estar vazia.' });
  }
  const list = getFeedbacksData();
  const novo = {
    id: Date.now(),
    tipo: item.tipo || 'Sugestão',
    mensagem: item.mensagem.trim(),
    nome: item.nome && item.nome.trim() ? item.nome.trim() : 'Irmão(ã) da CCB',
    avaliacao: Number(item.avaliacao) || 5,
    criadoEm: new Date().toISOString()
  };
  list.unshift(novo);
  saveFeedbacksData(list);
  res.json({ success: true, item: novo });
});

app.delete('/api/feedback/:id', (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  let list = getFeedbacksData();
  list = list.filter(f => f.id !== id);
  saveFeedbacksData(list);
  res.json({ success: true, id });
});

// Healthcheck & Keep-Alive (evita que o projeto gratuito do Supabase entre em pausa!)
app.get('/api/health', (req, res) => {
  const orq = getData();
  const gem = getGemData();
  res.json({
    ok: true,
    storage: isSupabaseEnabled() ? 'supabase_cloud' : 'local_json',
    integrantesCount: (orq.integrantes || []).length,
    alunosGemCount: (gem.alunos || []).length,
    timestamp: new Date().toISOString()
  });
});

// Exportar Backup Completo (Orquestra + GEM + Chamada + Usuários)
app.get('/api/backup/export', requireRoles(['admin']), (req, res) => {
  res.json({
    success: true,
    exportedAt: new Date().toISOString(),
    orquestra_data: getData(),
    gem_database: getGemData(),
    users_auth: { users: getUsersData() }
  });
});

// Importar Backup Completo
app.post('/api/backup/import', requireRoles(['admin']), (req, res) => {
  const { orquestra_data, gem_database, users_auth } = req.body || {};
  if (orquestra_data && Array.isArray(orquestra_data.integrantes)) {
    saveData(orquestra_data);
  }
  if (gem_database && Array.isArray(gem_database.alunos)) {
    saveGemData(gem_database);
  }
  if (users_auth && Array.isArray(users_auth.users)) {
    saveUsersData(users_auth.users);
  }
  res.json({ success: true, message: 'Backup completo importado e sincronizado com sucesso!' });
});

// Serve frontend dist if exists (apenas em servidor contínuo local/Render/Railway)
const distPath = path.join(__dirname, 'dist');
if (!process.env.VERCEL && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[SAM Musical CCB] Backend rodando em http://localhost:${PORT} (${
        isSupabaseEnabled() ? 'Supabase Cloud Ativo' : 'Modo Local JSON'
      })`
    );
  });
}

module.exports = app;
