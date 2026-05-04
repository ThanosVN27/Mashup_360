import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';


@Component({
  selector:    'app-tab-achats',
  templateUrl: './achats.component.html',
  styleUrls:   ['./achats.component.css'],
})
export class AchatsComponent {
  @Input() lignes: StockMouvement[] = [];

  readonly colonnes: SohoDataGridColumn[] = [
    { id: 'ridn', name: 'N° commande', field: 'ridn', sortable: true },
    { id: 'trqt', name: 'Quantité', field: 'trqt', sortable: true, numberFormat: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
    { id: 'codt', name: 'Date livraison', field: 'codt', sortable: true },
  ];

  private formatDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return dateStr; // Retourne tel quel si le format est inattendu
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  }
}
