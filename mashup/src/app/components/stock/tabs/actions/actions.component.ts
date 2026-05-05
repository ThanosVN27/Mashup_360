import { Component, Input } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import {formatM3Date} from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-actions',
  templateUrl: './actions.component.html',
  styleUrls:   ['./actions.component.css'],
})
export class ActionsComponent {
  @Input() lignes: StockMouvement[] = [];
  protected readonly formatM3Date = formatM3Date;
}
