export interface StockArticle {
  itno:     string; // Numéro article
  itds:     string; // Description article
  unms:     string; // Unité de mesure stock
  poidsNet: string; // Poids net (N496 ou NEWE)
  cfi1:     string;  // Marque (MMS200MI Get CFI1)
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
  totalContrat: number;  //UWAGQT
  totalLivree:  number;  //UXDLQT
  totalReste:   number;  //max(0, UWAGQT - UXDLQT)
  // Cumul ventes facturées (EXPORTMI SelectPad OOLINE statut 77)
  totalVentesCumul: number;
}
