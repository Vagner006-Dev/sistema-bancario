import { useEffect, useState } from 'react';
import { entrar, guardarToken, temToken, definirAoExpirar } from './api.js';
import Clientes from './pages/Clientes.jsx';
import Contas from './pages/Contas.jsx';
import Auditoria from './pages/Auditoria.jsx';

export const BANCO = 'Premium Bank';

function lerSessao() {
  try {
    const s = sessionStorage.getItem('sessao');
    return temToken() && s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function Login({ aoEntrar, aviso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aCarregar, setACarregar] = useState(false);

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    setACarregar(true);
    try {
      const r = await entrar(email.trim(), senha);
      const roles = r.roles || [];
      if (!roles.includes('ADMIN') && !roles.includes('OPERADOR')) {
        setErro('Esta conta não é de funcionário.');
        return;
      }
      guardarToken(r.token);
      aoEntrar({ email: email.trim(), roles });
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setACarregar(false);
    }
  }

  return (
    <div className="login-pagina">
      <form className="login-cartao" onSubmit={submeter}>
        <h1>{BANCO}</h1>
        <p className="suave">Backoffice – acesso de funcionários</p>
        {aviso && <div className="aviso">{aviso}</div>}
        {erro && <div className="erro">{erro}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <label>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <button className="primario" disabled={aCarregar}>
          {aCarregar ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [sessao, setSessao] = useState(lerSessao);
  const [pagina, setPagina] = useState('clientes');
  const [filtroCliente, setFiltroCliente] = useState(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    definirAoExpirar(() => {
      sessionStorage.removeItem('sessao');
      setSessao(null);
      setAviso('A sessão expirou. Entre novamente.');
    });
  }, []);

  function sair() {
    guardarToken(null);
    sessionStorage.removeItem('sessao');
    setSessao(null);
    setAviso('');
  }

  if (!sessao) {
    return (
      <Login
        aviso={aviso}
        aoEntrar={(s) => {
          sessionStorage.setItem('sessao', JSON.stringify(s));
          setSessao(s);
          setAviso('');
          setPagina('clientes');
        }}
      />
    );
  }

  const eAdmin = sessao.roles.includes('ADMIN');

  function verContas(cliente) {
    setFiltroCliente({ id: cliente.id, nome: cliente.nome });
    setPagina('contas');
  }

  return (
    <div className="layout">
      <aside className="lateral">
        <div className="marca">{BANCO}</div>
        <nav>
          <button className={pagina === 'clientes' ? 'activo' : ''} onClick={() => setPagina('clientes')}>
            Clientes
          </button>
          <button
            className={pagina === 'contas' ? 'activo' : ''}
            onClick={() => {
              setFiltroCliente(null);
              setPagina('contas');
            }}
          >
            Contas
          </button>
          {eAdmin && (
            <button className={pagina === 'auditoria' ? 'activo' : ''} onClick={() => setPagina('auditoria')}>
              Auditoria
            </button>
          )}
        </nav>
        <div className="utilizador">
          <div>{sessao.email}</div>
          <small>{sessao.roles.join(', ')}</small>
          <button onClick={sair}>Terminar sessão</button>
        </div>
      </aside>
      <main className="conteudo">
        {pagina === 'clientes' && <Clientes verContas={verContas} />}
        {pagina === 'contas' && (
          <Contas filtroCliente={filtroCliente} limparFiltro={() => setFiltroCliente(null)} />
        )}
        {pagina === 'auditoria' && eAdmin && <Auditoria />}
      </main>
    </div>
  );
}
