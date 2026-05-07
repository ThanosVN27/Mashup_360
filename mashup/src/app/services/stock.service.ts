import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { StockMouvement } from '../models/stock-mouvement.model';


@Injectable({ providedIn: 'root' })
export class StockService {

  constructor(private readonly miService: MIService) {}

  getArticleInfo(itno: string): Observable<{ itds: string; unms: string }> {
    const req: IMIRequest = {
      program:      'MMS200MI',
      transaction:  'Get',
      record:       { ITNO: itno },
      outputFields: ['ITDS', 'UNMS'],

    };
    return this.miService.execute(req).pipe(
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
    return this.miService.execute(req).pipe(
      map((res: IMIResponse) => res.item?.['N796'] ?? '0')
    );
  }

  getStocksAgreges(itno: string, whgr: string): Observable<{ stqt: number; aval: number; quqt: number; rjqt: number }> {
    const req: IMIRequest = {
      program:      'MMS200MI',
      transaction:  'GetAggWhsGrp',
      record:       { ITNO: itno, WHGR: whgr ,CONO: 100},
      outputFields: ['STQT', 'AVAL', 'QUQT', 'RJQT'],

    };
    return this.miService.execute(req).pipe(
      map((res: IMIResponse) => ({
        stqt: this.toNumber(res.item?.['STQT']),
        aval: this.toNumber(res.item?.['AVAL']),
        quqt: this.toNumber(res.item?.['QUQT']),
        rjqt: this.toNumber(res.item?.['RJQT']),
      })),
      catchError(() => of({ stqt: 0, aval: 0, quqt: 0, rjqt: 0 }))
    );
  }

  getMouvements(itno: string, whgr: string): Observable<StockMouvement[]> {
    const req: IMIRequest = {
      program:            'MMS080MI',
      transaction:        'SelMtrlTrans',
      record:             { ITNO: itno, WHLO: 'E01', WHGR: whgr,CONO: 100 },
      outputFields:       ['ORCA', 'RIDN', 'RIDL', 'TRQT', 'PLDT', 'CODT', 'RFTX', 'STAT', 'AGNO'],
      maxReturnedRecords: 999,

    };
    return this.miService.execute(req).pipe(
      map((res: IMIResponse) =>
        (res.items ?? []).map(item => ({
          orca: item['ORCA'] ?? '',
          ridn: item['RIDN'] ?? '',
          ridl: item['RIDL'] ?? '',
          trqt: this.toNumber(item['TRQT']),
          pldt: item['PLDT'] ?? '',
          codt: item['CODT'] ?? '',
          rftx: item['RFTX'] ?? '',
          stat: item['STAT'] ?? '',
          agno: item['AGNO'] ?? '',
        }))
      ),
      catchError(() => of([]))
    );
  }

  private toNumber(value: any): number {
    return parseFloat(value ?? '0') || 0;
  }


}
