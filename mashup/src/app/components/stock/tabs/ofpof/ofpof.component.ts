import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';

@Component({
  selector:    'app-tab-ofpof',
  templateUrl: './ofpof.component.html',
  styleUrls:   ['./ofpof.component.css'],
})
export class OfPofComponent {

  @Input() lignes: StockMouvement[] = [];

  readonly colonnes: SohoDataGridColumn[] = [
    {
      id:        'type',
      name:      'Type',
      field:     'orca',
      sortable:  false,
      formatter: (_row: number, _cell: number, value: string) =>
        value === '100'
          ? '<span class="badge-pof">POF</span>'
          : '<span class="badge-of">OF</span>',
    },
    { id: 'ridn', name: 'Numéro',         field: 'ridn', sortable: true },
    { id: 'stat', name: 'Statut',         field: 'stat', sortable: true },
    { id: 'trqt', name: 'Quantité',       field: 'trqt', sortable: true },
    { id: 'pldt', name: 'Date planifiée', field: 'pldt', sortable: true },
  ];
}
