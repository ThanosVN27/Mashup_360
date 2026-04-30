import { Component, Input } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StockService } from '../../services/stock.service';
import { StockArticle } from '../../models/stock-article.model';
import { StockMouvement } from '../../models/stock-mouvement.model';

@Component({
  selector:    'app-stock',
  templateUrl: './stock.component.html',
  styleUrls:   ['./stock.component.css'],
})
export class StockComponent {

  @Input() set itno(code: string) {
    if (!code) { return; }
    this.charger(code);
  }

  loading    = false;
  erreur: string | null = null;
  article: StockArticle | null = null;
  mouvements: StockMouvement[] = [];
  activeTab  = 'synthese';

  readonly tabs = [
    { id: 'synthese',     label: 'Synthèse',        badge: false },
    { id: 'ofpof',        label: 'OF / POF',         badge: true  },
    { id: 'achats',       label: 'Achats',           badge: true  },
    { id: 'reservations', label: 'Réservations',     badge: true  },
    { id: 'actions',      label: 'Actions clients',  badge: true  },
  ];

  constructor(private readonly stockService: StockService) {}

  setTab(id: string): void { this.activeTab = id; }

  badgeFor(id: string): number {
    switch (id) {
      case 'ofpof':        return this.ofpofLignes.length;
      case 'achats':       return this.achatsLignes.length;
      case 'reservations': return this.reservationsLignes.length;
      case 'actions':      return this.actionsLignes.length;
      default:             return 0;
    }
  }

  get ofpofLignes(): StockMouvement[] {
    return this.mouvements.filter(
      m => (m.orca === '100' && m.stat !== '10') || m.orca === '101'
    );
  }

  get achatsLignes(): StockMouvement[] {
    return this.mouvements.filter(m => m.orca === '251');
  }

  get reservationsLignes(): StockMouvement[] {
    return this.mouvements.filter(m => m.orca === '311');
  }

  get actionsLignes(): StockMouvement[] {
    return this.mouvements.filter(m => m.orca === '030');
  }

  private charger(code: string): void {
    this.loading    = true;
    this.erreur     = null;
    this.article    = null;
    this.mouvements = [];

    forkJoin({
      produit:    this.stockService.getArticleInfo(code),
      poids:      this.stockService.getPoidsNet(code),
      stocks:     this.stockService.getStocksAgreges(code),
      mouvements: this.stockService.getMouvements(code),
    }).subscribe({
      next: ({ produit, poids, stocks, mouvements }) => {
        this.mouvements = mouvements;
        this.article = {
          itno:              code,
          itds:              produit.itds,
          unms:              produit.unms,
          poidsNet:          poids,
          stqt:              stocks.stqt,
          aval:              stocks.aval,
          quqt:              stocks.quqt,
          rjqt:              stocks.rjqt,
          resaVente:         stocks.stqt - stocks.aval,
          totalPof:          this.somme(mouvements.filter(m => m.orca === '100' && m.stat !== '10')),
          totalOf:           this.somme(mouvements.filter(m => m.orca === '101')),
          totalAchats:       this.somme(mouvements.filter(m => m.orca === '251')),
          totalReservations: this.somme(mouvements.filter(m => m.orca === '311')),
          totalActions:      this.somme(mouvements.filter(m => m.orca === '030')),
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('[Stock360] Erreur chargement article', err);
        this.erreur  = `Impossible de charger les données pour l'article "${code}". Vérifiez le code et réessayez.`;
        this.loading = false;
      },
    });
  }

  private somme(lignes: StockMouvement[]): number {
    return lignes.reduce((acc, m) => acc + m.trqt, 0);
  }
}
