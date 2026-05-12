const STATUS_LABELS: Record<string, string> = {
  // OF / POF — Ordres de fabrication & Propositions
  // '10': 'Préliminaire',
  // '15': 'Approuvé',
  // '20': 'Actif',
  // '30': 'Lancé / Partiellement sorti',
  // '40': 'Partiellement réceptionné',
  // '90': 'Terminé',
  // '99': 'Fermé',

  // // Achats — Commandes d'achat
  // '35': 'Imprimé',
  // '45': 'Partiellement livré',
  // '50': 'En cours de traitement',
  // '55': 'Livré',
  // '60': 'Partiellement facturé',
  // '65': 'Facturé',

  // // Réservations client — Lignes commande client (ORCA 311)
  // '22': 'Réservé',
  // '23': 'Réservé / Affecté',
  // '24': 'Réservé / Liste prélèv',
  // '26': 'Réservé / Livré',
  // '27': 'Réservé / Facturé',
  // '29': 'Réservé / Terminé',
  // '33': 'Affecté',
  // '34': 'Affecté / Liste prélèv',
  // '36': 'Affecté / Livré',
  // '37': 'Affecté / Facturé',
  // '39': 'Affecté / Terminé',
  // '44': 'Liste prélèvmnt',
  // '47': 'Liste prélèv / Facturé',
  // '49': 'Liste prélèv / Terminé',
  // '66': 'Livré',
  // '67': 'Livré / Facturé',
  // '69': 'Livré / Terminé',
  // '77': 'Facturé',
  // '79': 'Facturé / Terminé',
  // '88': 'Supprimé',
};

export function formatM3Status(code: string): string {
  if (!code) return '';
  const key   = code.trim();
  const label = STATUS_LABELS[key];
  return label ? `${key} - ${label}` : key;
}

const VENTE_STATUS_LABELS: Record<string, string> = {
  '10': 'Préliminaire',
  '20': 'Actif',
  // Lignes commande client — statuts de livraison
  '22': 'Réservé',
  '23': 'Réservé / Affecté',
  '24': 'Réservé / Liste prélèv',
  '26': 'Réservé / Livré',
  '27': 'Réservé / Facturé',
  '29': 'Réservé / Terminé',
  '33': 'Affecté',
  '34': 'Affecté / Liste prélèv',
  '36': 'Affecté / Livré',
  '37': 'Affecté / Facturé',
  '39': 'Affecté / Terminé',
  '44': 'Liste prélèvmnt',
  '47': 'Liste prélèv / Facturé',
  '49': 'Liste prélèv / Terminé',
  '66': 'Livré',
  '67': 'Livré / Facturé',
  '69': 'Livré / Terminé',
  '77': 'Facturé',
  '79': 'Facturé / Terminé',
  '88': 'Supprimé',
};

export function formatM3VenteStatus(code: string): string {
  if (!code) return '';
  const key   = code.trim();
  const label = VENTE_STATUS_LABELS[key];
  return label ? `${key} - ${label}` : key;
}
