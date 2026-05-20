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

  loading      = false;
  erreur:      string | null = null;
  article:     StockArticle | null = null;
  activeTab    = 'synthese';
  badges:      Record<string, number> = {};
  whgrSortant  = 'GRP_ENTREPRISE';

  movsOfPof:   StockMouvement[] = [];
  movsAchats:  StockMouvement[] = [];
  movsVentes:  StockMouvement[] = [];
  movsActions: StockMouvement[] = [];

  readonly tabs = [
    { id: 'synthese', label: 'Synthèse',             badge: false },
    { id: 'ofpof',   label: 'OF / POF',              badge: true  },
    { id: 'achats',  label: 'Achats',                badge: true  },
    { id: 'ventes',  label: 'Réservations client',   badge: true  },
    { id: 'actions', label: 'Aktions',               badge: true  },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly stockService:     StockService,
    private readonly mouvementService: StockMouvementService,
    private readonly clientService:    StockClientService,
  ) {}

  setTab(id: string): void { this.activeTab = id; }

  updateActionsBadge(count: number): void {
    this.badges = { ...this.badges, actions: count };
  }

  badgeFor(tabId: string): number { return this.badges[tabId] ?? 0; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Rechargement des seules données sortant (Aktions + Réservations) avec un nouveau groupe. */
  rechargerSortant(whgr: string): void {
    if (!this.article) return;
    this.whgrSortant = whgr;
    const itno = this.article.itno;

    forkJoin({
      movs:     this.mouvementService.getAll(itno, whgr),
      contract: this.clientService.getReservations(itno, whgr),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ movs, contract }) => {
        let totalActions = 0;
        const actions: StockMouvement[] = [];

        for (const m of movs) {
          if (m.orca === '030' && m.ori1 !== 'RES') {
            totalActions += m.trqt;
            actions.push(m);
          }
        }

        const byDate = (a: StockMouvement, b: StockMouvement) => a.pldt.localeCompare(b.pldt);
        const totalReservations = contract.reduce((sum, m) => sum + m.trqt, 0);

        this.movsVentes  = contract;
        this.movsActions = actions.sort(byDate);
        this.badges      = { ...this.badges, ventes: contract.length, actions: actions.length };
        this.article     = { ...this.article!, totalActions, totalReservations };
      },
    });
  }

  private charger(code: string, whgr: string): void {
    this.loading     = true;
    this.erreur      = null;
    this.article     = null;
    this.badges      = {};
    this.movsOfPof   = [];
    this.movsAchats  = [];
    this.movsVentes  = [];
    this.movsActions = [];

    forkJoin({
      info:        this.stockService.getArticleInfo(code),
      poids:       this.stockService.getPoidsNet(code),
      stocks:      this.stockService.getStocksAgreges(code, whgr),
      movsEntrant: this.mouvementService.getAll(code, whgr),
      movsSortant: this.mouvementService.getAll(code, this.whgrSortant),
      contract:    this.clientService.getReservations(code, this.whgrSortant),
      aktions:     this.clientService.getContractsByArticle(code),
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: ({ info, poids, stocks, movsEntrant, movsSortant, contract, aktions }) => {
        const { itds, unms }              = info;
        const { aval, alqt, quqt, rjqt } = stocks;
        const { totaux, badges, filtres } = this.traiterMouvements(movsEntrant, movsSortant, contract);

        const totalContrat = aktions.reduce((s, c) => s + (parseFloat(c.contractQuantity)  || 0), 0);
        const totalLivree  = aktions.reduce((s, c) => s + (parseFloat(c.deliveredQuantity) || 0), 0);
        const totalReste   = aktions.reduce((s, c) => s + Math.max(0, parseFloat(c.resteACommander) || 0), 0);

        this.badges      = { ...badges, actions: aktions.length };
        this.movsOfPof   = filtres.ofpof;
        this.movsAchats  = filtres.achats;
        this.movsVentes  = contract;
        this.movsActions = filtres.actions;
        this.article     = {
          itno: code, itds, unms, poidsNet: poids,
          aval,
          effec: aval - alqt,
          quqt, rjqt,
          resaVente: alqt,
          totalContrat, totalLivree, totalReste,
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

  private traiterMouvements(
    movsEntrant: StockMouvement[],
    movsSortant: StockMouvement[],
    ventes:      StockMouvement[],
  ): {
    totaux:  Pick<StockArticle, 'totalPof' | 'totalOf' | 'totalAchats' | 'totalReservations' | 'totalActions'>;
    badges:  Record<string, number>;
    filtres: { ofpof: StockMouvement[]; achats: StockMouvement[]; actions: StockMouvement[] };
  } {
    let totalPof = 0, totalOf = 0, totalAchats = 0, totalActions = 0;
    const ofpof: StockMouvement[] = [], achats: StockMouvement[] = [], actions: StockMouvement[] = [];

    for (const m of movsEntrant) {
      if      (m.orca === '100' && m.stat !== '10') { totalPof    += m.trqt; ofpof.push(m);  }
      else if (m.orca === '101')                    { totalOf     += m.trqt; ofpof.push(m);  }
      else if (m.orca === '251' && parseInt(m.stat, 10) < 50) { totalAchats += m.trqt; achats.push(m); }
    }

    for (const m of movsSortant) {
      if (m.orca === '030' && m.ori1 !== 'RES') { totalActions += m.trqt; actions.push(m); }
    }

    const byDate = (a: StockMouvement, b: StockMouvement) => a.pldt.localeCompare(b.pldt);
    ofpof.sort(byDate); achats.sort(byDate); actions.sort(byDate);

    const totalReservations = ventes.reduce((sum, m) => sum + m.trqt, 0);

    return {
      totaux:  { totalPof, totalOf, totalAchats, totalReservations, totalActions },
      badges:  { ofpof: ofpof.length, achats: achats.length, ventes: ventes.length, actions: 0 },
      filtres: { ofpof, achats, actions },
    };
  }
}
