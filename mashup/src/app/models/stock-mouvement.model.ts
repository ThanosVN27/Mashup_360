export interface StockMouvement {
  orca: string;   // Type de mouvement : 100=POF / 101=OF / 251=Achat / 311=Réservation / 030=Action
  ridn: string;   // Numéro ordre ou commande
  ridl: string;   // Numéro ligne commande (pour achats)
  trqt: number;   // Quantité mouvement
  pldt: string;   // Date planifiée (OF, réservations, actions)
  codt: string;   // Date livraison (achats ORCA 251)
  rftx: string;   // Nom client (actions ORCA 030 uniquement)
  stat: string;   // Statut (ORCA 100 stat=10 exclu des POF confirmées)
  rids: string;   // Suffixe ligne commande (POSX pour OIS100MI)
  agno: string;   // Numéro contrat (pour réservations)
}
