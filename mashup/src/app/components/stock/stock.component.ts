import { Component, Input } from '@angular/core';
import { lastValueFrom } from 'rxjs';
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

  get ofpofLignes() {
    return this.mouvements.filter(m => (m.orca === '100' && m.stat !== '10') || m.orca === '101');
  }

  get reservationsLignes() {
    return this.mouvements.filter(m => m.orca === '311');
  }

  get achatsLignes(): StockMouvement[] {
    return this.mouvements.filter(m => m.orca === '251');
  }


  get actionsLignes(): StockMouvement[] {
    return this.mouvements.filter(m => m.orca === '030');
  }

  private async charger(code: string): Promise<void> {
    this.loading = true;
    this.erreur = null;
    this.article = null;

    try {
      const produit  = await lastValueFrom(this.stockService.getArticleInfo(code));
      const poids    = await lastValueFrom(this.stockService.getPoidsNet(code));
      const stocks   = await lastValueFrom(this.stockService.getStocksAgreges(code));
      const movs     = await lastValueFrom(this.stockService.getMouvements(code));

      this.mouvements = movs;

      // 2. On remplit l'objet article avec les données reçues
      this.article = {
        itno: code,
        itds: produit.itds,
        unms: produit.unms,
        poidsNet: poids,
        stqt: stocks.stqt,
        aval: stocks.aval,
        quqt: stocks.quqt,
        rjqt: stocks.rjqt,
        resaVente: stocks.stqt - stocks.aval,

        // Calcul des totaux pour l'onglet Synthèse
        totalPof:          this.somme(movs.filter(m => m.orca === '100' && m.stat !== '10')),
        totalOf:           this.somme(movs.filter(m => m.orca === '101')),
        totalAchats:       this.somme(movs.filter(m => m.orca === '251')),
        totalReservations: this.somme(movs.filter(m => m.orca === '311')),
        totalActions:      this.somme(movs.filter(m => m.orca === '030')),
      };

    } catch (err) {
      console.error('[Stock360] Erreur:', err);
      this.erreur = `Erreur sur l'article "${code}".`;
    } finally {
      this.loading = false;
    }
  }

  private somme(lignes: StockMouvement[]): number {
    return lignes.reduce((acc, m) => acc + m.trqt, 0);
  }
}
