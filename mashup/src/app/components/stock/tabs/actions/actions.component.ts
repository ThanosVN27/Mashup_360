import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-actions',
  templateUrl: './actions.component.html',
  styleUrls:   ['./actions.component.css'],
})
export class ActionsComponent {

  @Input() lignes: StockMouvement[] = [];

  readonly colonnes: SohoDataGridColumn[] = [
    { id: 'ridn', name: 'N° Commande',    field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'ridl', name: 'N° Ligne',       field: 'ridl', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'rftx', name: 'Client',         field: 'rftx', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'trqt', name: 'Total réservé',  field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'decimal', formatter: Soho.Formatters.Integer },
    { id: 'pldt', name: 'Date planifiée', field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',formatter: (_r: number, _c: number, v: string) => formatM3Date(v),},
    { id: 'stat', name: 'Statut', field: 'stat', width: 200, align: 'center', filterType: 'text' },
  ];
}
