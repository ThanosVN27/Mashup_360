import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';

@Component({
  selector:    'app-tab-reservations',
  templateUrl: './reservations.component.html',
  styleUrls:   ['./reservations.component.css'],
})
export class ReservationsComponent {
  // Entrée des données filtrées pour l'ORCA 311 uniquement
  @Input() lignes: StockMouvement[] = [];

  // Configuration des colonnes alignée sur le cahier des charges[cite: 8]
  readonly colonnes: SohoDataGridColumn[] = [
    {
      id: 'ridn',
      name: 'N° commande',
      field: 'ridn',
      filterType: 'text',
      sortable: true,
      width: 150
    },
    {
      id: 'trqt',
      name: 'Total réservé', // Libellé exact du cahier des charges[cite: 8]
      field: 'trqt',
      filterType: 'decimal',
      sortable: true,
      align: 'right'
    },
    {
      id: 'pldt',
      name: 'Date planifiée',
      field: 'pldt',
      filterType: 'date',
      sortable: true,
      formatter: Soho.Formatters.Date, // Formatteur de date Soho
      dateFormat: 'yyyyMMdd'
    },
  ];
}
