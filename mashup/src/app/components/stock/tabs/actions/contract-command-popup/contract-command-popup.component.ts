import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ContractLine, OrderLine } from '../../../../../models/stock-aktions.model';

const ORDER_STATUS_CLS: Record<string, string> = {
  '11': 'os-confirmed',
  '33': 'os-partial',
  '44': 'os-delivered',
  '55': 'os-pinvoiced',
  '66': 'os-invoiced',
  '77': 'os-closed',
  '90': 'os-cancelled',
};

@Component({
  selector:        'app-contract-command-popup',
  templateUrl:     './contract-command-popup.component.html',
  styleUrls:       ['./contract-command-popup.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractCommandPopupComponent implements OnChanges {

  @Input()  visible:          boolean             = false;
  @Input()  selectedContract: ContractLine | null = null;
  @Input()  orders:           OrderLine[]         = [];
  @Input()  isLoading:        boolean             = false;
  @Input()  errorMessage:     string              = '';
  @Input()  unms:             string              = '';
  @Output() close = new EventEmitter<void>();

  readonly emptyMsg = {
    title: 'Aucune commande trouvée',
    info:  'Aucune commande liée à cet aktion.',
  };

  readonly orderColumns: SohoDataGridColumn[] = [
    { id: 'orderNumber',           name: 'N° commande',   field: 'orderNumber',           width: 160, sortable: true, align: 'center', filterType: 'text' },
    { id: 'lineNumber',            name: 'Ligne',               field: 'lineNumber',            width:  80, sortable: true, align: 'center', filterType: 'text' },
    { id: 'requestedDeliveryDate', name: 'Date demandée',  field: 'requestedDeliveryDate', width: 140, sortable: true, align: 'center', filterType: 'text' },
    { id: 'orderedQuantity',       name: 'Qté commandée', field: 'orderedQuantity',   width: 150, sortable: true, align: 'center',
      formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
    { id: 'deliveredQuantity',     name: 'Qté livrée',    field: 'deliveredQuantity', width: 140, sortable: true, align: 'center',
      formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
    { id: 'invoicedQuantity',      name: 'Qté facturée',  field: 'invoicedQuantity',  width: 140, sortable: true, align: 'center',
      formatter: (_r: number, _c: number, v: string) => this.fmtQty(v) },
    { id: 'orderStatus',           name: 'Statut',              field: 'orderStatus',           width: 200, sortable: true, align: 'center',
      formatter: (_r: number, _c: number, v: string) => this.fmtStatus(v) },
  ];

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders'] || changes['visible'] || changes['isLoading'] || changes['errorMessage']) {
      this.cdr.markForCheck();
    }
  }

  fmtQty(v: string): string {
    const n = parseFloat(v);
    if (isNaN(n)) return v ?? '';
    const val = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return this.unms
      ? `${val} <em style="font-size:11px;color:#94a3b8;font-style:normal">${this.unms}</em>`
      : val;
  }

  fmtStatus(v: string): string {
    const code = (v ?? '').trim();
    if (!code) return '';
    const cls = ORDER_STATUS_CLS[code] ?? 'os-default';
    return `<span class="os-badge ${cls}">${code}</span>`;
  }

  onClose(): void { this.close.emit(); }
}
