export function mt(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '-';
  const [inteiro, decimais] = n.toFixed(2).split('.');
  return `${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimais} MT`;
}

export function data(texto) {
  const m = texto?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : (texto ?? '');
}
