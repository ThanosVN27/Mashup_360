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
  filteredTotalFacture  = 0;
  filteredTotalReste    = 0;

  dateFrom    = '';
  filterAktion: '' | 'Oui' | 'Non' = '';
  dateTo   = '';

  popupVisible      = false;
  popupLoading      = false;
  popupOrders:      OrderLine[]         = [];
  popupError        = '';
  selectedContract: ContractLine | null = null;

  readonly fmt = formatM3Num;

  private readonly STATUS_MAP: Record<string, [string, string]> = {
    '10': ['background:#fef9c3;color:#854d0e;border:1px solid #fde68a;', 'Préliminaire'],
    '20': ['background:#dcfce7;color:#166534;border:1px solid #86efac;', 'Actif'],
    '40': ['background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;', 'En cours'],
    '80': ['background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;', 'Clôturé'],
    '90': ['background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;', 'Annulé'],
  };

  constructor(private readonly clientService: StockClientService) {}


  ngOnInit(): void {
    this.colonnesContrat = [
      {
        id: 'commandes', name: '', field: 'openOrderNumber',
        width: 120, align: 'center',
        formatter: () => this.btnCommandes(),
      },
      {
        id: 'customerCode', name: 'Client', field: 'customerCode',
        width: 95, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'openOrderNumber', name: 'N°Cde ouverte', field: 'openOrderNumber',
        width: 95, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'description', name: 'Désignation', field: 'description',
        width: 325, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'status', name: 'Statut', field: 'status',
        width: 105, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtStatus(v),
      },
      {
        id: 'lineStatus', name: 'Statut ligne', field: 'lineStatus',
        width: 105, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtStatus(v),
      },
      {
        id: 'startDate', name: 'Date début', field: 'startDate',
        width: 100, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'endValidityDate', name: 'Fin validité', field: 'endValidityDate',
        width: 100, sortable: true, align: 'center', filterType: 'text',
      },
      {
        id: 'contractQuantity', name: 'Qté contrat', field: 'contractQuantity',
        width: 100, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'reservedQuantity', name: 'Qté réservée', field: 'reservedQuantity',
        width: 100, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'deliveredQuantity', name: 'Qté livrée', field: 'deliveredQuantity',
        width: 100, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'facturedQuantity', name: 'Qté facturée', field: 'facturedQuantity',
        width: 100, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'differenceQty', name: 'Reste à commander', field: 'resteACommander',
        width: 127, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) => this.fmtQty(v),
      },
      {
        id: 'qtDefinitive', name: 'Qté définitive', field: 'qtDefinitiveLabel',
        width: 110, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) =>
          v === 'Qté Définitive'
            ? this.badge('#dcfce7', '#166534', '#86efac', 'Qté Définitive')
            : this.badge('#fef9c3', '#854d0e', '#fde68a', 'Qté Préliminaire'),
      },
      {
        id: 'aktionTerminee', name: 'Aktion terminée', field: 'aktionTermineeLabel',
        width: 110, sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) =>
          v === 'Oui'
            ? this.badge('#dcfce7', '#166534', '#86efac', 'Oui')
            : this.badge('#f1f5f9', '#475569', '#cbd5e1', 'Non'),
      },
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

  applyFilter(): void {
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to   = this.dateTo   ? new Date(this.dateTo)   : null;

    this.filteredContracts = this.contracts.filter(c => {
      if (this.filterAktion && c.aktionTermineeLabel !== this.filterAktion) return false;
      const d = this.parseContractDate(c.startDate);
      if (!d)               return true;
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    });

    this.filteredContracts.sort((a, b) => {
      const da = this.parseContractDate(a.startDate);
      const db = this.parseContractDate(b.startDate);
      if (!da && !db) return 0;
      if (!da)        return 1;
      if (!db)        return -1;
      return da.getTime() - db.getTime();
    });

    let contrat = 0, reservee = 0, livree = 0, facture = 0, reste = 0;

    for (const c of this.filteredContracts) {
      contrat  += Math.max(0, parseFloat(c.contractQuantity.toString())  || 0);
      reservee += Math.max(0, parseFloat(c.reservedQuantity.toString())  || 0);
      livree   += Math.max(0, parseFloat(c.deliveredQuantity.toString()) || 0);
      facture  += Math.max(0, parseFloat(c.facturedQuantity.toString())  || 0);
      if (!c.aktionTerminee) {
        reste  += Math.max(0, parseFloat(c.resteACommander.toString())   || 0);
      }
    }

    this.filteredTotalContrat  = contrat;
    this.filteredTotalReservee = reservee;
    this.filteredTotalLivree   = livree;
    this.filteredTotalFacture  = facture;
    this.filteredTotalReste    = reste;
  }

  resetDates(): void {
    this.dateFrom = '';
    this.dateTo   = '';
    this.applyFilter();
  }

  closePopup(): void {
    this.popupVisible = false;
  }

  fmtQty(v: string): string {
    return formatM3QtyHtml(v, this.unms);
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
      error: () => {
        this.loadingContracts = false;
      },
    });
  }

  private parseContractDate(s: string): Date | null {
    if (!s || s.length !== 10) return null;
    const [d, m, y] = s.split('/');
    const dt = new Date(+y, +m - 1, +d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // Génère le bouton HTML "Commandes" affiché dans la première colonne
  private btnCommandes(): string {
    const style =
      'display:inline-flex;align-items:center;gap:5px;padding:4px 10px;' +
      'background:#fff;color:#0b6cbb;border:1.5px solid #0b6cbb;border-radius:6px;' +
      'font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;';

    const icon =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<line x1="16" y1="13" x2="8" y2="13"/>' +
      '<line x1="16" y1="17" x2="8" y2="17"/>' +
      '<polyline points="10 9 9 9 8 9"/></svg>';

    return (
      `<button style="${style}" ` +
      `onmouseover="this.style.background='#e8f0fb'" ` +
      `onmouseout="this.style.background='#fff'">${icon}Commandes</button>`
    );
  }

  private badge(bg: string, color: string, border: string, text: string): string {
    return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${bg};color:${color};border:1px solid ${border};">${text}</span>`;
  }

  private fmtStatus(v: string): string {
    const code = (v ?? '').trim();
    if (!code) return '';
    const [colors, label] = this.STATUS_MAP[code] ?? ['background:#f9fafb;color:#374151;border:1px solid #e5e7eb;', ''];
    const display = label ? `${code}&nbsp;–&nbsp;${label}` : code;
    return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;${colors}">${display}</span>`;
  }
}
