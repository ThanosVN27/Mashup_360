import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';

@Component({
  selector:    'app-tab-achats',
  templateUrl: './achats.component.html',
  styleUrls:   ['./achats.component.css'],
})
export class AchatsComponent {
  @Input() lignes: StockMouvement[] = [];

  colonnes:any[] = [
    { id: 'ridn', label: 'Référence' },
    { id: 'trqt', label: 'Quantité' },
    { id: 'pldt', label: 'Date' },
    { id: 'codt', label: 'Code' },
    { id: 'rftx', label: 'Libellé' },
    { id: 'stat', label: 'Statut' },
  ];
}
