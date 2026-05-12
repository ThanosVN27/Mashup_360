export interface StockArticle {
  itno:     string;
  itds:     string;
  unms:     string;
  poidsNet: string;

  // ── Stocks agrégés (MMS200MI GetAggWhsGrp) ──────────────────────────────
  aval:      number;  // Stock disponible       = AVAL
  effec:     number;  // Stock affectable       = AVAL - ALQT
  quqt:      number;  // Stock sous contrôle qualité
  rjqt:      number;  // Stock non conforme
  resaVente: number;  // Quantité allouée       = ALQT

  // ── Totaux flux (MMS080MI SelMtrlTrans) ─────────────────────────────────
  totalPof:          number;  // POF confirmées  (ORCA=100, STAT≠10)
  totalOf:           number;  // OF lancés       (ORCA=101)
  totalAchats:       number;  // Achats          (ORCA=251)
  totalReservations: number;  // Réservations clients
  totalActions:      number;  // Aktions         (ORCA=030, ORI1≠RES)
}
