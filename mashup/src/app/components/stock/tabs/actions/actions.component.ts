import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import {SohoDataGridComponent } from 'ids-enterprise-ng';

@Component({
  selector:    'app-tab-actions',
  templateUrl: './actions.component.html',
  styleUrls:   ['./actions.component.css'],
})
export class ActionsComponent {

  @Input() lignes: StockMouvement[] = [];

  readonly colonnes: SohoDataGridColumn[] = [
    { id: 'ridn', name: 'N° commande',    field: 'ridn', sortable: true },
    { id: 'rftx', name: 'Client',         field: 'rftx', sortable: true },
    { id: 'trqt', name: 'Quantité',       field: 'trqt', sortable: true, numberFormat: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
    { id: 'pldt', name: 'Date planifiée', field: 'pldt', sortable: true },
  ];
}
