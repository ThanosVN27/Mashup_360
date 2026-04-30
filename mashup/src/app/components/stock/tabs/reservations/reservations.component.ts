import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';

@Component({
  selector:    'app-tab-reservations',
  templateUrl: './reservations.component.html',
  styleUrls:   ['./reservations.component.css'],
})
export class ReservationsComponent {

  @Input() lignes: StockMouvement[] = [];

  readonly colonnes: SohoDataGridColumn[] = [
    { id: 'ridn', name: 'N° commande',    field: 'ridn', sortable: true },
    { id: 'trqt', name: 'Qté réservée',   field: 'trqt', sortable: true },
    { id: 'pldt', name: 'Date planifiée', field: 'pldt', sortable: true },
  ];
}
