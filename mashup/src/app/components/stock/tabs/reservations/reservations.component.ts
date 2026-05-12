import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date, formatM3Qty } from '../../../../shared/utils/m3-date.util';
import { formatM3VenteStatus } from '../../../../shared/utils/m3-status.util';

@Component({
  selector:    'app-tab-reservations',
  templateUrl: './reservations.component.html',
  styleUrls:   ['./reservations.component.css'],
})
export class ReservationsComponent implements OnChanges {

  @Input() lignes: StockMouvement[] = [];
  @Input() unms = '';

  readonly sortDate = { sortId: 'pldt', ascending: true };
  colonnes: SohoDataGridColumn[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unms']) {
      this.colonnes = [
        { id: 'ridn', name: 'N° Commande',    field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'ridl', name: 'N° Ligne',       field: 'ridl', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'rftx', name: 'Client',         field: 'rftx', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'agno', name: 'Contrat',        field: 'agno', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'trqt', name: 'Total réservé',  field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: number) => formatM3Qty(v, this.unms) },
        { id: 'pldt', name: 'Date planifiée', field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: string) => formatM3Date(v) },
        { id: 'stat', name: 'Statut de vente', field: 'stat', width: 250, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: string) => formatM3VenteStatus(v) },
      ];
    }
  }
}
