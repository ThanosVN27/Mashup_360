import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date, formatM3Num, formatM3QtyHtml } from '../../../../shared/utils/m3-date.util';
import { formatM3VenteStatus } from '../../../../shared/utils/m3-status.util';


@Component({
  selector:    'app-tab-reservations',
  templateUrl: './reservations.component.html',
  styleUrls:   ['./reservations.component.css'],
})
export class ReservationsComponent implements OnChanges {

  @Input() lignes: StockMouvement[] = [];
  @Input() unms   = '';

  readonly sortDate = { sortId: 'pldt', ascending: true };
  colonnes: SohoDataGridColumn[] = [];

  get totalQty(): number {
    return Math.abs(this.lignes.reduce((s, l) => s + l.trqt, 0));
  }

  readonly fmt = formatM3Num;

  fmtQty(v: string): string {
    return formatM3QtyHtml(v, this.unms);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['unms']) return;

    this.colonnes = [
      {
        id: 'ridn', name: 'N° Commande', field: 'ridn',
        width: 150, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'ridl', name: 'N°L', field: 'ridl',
        width: 50, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'rftx', name: 'Client', field: 'rftx',
        width: 150, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'cua3', name: 'Adresse', field: 'cua3',
        width: 350, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'agno', name: 'Contrat', field: 'agno',
        width: 100, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'trqt', name: 'Total réservé', field: 'trqt',
        width: 150, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'pldt', name: 'Date planifiée', field: 'pldt',
        width: 150, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => formatM3Date(v),
      },
      {
        id: 'stat', name: 'Statut de vente', field: 'stat',
        width: 150, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => formatM3VenteStatus(v),
      },
    ];
  }
}
