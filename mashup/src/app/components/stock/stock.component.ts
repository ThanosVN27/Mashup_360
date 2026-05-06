import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { StockService } from '../../services/stock.service';
import { StockMouvementService } from '../../services/stock-mouvement.service';
import { StockArticle } from '../../models/stock-article.model';
import { StockMouvement } from '../../models/stock-mouvement.model';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnDestroy {
  @Input() set itno(code: string) {
    if (code) this.charger(code);
  }

  loading = false;
  erreur: string | null = null;
  article: StockArticle | null = null;
  mouvements: StockMouvement[] = [];
  activeTab = 'synthese';

  readonly tabs = [
    { id: 'synthese',      label: 'Synthèse',        badge: false },
    { id: 'ofpof',        label: 'OF / POF',         badge: true  },
    { id: 'achats',       label: 'Achats',            badge: true  },
    { id: 'ventes', label: 'Ventes',     badge: true  },
    { id: 'actions',      label: 'Aktions',           badge: true  },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly stockService:     StockService,
    private readonly mouvementService: StockMouvementService,
  ) {}

  setTab(id: string): void { this.activeTab = id; }

  get ofpofLignes()        { return this.mouvements.filter(m => (m.orca === '100' && m.stat !== '10') || m.orca === '101'); }
  get achatsLignes()       { return this.mouvements.filter(m => m.orca === '251'); }
  get reservationsLignes() { return this.mouvements.filter(m => m.orca === '311'); }
  get actionsLignes()      { return this.mouvements.filter(m => m.orca === '030'); }

  badgeFor(id: string): number {
    const counts: Record<string, number> = {
      ofpof:        this.ofpofLignes.length,
      achats:       this.achatsLignes.length,
      reservations: this.reservationsLignes.length,
      actions:      this.actionsLignes.length,
    };
    return counts[id] ?? 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private charger(code: string): void {
    this.loading = true;
    this.erreur = null;
    this.article = null;
    this.mouvements = [];

    this.stockService.getArticleInfo(code).pipe(
      takeUntil(this.destroy$),
      switchMap(produit =>
        this.stockService.getPoidsNet(code).pipe(
          map(poidsNet => ({ ...produit, poidsNet }))
        )
      ),
      switchMap(info =>
        this.stockService.getStocksAgreges(code).pipe(
          map(stocks => ({ ...info, ...stocks }))
        )
      ),
      switchMap(combined =>
        this.mouvementService.getAll(code).pipe(
          map(movs => ({ ...combined, movs }))
        )
      ),
    ).subscribe({
      next: ({ itds, unms, poidsNet, stqt, aval, quqt, rjqt, movs }) => {
        this.mouvements = movs;
        this.article = {
          itno: code,
          itds,
          unms,
          poidsNet,
          stqt,
          aval,
          quqt,
          rjqt,
          resaVente:         stqt - aval,
          totalPof:          this.somme(movs.filter(m => m.orca === '100' && m.stat !== '10')) ,
          totalOf:           this.somme(movs.filter(m => m.orca === '101')),
          totalAchats:       this.somme(movs.filter(m => m.orca === '251')),
          totalReservations: this.somme(movs.filter(m => m.orca === '311')),
          totalActions:      this.somme(movs.filter(m => m.orca === '030')),
        };
        this.loading = false;
      },
      error: () => this.gererErreur(code),
    });
  }

  private gererErreur(code: string): void {
    this.erreur = `Erreur lors de la récupération des données pour l'article "${code}".`;
    this.loading = false;
  }

  private somme(lignes: StockMouvement[]): number {
    return lignes.reduce((acc, m) => acc + m.trqt, 0);
  }
}
