import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StockArticle } from '../../../../models/stock-article.model';
import { formatM3Num } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-synthese',
  templateUrl: './synthese.component.html',
  styleUrls:   ['./synthese.component.css'],
})
export class SyntheseComponent {

  @Input()  article!: StockArticle;
  @Output() tabChange         = new EventEmitter<string>();
  @Output() whgrSortantChange = new EventEmitter<string>();

  fluxEntrantOpen = true;
  fluxSortantOpen = true;

  readonly fmt = formatM3Num;

  /** Commandes clients (valeur positive). */
  get commandesClients(): number {
    return Math.abs(this.article.totalReservations);
  }

  /** Stock disponible net de commande = stock affectable − commandes clients. */
  get stockNetCommande(): number {
    return this.article.effec - this.commandesClients;
  }
}
