import { Component, Input } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { StockService } from '../../services/stock.service';
import { StockArticle } from '../../models/stock-article.model';
import { StockMouvement } from '../../models/stock-mouvement.model';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent {
  @Input() set itno(code: string) {
    if (code) this.charger(code);
  }

  loading = false;
  erreur: string | null = null;
  article: StockArticle | null = null;
  mouvements: StockMouvement[] = [];
  activeTab = 'synthese';

  readonly tabs = [
    { id: 'synthese', label: 'Synthèse', badge: false },
    { id: 'ofpof', label: 'OF / POF', badge: true },
    { id: 'achats', label: 'Achats', badge: true },
    { id: 'reservations', label: 'Réservations', badge: true },
    { id: 'actions', label: 'Actions clients', badge: true },
  ];

  constructor(private readonly stockService: StockService) {}

  setTab(id: string): void { this.activeTab = id; }

  // Optimisation : Utilisation des getters pour filtrer une seule fois[cite: 1, 4]
  get ofpofLignes() { return this.mouvements.filter(m => (m.orca === '100' && m.stat !== '10') || m.orca === '101'); }
  get reservationsLignes() { return this.mouvements.filter(m => m.orca === '311'); }
  get achatsLignes() { return this.mouvements.filter(m => m.orca === '251'); }
  get actionsLignes() { return this.mouvements.filter(m => m.orca === '030'); }

  badgeFor(id: string): number {
    const counts: Record<string, number> = {
      ofpof: this.ofpofLignes.length,
      achats: this.achatsLignes.length,
      reservations: this.reservationsLignes.length,
      actions: this.actionsLignes.length
    };
    return counts[id] || 0;
  }

  private async charger(code: string): Promise<void> {
    this.loading = true;
    this.erreur = null;
    this.article = null;
    this.mouvements = [];

    try {

      const [produit, poids, stocks, movs] = await Promise.all([
        lastValueFrom(this.stockService.getArticleInfo(code)),
        lastValueFrom(this.stockService.getPoidsNet(code)),
        lastValueFrom(this.stockService.getStocksAgreges(code)),
        lastValueFrom(this.stockService.getMouvements(code))
      ]);

      this.mouvements = movs;

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
        totalPof: this.somme(this.ofpofLignes),
        totalOf: this.somme(this.mouvements.filter(m => m.orca === '101')),
        totalAchats: this.somme(this.achatsLignes),
        totalReservations: this.somme(this.reservationsLignes),
        totalActions: this.somme(this.actionsLignes),
      };
    } catch (err) {
      this.erreur = `Erreur sur l'article "${code}".`;
    } finally {
      this.loading = false;
    }
  }

  private somme(lignes: StockMouvement[]): number {
    return lignes.reduce((acc, m) => acc + m.trqt, 0);
  }
}
