import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ContractLine, OrderLine } from '../../../../../models/stock-aktions.model';

function fmtQty(_r: number, _c: number, v: string): string {
  const n = parseFloat(v);
  if (isNaN(n)) return v ?? '';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n));
}



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
  @Output() close = new EventEmitter<void>();

  readonly orderColumns: SohoDataGridColumn[] = [
    { id: 'orderNumber',           name: 'N° commande',   field: 'orderNumber',           width: 160, sortable: true, align: 'center', filterType: 'text' },
    { id: 'lineNumber',            name: 'Ligne',         field: 'lineNumber',            width:  80, sortable: true, align: 'center', filterType: 'text' },
    { id: 'requestedDeliveryDate', name: 'Date demandée', field: 'requestedDeliveryDate', width: 140, sortable: true, align: 'center', filterType: 'text' },
    { id: 'orderedQuantity',       name: 'Qté commandée', field: 'orderedQuantity',       width: 140, sortable: true, align: 'center', formatter: fmtQty },
    { id: 'deliveredQuantity',     name: 'Qté livrée',    field: 'deliveredQuantity',     width: 130, sortable: true, align: 'center', formatter: fmtQty },
    { id: 'invoicedQuantity',      name: 'Qté facturée',  field: 'invoicedQuantity',      width: 130, sortable: true, align: 'center', formatter: fmtQty },
    { id: 'orderStatus',           name: 'Statut',        field: 'orderStatus',           width: 200, sortable: true, align: 'center'},
  ];

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders'] || changes['visible'] || changes['isLoading'] || changes['errorMessage']) {
      this.cdr.markForCheck();
    }
  }

  onClose(): void { this.close.emit(); }
}
