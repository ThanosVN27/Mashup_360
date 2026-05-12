export interface StockArticle {
  itno: string;
  itds: string;
  unms: string;
  poidsNet: string;
  // Stocks agrégés (MMS200MI GetAggWhsGrp)
  stqt: number;
  aval: number;
  alqt: number;
  quqt: number;
  rjqt: number;
  // Calculé : stock disponible - stock affectable
  resaVente: number;
  // Totaux flux calculés depuis mouvements (MMS080MI SelMtrlTrans)
  totalPof: number;
  totalOf: number;
  totalAchats: number;
  totalReservations: number;
  totalActions: number;
}
