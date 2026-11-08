import { Alert } from 'react-native';
import { router } from 'expo-router';
import { CONTAS_URL, TRANSACCOES_URL } from './config';
import { sessao, guardarSessao, limparSessao } from './sessao';

export type LoginResposta = {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  roles: string[];
  primeiroAcesso: boolean;
};

export type Conta = {
  numero: string;
  saldo: number;
  estado: string;
  primeiroAcesso?: boolean;
  cliente?: { nome?: string };
};

export type Comprovativo = {
  banco: string;
  referencia: string;
  tipo: string;
  estado: string;
  contaOrigem: string | null;
  contaDestino: string;
  valor: number;
  dataHora: string;
};

export type Movimento = {
  referencia: string;
  tipo: string;
  estado: string;
  sentido: 'CREDITO' | 'DEBITO';
  contaOrigem: string | null;
  contaDestino: string;
  valor: number;
  dataHora: string;
  motivoFalha: string | null;
};

export class ErroApi extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

// O backend responde {"erro": "..."} nas regras de negócio e {campo: "mensagem"} nas validações.
function mensagemDeErro(status: number, dados: any, autenticado: boolean): string {
  if (dados && typeof dados.erro === 'string') return dados.erro;
  if (dados && typeof dados === 'object') {
    const mensagens = Object.values(dados).filter((v) => typeof v === 'string');
    if (mensagens.length > 0) return mensagens.join('\n');
  }
  if (status === 401) {
    return autenticado ? 'A sua sessão expirou. Entre novamente.' : 'Número da conta ou PIN incorrecto.';
  }
  if (status === 403) return 'Não tem permissão para esta operação.';
  return `Erro do servidor (${status}). Tente novamente.`;
}

type Opcoes = { metodo?: string; corpo?: unknown; autenticado?: boolean };

async function pedir<T>(base: string, caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { metodo = 'GET', corpo, autenticado = true } = opcoes;

  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (autenticado && sessao.token) cabecalhos.Authorization = `Bearer ${sessao.token}`;

  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 15000);

  let resposta: Response;
  try {
    resposta = await fetch(base + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controlador.signal,
    });
  } catch {
    throw new ErroApi(0, 'Sem ligação a ' + base + ' (verifique a rede e a firewall)');
  } finally {
    clearTimeout(limite);
  }

  const texto = await resposta.text();
  let dados: any = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, mensagemDeErro(resposta.status, dados, autenticado));
  }
  return dados as T;
}

// ---------------------------------------------------------------- Contas (8080)

export async function entrar(numero: string, pin: string): Promise<LoginResposta> {
  const r = await pedir<LoginResposta>(CONTAS_URL, '/api/auth/conta/login', {
    metodo: 'POST',
    corpo: { numero, pin },
    autenticado: false,
  });
  guardarSessao(r.token, numero);
  return r;
}

export function alterarPin(pinActual: string, novoPin: string) {
  return pedir<unknown>(CONTAS_URL, `/api/contas/${sessao.numero}/pin`, {
    metodo: 'PUT',
    corpo: { pinActual, novoPin },
  });
}

export function obterConta() {
  return pedir<Conta>(CONTAS_URL, `/api/contas/${sessao.numero}`);
}

// ---------------------------------------------------------- Transacções (8081)

export function transferir(destino: string, valor: number, pin: string) {
  return pedir<Comprovativo>(TRANSACCOES_URL, '/api/transferencias', {
    metodo: 'POST',
    corpo: { origem: sessao.numero, destino, valor, pin },
  });
}

export function listarMovimentos() {
  return pedir<Movimento[]>(TRANSACCOES_URL, `/api/contas/${sessao.numero}/movimentos?tamanho=30`);
}

// ------------------------------------------------------------------ Erros

// Mostra o erro ao cliente. Se a sessão expirou (token inválido), volta ao login.
export function mostrarErro(e: unknown, titulo = 'Erro') {
  if (e instanceof ErroApi && e.status === 401 && sessao.token) {
    limparSessao();
    Alert.alert('Sessão terminada', 'A sua sessão expirou. Entre novamente.', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
    return;
  }
  Alert.alert(titulo, e instanceof Error ? e.message : 'Ocorreu um erro inesperado.');
}

