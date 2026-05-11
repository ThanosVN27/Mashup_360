import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StockService } from '../../services/stock.service';
import { StockMouvementService } from '../../services/stock-mouvement.service';
import { StockArticle } from '../../models/stock-article.model';
import { StockMouvement } from '../../models/stock-mouvement.model';
import { RechercheEvent } from '../search/search.component';

@Component({
  selector:    'app-stock',
  templateUrl: './stock.component.html',
  styleUrls:   ['./stock.component.css'],
})
export class StockComponent implements OnDestroy {

  @Input() set recherche(params: RechercheEvent | null) {
    if (params?.itno) {
      this.whgrActuel = params.whgr;
      this.charger(params.itno, this.whgrActuel);
    }
  }

  loading     = false;
  erreur:     string | null = null;
  article:    StockArticle | null = null;
  mouvements: StockMouvement[] = [];
  activeTab   = 'synthese';
  whgrActuel  = '';
  badges:     Record<string, number> = {};

  readonly tabs = [
    { id: 'synthese', label: 'Synthèse', badge: false },
    { id: 'ofpof',   label: 'OF / POF',  badge: true  },
    { id: 'achats',  label: 'Achats',     badge: true  },
    { id: 'ventes',  label: 'Ventes',     badge: true  },
    { id: 'actions', label: 'Aktions',    badge: true  },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly stockService:     StockService,
    private readonly mouvementService: StockMouvementService,
  ) {}

  setTab(id: string): void {
    this.activeTab = id;
  }

  badgeFor(tabId: string): number {
    return this.badges[tabId] ?? 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private charger(code: string, whgr: string): void {
    this.loading    = true;
    this.erreur     = null;
    this.article    = null;
    this.mouvements = [];
    this.badges     = {};

    forkJoin({
      info:   this.stockService.getArticleInfo(code),
      poids:  this.stockService.getPoidsNet(code),
      stocks: this.stockService.getStocksAgreges(code, whgr),
      movs:   this.mouvementService.getAll(code, whgr),
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: ({ info, poids, stocks, movs }) => {
        const { itds, unms } = info;
        const { stqt, aval, quqt, rjqt } = stocks;
        const { totaux, badges } = this.calculerTotauxEtBadges(movs);
        this.mouvements = movs;
        this.badges     = badges;
        this.article    = {
          itno: code, itds, unms, poidsNet: poids,
          stqt, aval, quqt, rjqt,
          resaVente: stqt - aval,
          ...totaux,
        };
        this.loading = false;
      },
      error: () => {
        this.erreur  = `Erreur lors de la récupération des données pour l'article "${code}".`;
        this.loading = false;
      },
    });
  }

  private calculerTotauxEtBadges(movs: StockMouvement[]): {
    totaux: Pick<StockArticle, 'totalPof' | 'totalOf' | 'totalAchats' | 'totalReservations' | 'totalActions'>;
    badges: Record<string, number>;
  } {
    let totalPof = 0, totalOf = 0, totalAchats = 0, totalReservations = 0, totalActions = 0;
    let cntOfPof = 0, cntAchats = 0, cntVentes = 0, cntActions = 0;

    for (const m of movs) {
      if      (m.orca === '100' && m.stat !== '10') { totalPof         += m.trqt; cntOfPof++;  }
      else if (m.orca === '101')                    { totalOf          += m.trqt; cntOfPof++;  }
      else if (m.orca === '251')                    { totalAchats      += m.trqt; cntAchats++; }
      else if (m.orca === '311')                    { totalReservations += m.trqt; cntVentes++; }
      else if (m.orca === '030')                    { totalActions     += m.trqt; cntActions++; }
    }

    return {
      totaux: { totalPof, totalOf, totalAchats, totalReservations, totalActions },
      badges: { ofpof: cntOfPof, achats: cntAchats, ventes: cntVentes, actions: cntActions },
    };
  }
}
