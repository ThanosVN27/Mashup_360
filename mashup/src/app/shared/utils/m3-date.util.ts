export function formatM3Date(dateValue: string): string {
  if (!dateValue || dateValue.length !== 8) {
    return dateValue ?? '';
  }

  const year = dateValue.slice(0, 4);
  const month = dateValue.slice(4, 6);
  const day = dateValue.slice(6, 8);

  return `${day}/${month}/${year}`;
}
