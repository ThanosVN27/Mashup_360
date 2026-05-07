import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StockAchatService } from '../../../../services/stock-achat.service';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-achats',
  templateUrl: './achats.component.html',
  styleUrls:   ['./achats.component.css'],
})
export class AchatsComponent implements OnChanges, OnDestroy {
  @Input() itno = '';
  @Input() whgr = 'GRP_ENTREPRISE';

  lignes: StockMouvement[] = [];
  isLoading = false;
  errorMessage = '';

  private sub?: Subscription;

  readonly colonnes: SohoDataGridColumn[] = [
    { id: 'ridn', name: 'N° Commande',      field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
    { id: 'ridl', name: 'N° Ligne',         field: 'ridl', width: 120, sortable: true, align: 'center', filterType: 'text' },
    { id: 'trqt', name: 'Quantité achetée', field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'decimal', formatter: Soho.Formatters.Integer },
    {
      id: 'pldt', name: 'Date planifiée', field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',
      formatter: (_r: number, _c: number, v: string) => formatM3Date(v),
    },
    { id: 'stat', name: 'Statut', field: 'stat', width: 200, align: 'center', filterType: 'text' },
  ];

  constructor(private readonly achatService: StockAchatService) {}

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
    this.sub = this.achatService.getAchats(this.itno, this.whgr).subscribe({
      next: (data) => {
        this.lignes = [...data].sort((a, b) => a.pldt.localeCompare(b.pldt));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement achats';
        this.isLoading = false;
      },
    });
  }
}
