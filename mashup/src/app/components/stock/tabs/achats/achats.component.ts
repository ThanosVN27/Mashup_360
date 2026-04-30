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
    { id: 'ridn', name: 'N° commande',    field: 'ridn', sortable: true },
    { id: 'trqt', name: 'Quantité',       field: 'trqt', sortable: true },
    { id: 'codt', name: 'Date livraison', field: 'codt', sortable: true },
  ];
}
