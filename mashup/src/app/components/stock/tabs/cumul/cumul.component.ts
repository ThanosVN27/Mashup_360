import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { StockClientService } from '../../../../services/stock-client.service';
import { VenteMois } from '../../../../models/stock-aktions.model';

@Component({
  selector:    'app-tab-cumul',
  templateUrl: './cumul.component.html',
  styleUrls:   ['./cumul.component.css'],
})
export class CumulComponent implements OnChanges, OnDestroy {

  @Input() itno = '';
  @Input() unms = '';

  loading  = false;
  erreur:  string | null = null;
  ventes:  VenteMois[]         = [];
  colonnes: SohoDataGridColumn[] = [];

  get totalQuantite(): number { return this.ventes.reduce((s, v) => s + v.quantite, 0); }
  get totalLignes():   number { return this.ventes.reduce((s, v) => s + v.nbLignes,  0); }

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly clientService: StockClientService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unms'] || changes['itno']) {
      this.buildColonnes();
    }
    if (changes['itno'] && this.itno) {
      this.charger();
    }
  }

  private charger(): void {
    this.loading = true;
    this.erreur  = null;
    this.ventes  = [];
    this.clientService.getVentesStatut77(this.itno)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ventes => {
          this.ventes  = ventes;
          this.loading = false;
        },
        error: () => {
          this.erreur  = 'Erreur lors du chargement des ventes facturées.';
          this.loading = false;
        },
      });
  }

  private buildColonnes(): void {
    const unms = this.unms ? ` (${this.unms})` : '';
    this.colonnes = [
      {
        id: 'moisLabel', name: 'Mois', field: 'moisLabel',
        width: 200, sortable: true, filterType: 'text',
      },
      {
        id: 'quantite', name: `Qté facturée${unms}`, field: 'quantite',
        width: 220, sortable: true, align: 'right', filterType: 'integer',
        formatter: (_r: number, _c: number, v: number) =>
          `<strong style="color:#1e293b">${Math.round(v).toLocaleString('fr-FR')}</strong>`,
      },
      {
        id: 'nbLignes', name: 'Nb de lignes', field: 'nbLignes',
        width: 140, sortable: true, align: 'center', filterType: 'integer',
      },
    ];
  }
}
