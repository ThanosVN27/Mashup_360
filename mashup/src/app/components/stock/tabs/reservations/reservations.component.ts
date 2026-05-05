import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { SharedModule } from '../../../../shared/shared.module';
import {formatM3Date} from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-reservations',
  templateUrl: './reservations.component.html',
  styleUrls:   ['./reservations.component.css'],
  //standalone:  true,
  //imports:     [SharedModule],
})
export class ReservationsComponent {
  @Input() lignes: StockMouvement[] = [];

  // Définition des colonnes pour les réservations (ORCA 311)[cite: 1, 4]
  readonly colonnes: SohoDataGridColumn[] = [
    {
      id: 'ridn',
      name: 'N° Commande',
      field: 'ridn',
      sortable: true,
      filterType: 'text'
    },
    {
      id: 'trqt',
      name: 'Qté Réservée',
      field: 'trqt',
      sortable: true,
      align: 'right',
      formatter: Soho.Formatters.Integer // Quantité sans décimales[cite: 3]
    },
    {
      id: 'pldt',
      name: 'Date de Besoin',
      field: 'pldt',
      sortable: true,
      formatter: Soho.Formatters.Date,
      dateFormat: 'dd/MM/yyyy'
    },
    {
      id: 'stat',
      name: 'Statut',
      field: 'stat',
      width: 80
    }
  ];
  protected readonly formatM3Date = formatM3Date;
}
