import { useEffect, useMemo, useState } from 'react';
import { listarContas, bloquearConta, desbloquearConta, depositar, movimentos } from '../api.js';
import Modal from '../components/Modal.jsx';
import { mt, data } from '../format.js';

const COR_ESTADO = { ACTIVA: 'verde', BLOQUEADA: 'vermelho', INACTIVA: 'cinza' };

function FormDeposito({ conta, aoConcluir }) {
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const [comprovativo, setComprovativo] = useState(null);

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    if (!/^\d+([.,]\d{1,2})?$/.test(valor) || Number(valor.replace(',', '.')) <= 0) {
      setErro('Introduza um valor válido (até 2 casas decimais).');
      return;
    }
    setAEnviar(true);
    try {
      setComprovativo(await depositar(conta.numero, Number(valor.replace(',', '.'))));
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setAEnviar(false);
    }
  }

  if (comprovativo) {
    return (
      <div>
        <div className="sucesso">
          <strong>Depósito {comprovativo.estado === 'CONCLUIDA' ? 'concluído' : comprovativo.estado}.</strong>
          <div>Referência: {comprovativo.referencia}</div>
          <div>Conta: {comprovativo.contaDestino}</div>
          <div>Valor: {mt(comprovativo.valor)}</div>
          <div>Data: {data(comprovativo.dataHora)}</div>
        </div>
        <div className="acoes">
          <button className="primario" onClick={() => aoConcluir(true)}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submeter}>
      <p className="suave">Conta <strong>{conta.numero}</strong> · {conta.cliente?.nome}</p>
      {erro && <div className="erro">{erro}</div>}
      <label>Valor do depósito (MZN)</label>
      <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" autoFocus required />
      <div className="acoes">
        <button type="button" onClick={() => aoConcluir(false)}>Cancelar</button>
        <button className="primario" disabled={aEnviar}>{aEnviar ? 'A depositar...' : 'Depositar'}</button>
      </div>
    </form>
  );
}

function descricao(m) {
  if (m.tipo === 'DEPOSITO') return 'Depósito';
  return m.sentido === 'CREDITO'
    ? `Transferência recebida de ${m.contaOrigem}`
    : `Transferência enviada para ${m.contaDestino}`;
}

function Extracto({ conta }) {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    movimentos(conta.numero)
      .then(setLista)
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, [conta.numero]);

  return (
    <div>
      <p className="suave">
        Conta <strong>{conta.numero}</strong> · {conta.cliente?.nome} · Saldo <strong>{mt(conta.saldo)}</strong>
      </p>
      {erro && <div className="erro">{erro}</div>}
      {aCarregar && <p className="suave">A carregar...</p>}
      {!aCarregar && !erro && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Estado</th><th className="dir">Valor</th></tr>
            </thead>
            <tbody>
              {lista.map((m) => {
                const falhada = m.estado === 'FALHADA';
                return (
                  <tr key={m.referencia} className={falhada ? 'falhada' : ''}>
                    <td>{data(m.dataHora)}</td>
                    <td>
                      {descricao(m)}
                      {falhada && m.motivoFalha ? <div className="suave">{m.motivoFalha}</div> : null}
                    </td>
                    <td>{m.estado}</td>
                    <td className={`dir ${falhada ? '' : m.sentido === 'CREDITO' ? 'credito' : 'debito'}`}>
                      {m.sentido === 'CREDITO' ? '+ ' : '- '}{mt(m.valor)}
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr><td colSpan="4" className="vazio">Sem movimentos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Contas({ filtroCliente, limparFiltro }) {
  const [lista, setLista] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null);
  const [ocupada, setOcupada] = useState(null);

  async function carregar() {
    setACarregar(true);
    setErro('');
    try {
      setLista(await listarContas());
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
    return lista.filter((c) => {
      if (filtroCliente && c.cliente?.id !== filtroCliente.id) return false;
      if (!q) return true;
      return [c.numero, c.cliente?.nome].some((v) => (v ?? '').toLowerCase().includes(q));
    });
  }, [lista, pesquisa, filtroCliente]);

  async function alternarEstado(conta) {
    const bloquear = conta.estado !== 'BLOQUEADA';
    const acao = bloquear ? 'bloquear' : 'desbloquear';
    if (!window.confirm(`Quer ${acao} a conta ${conta.numero}?`)) return;
    setOcupada(conta.numero);
    setErro('');
    try {
      const actualizada = bloquear ? await bloquearConta(conta.numero) : await desbloquearConta(conta.numero);
      setLista((l) => l.map((c) => (c.numero === conta.numero ? { ...c, estado: actualizada.estado } : c)));
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupada(null);
    }
  }

  return (
    <div>
      <div className="topo">
        <h2>Contas</h2>
        <button onClick={carregar}>Actualizar</button>
      </div>

      {filtroCliente && (
        <div className="chip">
          Contas de {filtroCliente.nome} <button onClick={limparFiltro}>×</button>
        </div>
      )}

      <input
        className="pesquisa"
        placeholder="Pesquisar por número da conta ou nome do cliente"
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
      />

      {erro && <div className="erro">{erro}</div>}
      {aCarregar && <p className="suave">A carregar...</p>}

      {!aCarregar && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>Conta</th><th>Cliente</th><th className="dir">Saldo</th><th>Estado</th><th>Abertura</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtrada.map((c) => (
                <tr key={c.numero}>
                  <td><strong>{c.numero}</strong></td>
                  <td>{c.cliente?.nome}</td>
                  <td className="dir">{mt(c.saldo)}</td>
                  <td><span className={`etiqueta ${COR_ESTADO[c.estado] || 'cinza'}`}>{c.estado}</span></td>
                  <td>{data(c.dataAbertura)}</td>
                  <td className="linha-acoes">
                    <button onClick={() => setModal({ tipo: 'deposito', conta: c })}>Depósito</button>
                    <button onClick={() => setModal({ tipo: 'extracto', conta: c })}>Extracto</button>
                    <button disabled={ocupada === c.numero} onClick={() => alternarEstado(c)}>
                      {c.estado === 'BLOQUEADA' ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtrada.length === 0 && (
                <tr><td colSpan="6" className="vazio">Nenhuma conta encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === 'deposito' && (
        <Modal titulo="Depósito" onFechar={() => setModal(null)}>
          <FormDeposito
            conta={modal.conta}
            aoConcluir={(fez) => {
              setModal(null);
              if (fez) carregar();
            }}
          />
        </Modal>
      )}
      {modal?.tipo === 'extracto' && (
        <Modal titulo="Extracto" largo onFechar={() => setModal(null)}>
          <Extracto conta={modal.conta} />
        </Modal>
      )}
    </div>
  );
}
