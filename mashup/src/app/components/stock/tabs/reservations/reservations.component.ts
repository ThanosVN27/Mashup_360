import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-reservations',
  templateUrl: './reservations.component.html',
  styleUrls:   ['./reservations.component.css'],
})
export class ReservationsComponent {

  @Input() lignes: StockMouvement[] = [];

  readonly sortDate = { sortId: 'pldt', ascending: true };

  readonly colonnes: SohoDataGridColumn[] = [
    { id: 'ridn', name: 'N° Commande',    field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'ridl', name: 'N° Ligne',       field: 'ridl', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'agno', name: 'Contrat',        field: 'agno', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'trqt', name: 'Total réservé',  field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'decimal', formatter: Soho.Formatters.Integer },
    { id: 'pldt', name: 'Date planifiée', field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',formatter: (_r: number, _c: number, v: string) => formatM3Date(v),
    },
  ];

}
