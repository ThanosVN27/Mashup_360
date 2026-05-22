import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date, formatM3Num, formatM3QtyHtml } from '../../../../shared/utils/m3-date.util';
import { formatM3Status } from '../../../../shared/utils/m3-status.util';


@Component({
  selector:    'app-tab-achats',
  templateUrl: './achats.component.html',
  styleUrls:   ['./achats.component.css'],
})
export class AchatsComponent implements OnChanges {

  // ── Entrées ───────────────────────────────────────────────────────────

  @Input() lignes: StockMouvement[] = [];
  @Input() unms   = '';


  // ── État ──────────────────────────────────────────────────────────────

  colonnes: SohoDataGridColumn[] = [];


  // ── Calculés ──────────────────────────────────────────────────────────

  get totalQty(): number {
    return this.lignes.reduce((s, l) => s + l.trqt, 0);
  }


  // ── Formatters ────────────────────────────────────────────────────────

  readonly fmt = formatM3Num;

  fmtQty(v: string): string {
    return formatM3QtyHtml(v, this.unms);
  }


  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['unms']) return;

    this.colonnes = [
      {
        id: 'ridn', name: 'N° Commande', field: 'ridn',
        width: 250, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'ridl', name: 'N° Ligne', field: 'ridl',
        width: 125, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'whlo', name: 'Entrepôt', field: 'whlo',
        width: 250, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'trqt', name: 'Quantité achetée', field: 'trqt',
        width: 250, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'pldt', name: 'Date planifiée', field: 'pldt',
        width: 250, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => formatM3Date(v),
      },
      {
        id: 'stat', name: 'Statut', field: 'stat',
        width: 250, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => formatM3Status(v),
      },
    ];
  }
}
