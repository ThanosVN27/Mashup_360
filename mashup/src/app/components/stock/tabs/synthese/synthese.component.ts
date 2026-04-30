import { Component, Input } from '@angular/core';
import { StockArticle } from '../../../../models/stock-article.model';

@Component({
  selector:    'app-tab-synthese',
  templateUrl: './synthese.component.html',
  styleUrls:   ['./synthese.component.css'],
})
export class SyntheseComponent {

  @Input() article!: StockArticle;

  get resaVerifiee(): boolean {
    return this.article.totalReservations === this.article.resaVente;
  }
}
