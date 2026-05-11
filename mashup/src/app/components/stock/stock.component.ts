import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StockService } from '../../services/stock.service';
import { StockMouvementService } from '../../services/stock-mouvement.service';
import { StockClientService } from '../../services/stock-client.service';
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
      this.charger(params.itno, params.whgr);
    }
  }

  loading     = false;
  erreur:     string | null = null;
  article:    StockArticle | null = null;
  activeTab   = 'synthese';
  badges:     Record<string, number> = {};

  movsOfPof:   StockMouvement[] = [];
  movsAchats:  StockMouvement[] = [];
  movsVentes:  StockMouvement[] = [];
  movsActions: StockMouvement[] = [];

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
    private readonly clientService:    StockClientService,
  ) {}

  setTab(id: string): void { this.activeTab = id; }

  badgeFor(tabId: string): number { return this.badges[tabId] ?? 0; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private charger(code: string, whgr: string): void {
    this.loading      = true;
    this.erreur       = null;
    this.article      = null;
    this.badges       = {};
    this.movsOfPof    = [];
    this.movsAchats   = [];
    this.movsVentes   = [];
    this.movsActions  = [];

    forkJoin({
      info:   this.stockService.getArticleInfo(code),
      poids:  this.stockService.getPoidsNet(code),
      stocks: this.stockService.getStocksAgreges(code, whgr),
      movs:   this.mouvementService.getAll(code, whgr),
      contract: this.clientService.getReservations(code, whgr),
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: ({ info, poids, stocks, movs, contract }) => {
        const { itds, unms }       = info;
        const { stqt, aval, quqt, rjqt } = stocks;
        const { totaux, badges, filtres } = this.traiterMouvements(movs);

        this.badges      = badges;
        this.movsOfPof   = filtres.ofpof;
        this.movsAchats  = filtres.achats;
        this.movsVentes  = contract;
        this.movsActions = filtres.actions;
        this.article     = {
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

  private traiterMouvements(movs: StockMouvement[]): {
    totaux:  Pick<StockArticle, 'totalPof' | 'totalOf' | 'totalAchats' | 'totalReservations' | 'totalActions'>;
    badges:  Record<string, number>;
    filtres: { ofpof: StockMouvement[]; achats: StockMouvement[]; ventes: StockMouvement[]; actions: StockMouvement[] ,};
  } {
    let totalPof = 0, totalOf = 0, totalAchats = 0, totalReservations = 0, totalActions = 0;
    const ofpof: StockMouvement[] = [], achats: StockMouvement[] = [],
          ventes: StockMouvement[] = [], actions: StockMouvement[] = [];

    for (const m of movs) {
      if      (m.orca === '100' && m.stat !== '10') { totalPof          += m.trqt; ofpof.push(m);   }
      else if (m.orca === '101')                    { totalOf           += m.trqt; ofpof.push(m);   }
      else if (m.orca === '251')                    { totalAchats       += m.trqt; achats.push(m);  }
      else if (m.orca === '311')                    { totalReservations += m.trqt; ventes.push(m);  }
      else if (m.orca === '030')                    { totalActions      += m.trqt; actions.push(m); }
    }

    const byDate = (a: StockMouvement, b: StockMouvement) => a.pldt.localeCompare(b.pldt);
    ofpof.sort(byDate); achats.sort(byDate); ventes.sort(byDate); actions.sort(byDate);

    return {
      totaux:  { totalPof, totalOf, totalAchats, totalReservations, totalActions },
      badges:  { ofpof: ofpof.length, achats: achats.length, ventes: ventes.length, actions: actions.length },
      filtres: { ofpof, achats, ventes, actions },
    };
  }
}
