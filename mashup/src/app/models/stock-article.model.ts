export interface StockArticle {
  itno:     string;
  itds:     string;
  unms:     string;
  poidsNet: string;
  // Stocks agrégés (MMS200MI GetAggWhsGrp)
  aval:      number;  // Stock disponible       = AVAL
  effec:     number;  // Stock affectable       = AVAL - ALQT
  quqt:      number;  // Stock sous contrôle qualité
  rjqt:      number;  // Stock non conforme
  resaVente: number;  // Quantité allouée       = ALQT
  cofa:     string;  // Conditionnement formaté (MMS015MI COFA )
  alun:    string;  // Unité de conditionnement (MMS015MI ALUN)
  // Totaux flux mouvements (MMS080MI SelMtrlTrans)
  totalPof:          number;
  totalOf:           number;
  totalAchats:       number;
  totalReservations: number;
  totalActions:      number;
  // Totaux contrats Aktions (CMS100MI LstBulkLineArt)
  totalContrat: number;  // Σ UWAGQT
  totalLivree:  number;  // Σ UXDLQT
  totalReste:   number;  // Σ max(0, UWAGQT - UXDLQT)
}
