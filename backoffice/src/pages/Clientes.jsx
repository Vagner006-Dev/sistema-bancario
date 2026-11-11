import { useEffect, useMemo, useState } from 'react';
import { listarClientes, criarCliente, actualizarCliente, abrirConta } from '../api.js';
import Modal from '../components/Modal.jsx';
import { mt } from '../format.js';

const VAZIO = { nome: '', numeroBi: '', telefone: '', email: '' };

function FormCliente({ cliente, aoGuardar, aoCancelar }) {
  const [f, setF] = useState(cliente ? { ...cliente } : VAZIO);
  const [erro, setErro] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.value });

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    setAGuardar(true);
    try {
      const corpo = {
        nome: f.nome.trim(),
        numeroBi: f.numeroBi.trim(),
        telefone: f.telefone?.trim() || null,
        email: f.email?.trim() || null,
      };
      if (cliente) {
        await actualizarCliente(cliente.id, { ...corpo, estado: cliente.estado });
      } else {
        await criarCliente(corpo);
      }
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
      <label>Número do BI</label>
      <input value={f.numeroBi} onChange={mudar('numeroBi')} required />
      <label>Telefone</label>
      <input value={f.telefone ?? ''} onChange={mudar('telefone')} />
      <label>Email</label>
      <input type="email" value={f.email ?? ''} onChange={mudar('email')} />
      <div className="acoes">
        <button type="button" onClick={aoCancelar}>Cancelar</button>
        <button className="primario" disabled={aGuardar}>{aGuardar ? 'A guardar...' : 'Guardar'}</button>
      </div>
    </form>
  );
}

function FormConta({ cliente, aoConcluir }) {
  const [pin, setPin] = useState('');
  const [saldo, setSaldo] = useState('0');
  const [erro, setErro] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const [aberta, setAberta] = useState(null);

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    if (!/^\d{4}$/.test(pin)) {
      setErro('O PIN deve ter 4 dígitos.');
      return;
    }
    const valor = Number(saldo.replace(',', '.'));
    if (!Number.isFinite(valor) || valor < 0) {
      setErro('Saldo inicial inválido.');
      return;
    }
    setAGuardar(true);
    try {
      setAberta(await abrirConta(cliente.id, pin, valor));
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setAGuardar(false);
    }
  }

  if (aberta) {
    return (
      <div>
        <div className="sucesso">
          <strong>Conta aberta com sucesso.</strong>
          <div className="numero-conta">{aberta.numero}</div>
          <div>Saldo inicial: {mt(aberta.saldo)}</div>
        </div>
        <p className="suave">
          Entregue ao cliente o número da conta e o PIN inicial. No primeiro acesso na app, o cliente
          tem de mudar o PIN.
        </p>
        <div className="acoes">
          <button className="primario" onClick={aoConcluir}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submeter}>
      <p className="suave">Cliente: <strong>{cliente.nome}</strong></p>
      {erro && <div className="erro">{erro}</div>}
      <label>PIN inicial (4 dígitos)</label>
      <input value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} inputMode="numeric" required />
      <label>Saldo inicial (MZN)</label>
      <input value={saldo} onChange={(e) => setSaldo(e.target.value)} inputMode="decimal" required />
      <div className="acoes">
        <button type="button" onClick={aoConcluir}>Cancelar</button>
        <button className="primario" disabled={aGuardar}>{aGuardar ? 'A abrir...' : 'Abrir conta'}</button>
      </div>
    </form>
  );
}

export default function Clientes({ verContas }) {
  const [lista, setLista] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null);

  async function carregar() {
    setACarregar(true);
    setErro('');
    try {
      setLista(await listarClientes());
    } catch (e) {
      setErro(e.message);
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrada = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((c) =>
      [c.nome, c.numeroBi, c.telefone, c.email].some((v) => (v ?? '').toLowerCase().includes(q))
    );
  }, [lista, pesquisa]);

  return (
    <div>
      <div className="topo">
        <h2>Clientes</h2>
        <button className="primario" onClick={() => setModal({ tipo: 'novo' })}>+ Novo cliente</button>
      </div>

      <input
        className="pesquisa"
        placeholder="Pesquisar por nome, BI, telefone ou email"
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
      />

      {erro && <div className="erro">{erro}</div>}
      {aCarregar && <p className="suave">A carregar...</p>}

      {!aCarregar && !erro && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>BI</th><th>Telefone</th><th>Email</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtrada.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.numeroBi}</td>
                  <td>{c.telefone}</td>
                  <td>{c.email}</td>
                  <td><span className={`etiqueta ${c.estado === 'ACTIVO' ? 'verde' : 'cinza'}`}>{c.estado}</span></td>
                  <td className="linha-acoes">
                    <button onClick={() => setModal({ tipo: 'editar', cliente: c })}>Editar</button>
                    <button onClick={() => setModal({ tipo: 'conta', cliente: c })}>Abrir conta</button>
                    <button onClick={() => verContas(c)}>Contas</button>
                  </td>
                </tr>
              ))}
              {filtrada.length === 0 && (
                <tr><td colSpan="6" className="vazio">Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === 'novo' && (
        <Modal titulo="Novo cliente" onFechar={() => setModal(null)}>
          <FormCliente aoCancelar={() => setModal(null)} aoGuardar={() => { setModal(null); carregar(); }} />
        </Modal>
      )}
      {modal?.tipo === 'editar' && (
        <Modal titulo="Editar cliente" onFechar={() => setModal(null)}>
          <FormCliente
            cliente={modal.cliente}
            aoCancelar={() => setModal(null)}
            aoGuardar={() => { setModal(null); carregar(); }}
          />
        </Modal>
      )}
      {modal?.tipo === 'conta' && (
        <Modal titulo="Abrir conta" onFechar={() => setModal(null)}>
          <FormConta cliente={modal.cliente} aoConcluir={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
