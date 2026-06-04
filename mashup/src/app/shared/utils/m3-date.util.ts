export function formatM3Num(n: number): string {
  return Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatM3Qty(v: number, unms: string): string {
  const rounded = formatM3Num(v);
  return unms ? `${rounded} ${unms}` : rounded;
}

export function formatM3QtyHtml(v: string | number, unms: string): string {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return String(v ?? '');
  const formatted = formatM3Num(n);
  return unms
    ? `<span style="white-space:nowrap">${formatted}&nbsp;<em style="font-size:11px;color:#94a3b8;font-style:normal">${unms}</em></span>`
    : formatted;
}

export function formatM3Date(dateValue: string): string {
  if (!dateValue || dateValue.length !== 8) return dateValue ?? '';
  return `${dateValue.slice(6, 8)}/${dateValue.slice(4, 6)}/${dateValue.slice(0, 4)}`;
}
