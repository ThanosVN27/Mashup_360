import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import {formatM3Date} from '../../../../shared/utils/m3-date.util';

@Component({
  selector: 'app-tab-ofpof',
  templateUrl: './ofpof.component.html',
  styleUrls: ['./ofpof.component.css']
})
export class OfPofComponent {
  @Input() lignes: StockMouvement[] = [];


  protected readonly formatM3Date = formatM3Date;
}
