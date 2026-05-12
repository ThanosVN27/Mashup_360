import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StockArticle } from '../../../../models/stock-article.model';

@Component({
  selector:    'app-tab-synthese',
  templateUrl: './synthese.component.html',
  styleUrls:   ['./synthese.component.css'],
})
export class SyntheseComponent {

  @Input()  article!: StockArticle;
  @Output() tabChange = new EventEmitter<string>();

  fluxEntrantOpen = true;
  fluxSortantOpen = true;

  get totalEntrant(): number {
    return this.article.totalPof + this.article.totalOf + this.article.totalAchats;
  }

  get totalSortant(): number {
    return this.article.totalActions + this.article.totalReservations;
  }

  get resaVerifiee(): boolean {
    return this.article.totalReservations === this.article.resaVente;
  }

  fmt(v: number): string {
    return Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
