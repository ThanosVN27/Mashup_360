import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date, formatM3Qty } from '../../../../shared/utils/m3-date.util';
import { formatM3Status } from '../../../../shared/utils/m3-status.util';

@Component({
  selector:    'app-tab-actions',
  templateUrl: './actions.component.html',
  styleUrls:   ['./actions.component.css'],
})
export class ActionsComponent implements OnChanges {

  @Input() lignes: StockMouvement[] = [];
  @Input() unms = '';

  colonnes: SohoDataGridColumn[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unms']) {
      this.colonnes = [
        { id: 'ridn', name: 'Ordre de Commande', field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'ridl', name: 'N° Ligne',          field: 'ridl', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'rftx', name: 'Contrat',           field: 'rftx', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'trqt', name: 'Total réservé',     field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: number) => formatM3Qty(v, this.unms) },
        { id: 'pldt', name: 'Date planifiée',    field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: string) => formatM3Date(v) },
        { id: 'stat', name: 'Statut',            field: 'stat', width: 250, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: string) => formatM3Status(v) },
      ];
    }
  }
}
