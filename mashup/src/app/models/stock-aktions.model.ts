export interface ContractLine {
  id:                string;   // clé unique : customerCode-openOrderNumber-startDate-index
  command:           string;   // 'commande'
  circuitCode:       string;   // OSCHCT — code circuit commercial
  customerCode:      string;   // UWCUNO — code client groupe
  openOrderNumber:   string;   // UWAGNO — numéro de contrat (Aktion)
  description:       string;   // UYTX40 — désignation
  status:            string;   // UYAGST — statut début (10/20/80)
  lineStatus:        string;   // UWAGST — statut fin
  startValue1:       string;   // UWOBV1 — code article
  startDate:         string;   // UWSTDT — date début
  endValidityDate:   string;   // UWLVDT — date fin validité
  contractQuantity:  number;   // UWAGQT — quantité contrat
  reservedQuantity:  number;   // UXREQT — quantité réservée
  deliveredQuantity: number;   // UXDLQT — Qté livrée
  facturedQuantity:  number;   // UXIVQT — Qté facturée
  resteACommander:   number;   // V_RQCO — reste à commander (calculé côté M3)
  aktionTerminee:    number;   // F1CHB2 — 1 = aktion terminée (reste à commander exclu du total)
  aktionTermineeLabel: string;   // 'Oui' | 'Non' — champ texte pour le filtre SoHo
}


export interface OrderLine {
  orderNumber:            string;   // OBORNO — N° commande
  lineNumber:             string;   // OBPONR — N° ligne
  orderedQuantity:        string;   // OBORQT — Qté commandée
  requestedDeliveryDate:  string;   // OBDWDZ — Date livraison (JJ/MM/AAAA)
  deliveredQuantity:      string;   // OBDLQT — Qté livrée
  invoicedQuantity:       string;   // OBIVQT — Qté facturée
  orderStatus:            string;   // OBORST — Statut ligne
}
