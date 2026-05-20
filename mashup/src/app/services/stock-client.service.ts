import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { StockMouvementService } from './stock-mouvement.service';
import { StockMouvement } from '../models/stock-mouvement.model';
import { ContractLine,OrderLine } from '../models/stock-aktions.model';
import { formatM3Date } from '../shared/utils/m3-date.util';

@Injectable({ providedIn: 'root' })
export class StockClientService {

  constructor(
    private readonly mouv: StockMouvementService,
    private readonly mi:   MIService,
  ) {}

  getReservations(itno: string, whgr: string): Observable<StockMouvement[]> {
    return this.mouv.getAll(itno, whgr).pipe(
      map(items => items.filter(m => m.orca === '311')),
      switchMap(lines => {
        if (lines.length === 0) return of([]);
        return forkJoin(
          lines.map(line =>
            this.fetchAgno(line.ridn, line.ridl).pipe(
              map(agno => ({ ...line, agno })),
            )
          )
        );
      }),
      map(lines => [...lines].sort((a, b) => a.pldt.localeCompare(b.pldt))),
    );
  }

  getContractsByArticle(itno: string): Observable<ContractLine[]> {
    const normalized = itno.trim().toUpperCase();
    if (!normalized) return of([]);

    const req: IMIRequest = {
      program:     'CMS100MI',
      transaction: 'LstBulkLineArt',
      record: {
        UWOBV1: normalized,
        F_AGST: '10',
        T_AGST: '20',
      },
      outputFields:       ['UWCUNO', 'UWAGNO', 'UYTX40', 'UYAGST', 'UWOBV1', 'UWAGST', 'UWSTDT', 'UWLVDT', 'UWAGQT', 'UXREQT','UXDLQT',"V_RQCO"],
      maxReturnedRecords: 500,
    };

    return this.mi.execute(req).pipe(
      map(res => {
        const items = (res.items ?? []) as Array<Record<string, string | undefined>>;
        return items.map((item, i) => this.mapContractLine(item, i));
      }),
      catchError(() => of([]))
    );
  }

  private mapContractLine(item: Record<string, string | undefined>, index: number): ContractLine {
    const customerCode    = item['UWCUNO'] ?? '';
    const openOrderNumber = item['UWAGNO'] ?? '';
    const startDate       = item['UWSTDT'] ?? '';
    return {
      id:               `${customerCode}-${openOrderNumber}-${startDate}-${index}`,
      command:          'commande',
      circuitCode:      '',
      customerCode,
      openOrderNumber,
      description:      item['UYTX40'] ?? '',
      status:           item['UYAGST'] ?? '',
      lineStatus:       item['UWAGST'] ?? '',
      startValue1:      item['UWOBV1'] ?? '',
      startDate:        formatM3Date(startDate),
      endValidityDate:  formatM3Date(item['UWLVDT'] ?? ''),
      contractQuantity: item['UWAGQT'] ?? '',
      reservedQuantity: item['UXREQT'] ?? '',
      deliveredQuantity:item['UXDLQT'] ?? '',
      resteACommander:  item['V_RQCO'] ?? '',
    };
  }

  private fetchAgno(orno: string, ponr: string): Observable<string> {
    const req: IMIRequest = {
      program:      'OIS100MI',
      transaction:  'GetLine',
      record:       { CONO: 100, ORNO: orno, PONR: ponr },
      outputFields: ['AGNO'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => (res.item?.['AGNO'] ?? '').trim() || '---'),
      catchError(() => of('---'))
    );
  }

  //EXPORTMI / SelectPad — lignes de commandes liées à un contrat
  getOrderLines(openOrderNumber: string, startValue1: string): Observable<OrderLine[]> {
    if (!openOrderNumber || !startValue1) return of([]);

    const request: IMIRequest = {
      program: 'EXPORTMI',
      transaction: 'SelectPad',
      record: {
        SEPC: ';',
        HDRS: '0',
        QERY: this.buildSelectPadQuery(openOrderNumber, startValue1),
      },
    };

    return this.mi.execute(request).pipe(
      map(response => {
        if (response.errorMessage) return [];
        return this.parseOrderLines(response);
      }),
      catchError(() => of([]))
    );
  }


  private buildSelectPadQuery(agnb: string, itno: string): string {
    const safeAgnb = agnb.replace(/'/g, "''");
    const safeItno = itno.replace(/'/g, "''");
    return (
      `OBORNO,OBPONR,OBORQT,OBDWDZ,OBDLQT,OBIVQT,OBORST ` +
      `from OOLINE ` +
      `where OBCONO = 100 ` +
      `and OBAGNO = '${safeAgnb}' ` +
      `and OBITNO = '${safeItno}'`
    );
  }

  private parseOrderLines(response: IMIResponse): OrderLine[] {
    const items = (response.items ?? []) as Array<Record<string, string | undefined>>;

    // Cas 1 : réponse structurée avec champs nommés
    if (items.length && items.some(i => 'OBORNO' in i || 'OBPONR' in i)) {
      return this.deduplicateOrders(items.map(i => this.mapOrderRecord(i)));
    }

    // Cas 2 : réponse texte délimitée par ';'
    const rawLines = [
      ...items.flatMap(i => this.extractDelimitedLines(i)),
      ...this.extractDelimitedLines((response.item ?? {}) as Record<string, string | undefined>),
    ];

    return this.deduplicateOrders(
      rawLines
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => this.mapOrderLine(l))
    );
  }

  private mapOrderRecord(record: Record<string, string | undefined>): OrderLine {
    return {
      orderNumber:           record['OBORNO'] ?? '',
      lineNumber:            record['OBPONR'] ?? '',
      orderedQuantity:       this.roundQty(record['OBORQT'] ?? ''),
      requestedDeliveryDate: this.formatDate(record['OBDWDZ'] ?? ''),
      deliveredQuantity:     this.roundQty(record['OBDLQT'] ?? ''),
      invoicedQuantity:      this.roundQty(record['OBIVQT'] ?? ''),
      orderStatus:           record['OBORST'] ?? '',
    };
  }

  // SELECT order: OBORNO,OBPONR,OBORQT,OBDWDZ,OBDLQT,OBIVQT,OBORST
  private mapOrderLine(line: string): OrderLine {
    const parts = line.split(';');
    return {
      orderNumber:           parts[0]?.trim() ?? '',
      lineNumber:            parts[1]?.trim() ?? '',
      orderedQuantity:       this.roundQty(parts[2]?.trim() ?? ''),
      requestedDeliveryDate: this.formatDate(parts[3]?.trim() ?? ''),
      deliveredQuantity:     this.roundQty(parts[4]?.trim() ?? ''),
      invoicedQuantity:      this.roundQty(parts[5]?.trim() ?? ''),
      orderStatus:           parts[6]?.trim() ?? '',
    };
  }

  private roundQty(v: string): string {
    const n = parseFloat(v);
    return isNaN(n) ? (v ?? '') : Math.round(n).toString();
  }

  private extractDelimitedLines(item: Record<string, string | undefined>): string[] {
    return Object.values(item)
      .filter((v): v is string => typeof v === 'string' && v.includes(';'))
      .flatMap(v => v.split('\n').filter(Boolean));
  }

  private deduplicateOrders(orders: OrderLine[]): OrderLine[] {
    const seen = new Set<string>();
    return orders.filter(o => {
      const key = `${o.orderNumber}-${o.lineNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private formatDate(raw: string): string {
    if (!raw || raw.length !== 8) return raw;
    return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`;
  }
}
