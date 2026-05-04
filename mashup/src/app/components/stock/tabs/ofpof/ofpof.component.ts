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
    sortable:  true,
    // Utilisation des formateurs Soho standards pour plus de fiabilité
    formatter: Soho.Formatters.Text,
  },
  { id: 'ridn', name: 'Numéro',         field: 'ridn', sortable: true },
  { id: 'stat', name: 'Statut',         field: 'stat', sortable: true },
  { id: 'trqt', name: 'Quantité',       field: 'trqt', sortable: true, align: 'right' },
  {
    id: 'pldt',
    name: 'Date planifiée',
    field: 'pldt',
    sortable: true,
    formatter: Soho.Formatters.Date,
    dateFormat: 'yyyyMMdd'
  },
];
}
