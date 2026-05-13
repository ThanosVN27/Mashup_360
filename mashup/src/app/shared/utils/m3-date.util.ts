export function formatM3Qty(v: number, unms: string): string {
  const rounded = Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return unms ? `${rounded} ${unms}` : rounded;
}

export function formatM3Date(dateValue: string): string {
  if (!dateValue || dateValue.length !== 8) {
    return dateValue ?? '';
  }

  const year = dateValue.slice(0, 4);
  const month = dateValue.slice(4, 6);
  const day = dateValue.slice(6, 8);

  return `${day}/${month}/${year}`;
}

function fmtQty(_r: number, _c: number, v: string): string {
  const n = parseFloat(v);
  if (isNaN(n)) return v ?? '';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n));
}
