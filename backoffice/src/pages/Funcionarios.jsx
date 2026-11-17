import { useEffect, useState } from 'react';
import { listarFuncionarios, criarFuncionario } from '../api.js';
import Modal from '../components/Modal.jsx';

const VAZIO = { nome: '', email: '', senha: '', role: 'OPERADOR' };

function FormFuncionario({ aoGuardar, aoCancelar }) {
  const [f, setF] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.value });

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    if (f.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setAGuardar(true);
    try {
      await criarFuncionario({ ...f, nome: f.nome.trim(), email: f.email.trim() });
      aoGuardar();
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <form onSubmit={submeter}>
      {erro && <div className="erro">{erro}</div>}
      <label>Nome</label>
      <input value={f.nome} onChange={mudar('nome')} required />
      <label>Email</label>
      <input type="email" value={f.email} onChange={mudar('email')} required />
      <label>Senha</label>
      <input type="password" value={f.senha} onChange={mudar('senha')} required />
      <label>Perfil</label>
      <select value={f.role} onChange={mudar('role')}>
        <option value="OPERADOR">OPERADOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <div className="acoes">
        <button type="button" onClick={aoCancelar}>Cancelar</button>
        <button className="primario" disabled={aGuardar}>{aGuardar ? 'A guardar...' : 'Guardar'}</button>
      </div>
    </form>
  );
}

export default function Funcionarios() {
  const [lista, setLista] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);

  async function carregar() {
    setACarregar(true);
    setErro('');
    try {
      setLista(await listarFuncionarios());
    } catch (e) {
      setErro(e.message);
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <div className="topo">
        <h2>Funcionários</h2>
        <button className="primario" onClick={() => setAberto(true)}>+ Novo funcionário</button>
      </div>

      {erro && <div className="erro">{erro}</div>}
      {aCarregar && <p className="suave">A carregar...</p>}

      {!aCarregar && !erro && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.id}>
                  <td>{f.nome}</td>
                  <td>{f.email}</td>
                  <td>{f.role}</td>
                  <td><span className={`etiqueta ${f.estado === 'ACTIVO' ? 'verde' : 'cinza'}`}>{f.estado}</span></td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan="4" className="vazio">Nenhum funcionário.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {aberto && (
        <Modal titulo="Novo funcionário" onFechar={() => setAberto(false)}>
          <FormFuncionario
            aoCancelar={() => setAberto(false)}
            aoGuardar={() => { setAberto(false); carregar(); }}
          />
        </Modal>
      )}
    </div>
  );
}
