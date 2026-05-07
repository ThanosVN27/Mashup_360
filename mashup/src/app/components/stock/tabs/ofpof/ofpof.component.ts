import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StockProductionService } from '../../../../services/stock-production.service';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-ofpof',
  templateUrl: './ofpof.component.html',
  styleUrls:   ['./ofpof.component.css'],
})
export class OfPofComponent implements OnChanges, OnDestroy {
  @Input() itno = '';
  @Input() whgr = 'GRP_ENTREPRISE';

  lignes: StockMouvement[] = [];
  isLoading = false;
  errorMessage = '';

  private sub?: Subscription;

  readonly colonnes: SohoDataGridColumn[] = [
    {
      id: 'type', name: 'Type', field: 'orca', width: 200, align: 'center', filterType: 'text',
      formatter: (_row: number, _cell: number, value: string) => {
        const label    = value === '100' ? 'POF' : 'OF';
        const cssClass = value === '100' ? 'badge-pof' : 'badge-of';
        return `<span class="${cssClass}">${label}</span>`;
      },
    },
    { id: 'ridn', name: 'Numéro',              field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'trqt', name: 'Quantité à produire', field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'decimal', formatter: Soho.Formatters.Integer },
    {
      id: 'pldt', name: 'Date', field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',
      formatter: (_row: number, _cell: number, value: string) => formatM3Date(value),
    },
    { id: 'stat', name: 'Statut', field: 'stat', width: 200, align: 'center', filterType: 'text' },
  ];

  constructor(private readonly productionService: StockProductionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['itno'] || changes['whgr']) && this.itno) {
      this.charger();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private charger(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.lignes = [];
    this.sub?.unsubscribe();
    this.sub = this.productionService.getProduction(this.itno, this.whgr).subscribe({
      next: (data) => {
        this.lignes = [...data].sort((a, b) => a.pldt.localeCompare(b.pldt));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement OF/POF';
        this.isLoading = false;
      },
    });
  }
}
