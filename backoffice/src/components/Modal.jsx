export default function Modal({ titulo, onFechar, largo = false, children }) {
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className={`modal ${largo ? 'largo' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-topo">
          <h3>{titulo}</h3>
          <button className="icone" onClick={onFechar} aria-label="Fechar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
