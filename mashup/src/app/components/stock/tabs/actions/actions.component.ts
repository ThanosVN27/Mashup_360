import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContractLine, OrderLine } from '../../../../models/stock-aktions.model';
import { StockClientService } from '../../../../services/stock-client.service';

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
      { id: 'commandes',        name: '',             field: 'openOrderNumber', width: 110, align: 'center',
        formatter: () => `<button class="cmd-popup-btn">&#128196; Commandes</button>` },
      { id: 'customerCode',    name: 'Client',       field: 'customerCode',    width: 130, sortable: true, align: 'center', filterType: 'text' },
      { id: 'openOrderNumber', name: 'N° contrat',   field: 'openOrderNumber', width: 130, sortable: true, align: 'center', filterType: 'text' },
      { id: 'description',     name: 'Désignation',  field: 'description',     width: 450, sortable: true, align: 'center', filterType: 'text' },
      { id: 'status',          name: 'Statut',       field: 'status',          width: 160, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtStatus(v) },
      { id: 'lineStatus',      name: 'Statut ligne', field: 'lineStatus',      width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'startDate',       name: 'Date début',   field: 'startDate',       width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'endValidityDate', name: 'Fin validité', field: 'endValidityDate', width: 120, sortable: true, align: 'center', filterType: 'text' },
      { id: 'contractQuantity',name: 'Qté contrat',  field: 'contractQuantity',width: 120, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
      { id: 'reservedQuantity',name: 'Qté réservée', field: 'reservedQuantity',width: 120, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
      { id: 'differenceQty',   name: 'Reste à commander',   field: 'contractQuantity',width: 150, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, _v: string, _col: any, item: any) => this.fmtDiff(item) },
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

  fmt(n: number): string {
    return Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

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

    this.filteredTotalContrat  = this.filteredContracts.reduce((s, c) => s + (parseFloat(c.contractQuantity) || 0), 0);
    this.filteredTotalReservee = this.filteredContracts.reduce((s, c) => s + (parseFloat(c.reservedQuantity)  || 0), 0);
  }

  fmtQty(v: string): string {
    const n = parseFloat(v);
    if (isNaN(n)) return v ?? '';
    const val = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return this.unms
      ? `${val} <em style="font-size:11px;color:#94a3b8;font-style:normal">${this.unms}</em>`
      : val;
  }

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
    if (code === '20') return `<span class="cst-badge cst-badge--actif">20 - Actif</span>`;
    if (code === '10') return `<span class="cst-badge cst-badge--prelim">10 - Préliminaire</span>`;
    return code;
  }

  private fmtDiff(item: any): string {
    const cq   = parseFloat(item?.contractQuantity ?? '0') || 0;
    const rq   = parseFloat(item?.reservedQuantity ?? '0') || 0;
    const diff = Math.round(cq - rq);
    const val  = Math.abs(diff).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const u    = this.unms ? ` <em style="font-size:10px;font-style:normal;opacity:0.7">${this.unms}</em>` : '';
    if (diff < 0)   return `<span class="diff-badge diff-badge--neg">-${val}${u}</span>`;
    if (diff === 0) return `<span class="diff-badge diff-badge--zero">${val}${u}</span>`;
    return `<span class="diff-badge diff-badge--pos">+${val}${u}</span>`;
  }
}
