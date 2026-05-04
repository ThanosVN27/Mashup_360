import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';

@Component({
  selector: 'app-tab-ofpof',
  templateUrl: './ofpof.component.html',
  styleUrls: ['./ofpof.component.css']
})
export class OfPofComponent {
  @Input() lignes: StockMouvement[] = [];
}
