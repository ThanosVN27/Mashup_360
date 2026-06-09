export interface StockMouvement {
  orca: string;   // Type de mouvement : 100=POF / 101=OF / 251=Achat / 311=Réservation / 030=Action(Resavation+Aktions)
  ridn: string;   // Numéro ordre ou commande(OF, achats, réservations)
  ridl: string;   // Numéro ligne commande (pour achats)(Resavations et actions et achats )
  trqt: number;   // Quantité mouvement(Réservations et aktions et achats)
  pldt: string;   // Date planifiée (OF, réservations, actions)
  codt: string;   // Date livraison (achats ORCA 251)
  rftx: string;   // Nom client (actions ORCA 030 uniquement)
  stat: string;   // Statut (ORCA 100 stat=10 exclu des POF confirmées)
  rids: string;   // N ligne  (Achats Reservations et aktions)
  agno: string;   // Numéro contrat (pour réservations)
  pono: string;   // Code postal livraison (réservations)
  town: string;   // Ville de livraison (réservations)
  ori1: string;   // Origine du mouvement (ex: "RES" ou "BLK")
  whlo: string;   // Entrepôt
}
