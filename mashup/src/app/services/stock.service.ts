import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
      map((res: IMIResponse) => res.item?.['N796'] ?? '0'),
      catchError(() => of('0')),
      switchMap(n796 => {
        if (parseFloat(n796) !== 0) return of(n796);
        const req2: IMIRequest = {
          program:      'MMS200MI',
          transaction:  'Get',
          record:       { ITNO: itno },
          outputFields: ['NEWE'],
        };
        return this.mi.execute(req2).pipe(
          map((res: IMIResponse) => res.item?.['NEWE'] ?? '0'),
          catchError(() => of('0'))
        );
      })
    );
  }

  getStocksAgreges(itno: string, whgr: string): Observable<{ aval: number; alqt: number; quqt: number; rjqt: number }> {
    const req: IMIRequest = {
      program:      'MMS200MI',
      transaction:  'GetAggWhsGrp',
      record:       { ITNO: itno, WHGR: whgr, CONO: 100 },
      outputFields: ['AVAL', 'ALQT', 'QUQT', 'RJQT'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => ({
        aval: this.toNum(res.item?.['AVAL']),
        alqt: this.toNum(res.item?.['ALQT']),
        quqt: this.toNum(res.item?.['QUQT']),
        rjqt: this.toNum(res.item?.['RJQT']),
      })),
      catchError(() => of({ aval: 0, alqt: 0, quqt: 0, rjqt: 0 }))
    );
  }

  private toNum(value: unknown): number {
    return parseInt(String(value ?? '0')) || 0;
  }

  getConversionFactor(itno: string): Observable<{ cofa: string; alun: string }> {
    const req: IMIRequest = {
      program:      'MMS015MI',
      transaction:  'Get',
      record:       { ITNO: itno, AUTP: 1, ALUN: 'UVC' },
      outputFields: ['COFA', 'ALUN'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => {
        const raw = res.item?.['COFA'];
        const n   = raw ? parseFloat(String(raw)) : NaN;
        return {
          cofa: isNaN(n) || n === 0 ? '' : n.toString(),
          alun: res.item?.['ALUN'] ?? '',
        };
      }),
      catchError(() => of({ cofa: '', alun: '' }))
    );
  }

}
