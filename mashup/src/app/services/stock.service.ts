import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';

@Injectable({ providedIn: 'root' })
export class StockService {

  constructor(private readonly mi: MIService) {}

  getArticleInfo(itno: string): Observable<{ itds: string; unms: string }> {
    const req: IMIRequest = {
      program:      'MMS200MI',
      transaction:  'Get',
      record:       { ITNO: itno },
      outputFields: ['ITDS', 'UNMS'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => ({
        itds: res.item?.['ITDS'] ?? '',
        unms: res.item?.['UNMS'] ?? '',
      }))
    );
  }

  getPoidsNet(itno: string): Observable<string> {
    const req: IMIRequest = {
      program:      'CUSEXTMI',
      transaction:  'GetFieldValue',
      record:       { FILE: 'MITMAS', PK01: itno },
      outputFields: ['N796'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => res.item?.['N796'] ?? '0')
    );
  }

  getStocksAgreges(itno: string, whgr: string): Observable<{ stqt: number; aval: number; quqt: number; rjqt: number }> {
    const req: IMIRequest = {
      program:      'MMS200MI',
      transaction:  'GetAggWhsGrp',
      record:       { ITNO: itno, WHGR: whgr, CONO: 100 },
      outputFields: ['STQT', 'AVAL', 'QUQT', 'RJQT'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => ({
        stqt: this.toNum(res.item?.['STQT']),
        aval: this.toNum(res.item?.['AVAL']),
        quqt: this.toNum(res.item?.['QUQT']),
        rjqt: this.toNum(res.item?.['RJQT']),
      })),
      catchError(() => of({ stqt: 0, aval: 0, quqt: 0, rjqt: 0 }))
    );
  }

  private toNum(value: unknown): number {
    return parseFloat(String(value ?? '0')) || 0;
  }
}
