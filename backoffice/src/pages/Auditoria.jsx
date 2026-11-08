import { useEffect, useState } from 'react';
import { auditoria } from '../api.js';
import { data } from '../format.js';

export default function Auditoria() {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    auditoria()
      .then((l) => setLista([...l].reverse()))
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  return (
    <div>
      <div className="topo"><h2>Auditoria</h2></div>
      {erro && <div className="erro">{erro}</div>}
      {aCarregar && <p className="suave">A carregar...</p>}
      {!aCarregar && !erro && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr><th>Data</th><th>Autor</th><th>Perfil</th><th>Acção</th><th>Entidade</th><th>Detalhe</th></tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}>
                  <td>{data(a.dataHora)}</td>
                  <td>{a.autor}</td>
                  <td>{a.perfil}</td>
                  <td>{a.acao}</td>
                  <td>{a.entidade}</td>
                  <td>{a.detalhe}</td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan="6" className="vazio">Sem registos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
