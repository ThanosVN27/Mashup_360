import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { StockClientService } from '../../../../services/stock-client.service';
import { VenteMois } from '../../../../models/stock-aktions.model';
import { formatM3Num } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-cumul',
  templateUrl: './cumul.component.html',
  styleUrls:   ['./cumul.component.css'],
})
export class CumulComponent implements OnChanges, OnDestroy {

  @Input()  itno = '';
  @Input()  unms = '';
  @Output() ventesLoaded = new EventEmitter<number>();

  loading  = false;
  erreur:  string | null = null;
  ventes:  VenteMois[]         = [];
  colonnes: SohoDataGridColumn[] = [];

  readonly fmt = formatM3Num;

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
          this.ventesLoaded.emit(ventes.length);
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
        width: 250, sortable: true, filterType: 'text',"align": 'center',
      },
      {
        id: 'quantite', name: `Qté facturée${unms}`, field: 'quantite',
        width: 250, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: number) =>
          `<strong style="color:#1e293b">${formatM3Num(v)}</strong>`,
      },
      {
        id: 'nbLignes', name: 'Nb de lignes', field: 'nbLignes',
        width: 140, sortable: true, align: 'center', filterType: 'text',
      },
    ];
  }
}
