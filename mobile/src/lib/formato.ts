// 12500 -> "12.500,00 MT"
export function formatarMT(valor: number | string): string {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '-';
  const [inteiro, decimais] = n.toFixed(2).split('.');
  return `${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimais} MT`;
}

// "2026-11-07T10:06:24.69164" -> "07/11/2026 10:06"
export function formatarData(texto?: string): string {
  const m = texto?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : (texto ?? '');
}
