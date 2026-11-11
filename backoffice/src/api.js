// O navegador chama estes caminhos; o servidor Vite reencaminha para os serviços.
const CONTAS = '/contas-api';
const TRANSACCOES = '/transaccoes-api';

let token = sessionStorage.getItem('token');
let aoExpirar = () => {};

export function definirAoExpirar(fn) {
  aoExpirar = fn;
}

export function guardarToken(t) {
  token = t;
  if (t) sessionStorage.setItem('token', t);
  else sessionStorage.removeItem('token');
}

export function temToken() {
  return !!token;
}

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// O backend responde {"erro": "..."} nas regras de negócio e {campo: "mensagem"} nas validações.
function mensagem(status, dados) {
  if (dados && typeof dados.erro === 'string') return dados.erro;
  if (dados && typeof dados === 'object') {
    const m = Object.values(dados).filter((v) => typeof v === 'string');
    if (m.length) return m.join(' · ');
  }
  if (status === 401) return 'Sessão expirada. Entre novamente.';
  if (status === 403) return 'Sem permissão para esta operação.';
  if (status >= 500) return 'Serviço indisponível. Verifique se os dois serviços estão a correr.';
  return `Erro (${status}).`;
}

async function pedir(base, caminho, { metodo = 'GET', corpo, autenticado = true } = {}) {
  const cabecalhos = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (autenticado && token) cabecalhos.Authorization = `Bearer ${token}`;

  let r;
  try {
    r = await fetch(base + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi(0, 'Sem ligação ao servidor. Verifique se o backoffice e os serviços estão a correr.');
  }

  const texto = await r.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!r.ok) {
    if (r.status === 401 && autenticado && token) {
      guardarToken(null);
      aoExpirar();
    }
    throw new ErroApi(r.status, mensagem(r.status, dados));
  }
  return dados;
}

// ---- Serviço de Contas (8080)
export const entrar = (email, senha) =>
  pedir(CONTAS, '/api/auth/login', { metodo: 'POST', corpo: { email, senha }, autenticado: false });

export const listarClientes = () => pedir(CONTAS, '/api/clientes');

export const criarCliente = (c) => pedir(CONTAS, '/api/clientes', { metodo: 'POST', corpo: c });

export const actualizarCliente = (id, c) =>
  pedir(CONTAS, `/api/clientes/${id}`, { metodo: 'PUT', corpo: c });

export const abrirConta = (clienteId, pin, saldoInicial) =>
  pedir(CONTAS, `/api/clientes/${clienteId}/contas`, {
    metodo: 'POST',
    corpo: { pin, saldoInicial },
  });

export const listarContas = () => pedir(CONTAS, '/api/contas');

export const bloquearConta = (numero) =>
  pedir(CONTAS, `/api/contas/${numero}/bloquear`, { metodo: 'PATCH' });

export const desbloquearConta = (numero) =>
  pedir(CONTAS, `/api/contas/${numero}/desbloquear`, { metodo: 'PATCH' });

export const auditoria = () => pedir(CONTAS, '/api/auditoria');

// ---- Serviço de Transacções (8081)
export const depositar = (numero, valor) =>
  pedir(TRANSACCOES, `/api/contas/${numero}/depositos`, { metodo: 'POST', corpo: { valor } });

export const movimentos = (numero) =>
  pedir(TRANSACCOES, `/api/contas/${numero}/movimentos?tamanho=50`);
