import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContractLine, OrderLine } from '../../../../models/stock-aktions.model';
import { StockClientService } from '../../../../services/stock-client.service';
import { formatM3Num, formatM3QtyHtml } from '../../../../shared/utils/m3-date.util';

@Component({
  selector:    'app-tab-actions',
  templateUrl: './actions.component.html',
  styleUrls:   ['./actions.component.css'],
})
export class ActionsComponent implements OnInit, OnChanges {

  @Input()  itno = '';
  @Input()  unms = '';
  @Output() contractsLoaded = new EventEmitter<number>();

  colonnesContrat: SohoDataGridColumn[] = [];

  loadingContracts      = false;
  contracts:            ContractLine[] = [];
  filteredContracts:    ContractLine[] = [];
  filteredTotalContrat  = 0;
  filteredTotalReservee = 0;
  filteredTotalLivree   = 0;
  filteredTotalReste    = 0;

  dateFrom = '';
  dateTo   = '';

  popupVisible      = false;
  popupLoading      = false;
  popupOrders:      OrderLine[]         = [];
  popupError        = '';
  selectedContract: ContractLine | null = null;

  constructor(private readonly clientService: StockClientService) {}

  ngOnInit(): void {
    this.colonnesContrat = [
      { id: 'commandes',        name: '',             field: 'openOrderNumber', width: 130, align: 'center',
        formatter: () => `<button style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:#fff;color:#0b6cbb;border:1.5px solid #0b6cbb;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background 0.15s;" onmouseover="this.style.background='#e8f0fb'" onmouseout="this.style.background='#fff'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Commandes</button>` },
      { id: 'customerCode',    name: 'Client',       field: 'customerCode',    width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'openOrderNumber', name: 'N° Cde ouverte',   field: 'openOrderNumber', width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'description',     name: 'Désignation',  field: 'description',     width: 400, sortable: true, align: 'center', filterType: 'text' },
      { id: 'status',          name: 'Statut',       field: 'status',          width: 120, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtStatus(v) },
      { id: 'lineStatus',      name: 'Statut ligne', field: 'lineStatus',      width: 120, sortable: true, align: 'center', filterType: 'text' ,
        formatter: (_r: number, _c: number, v: string) => this.fmtStatus(v) },
      { id: 'startDate',       name: 'Date début',   field: 'startDate',       width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'endValidityDate', name: 'Fin validité', field: 'endValidityDate', width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'contractQuantity',name: 'Qté contrat',  field: 'contractQuantity',width: 120, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
      { id: 'reservedQuantity', name: 'Qté réservée', field: 'reservedQuantity', width: 120, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
      { id: 'deliveredQuantity',name: 'Qté livrée',  field: 'deliveredQuantity',width: 120, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
      { id: 'differenceQty',   name: 'Reste à commander',   field: 'resteACommander',width: 150, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(String(Math.max(0, parseFloat(v) || 0))) },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itno'] && this.itno) {
      this.dateFrom = '';
      this.dateTo   = '';
      this.loadContracts();
    }
  }

  onRowClicked(event: any): void {
    if (event?.cell !== 0) return;
    const contract = event?.item as ContractLine;
    if (!contract?.openOrderNumber) return;

    this.selectedContract = contract;
    this.popupVisible     = true;
    this.popupLoading     = true;
    this.popupOrders      = [];
    this.popupError       = '';

    this.clientService.getOrderLines(contract.openOrderNumber, contract.startValue1).subscribe({
      next:  data => { this.popupOrders  = data; this.popupLoading = false; },
      error: ()   => { this.popupError   = 'Erreur lors du chargement des commandes.'; this.popupLoading = false; },
    });
  }

  resetDates(): void {
    this.dateFrom = '';
    this.dateTo   = '';
    this.applyFilter();
  }

  closePopup(): void { this.popupVisible = false; }

  readonly fmt = formatM3Num;

  applyFilter(): void {
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to   = this.dateTo   ? new Date(this.dateTo)   : null;

    this.filteredContracts = (!from && !to)
      ? [...this.contracts]
      : this.contracts.filter(c => {
          const d = this.parseContractDate(c.startDate);
          if (!d) return true;
          if (from && d < from) return false;
          if (to   && d > to)   return false;
          return true;
        });

    this.filteredContracts.sort((a, b) => {
      const da = this.parseContractDate(a.startDate);
      const db = this.parseContractDate(b.startDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });

    let contrat = 0, reservee = 0, livree = 0, reste = 0;
    for (const c of this.filteredContracts) {
      contrat  += parseFloat(c.contractQuantity)  || 0;
      reservee += parseFloat(c.reservedQuantity)  || 0;
      livree   += parseFloat(c.deliveredQuantity) || 0;
      reste    += Math.max(0, parseFloat(c.resteACommander) || 0);
    }
    this.filteredTotalContrat  = contrat;
    this.filteredTotalReservee = reservee;
    this.filteredTotalLivree   = livree;
    this.filteredTotalReste    = reste;
  }

  fmtQty(v: string): string { return formatM3QtyHtml(v, this.unms); }

  private loadContracts(): void {
    this.loadingContracts  = true;
    this.contracts         = [];
    this.filteredContracts = [];

    this.clientService.getContractsByArticle(this.itno).subscribe({
      next: data => {
        this.contracts    = data;
        this.loadingContracts = false;
        this.contractsLoaded.emit(data.length);
        this.applyFilter();
      },
      error: () => { this.loadingContracts = false; },
    });
  }

  private parseContractDate(s: string): Date | null {
    if (!s || s.length !== 10) return null;
    const [d, m, y] = s.split('/');
    const dt = new Date(+y, +m - 1, +d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private fmtStatus(v: string): string {
    const code = (v ?? '').trim();
    if (!code) return '';
    const style = 'display:inline-block;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:600;white-space:nowrap;';
    const map: Record<string, [string, string]> = {
      '10': ['background:#fef3c7;color:#92400e;', '10 - Préliminaire'],
      '20': ['background:#d1fae5;color:#065f46;', '20 - Actif'],
    };
    const [colors, label] = map[code] ?? ['background:#f9fafb;color:#374151;', code];
    return `<span style="${style}${colors}">${label}</span>`;
  }
}
