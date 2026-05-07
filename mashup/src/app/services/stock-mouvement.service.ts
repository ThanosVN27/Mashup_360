import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { StockMouvement } from '../models/stock-mouvement.model';

@Injectable({ providedIn: 'root' })
export class StockMouvementService {

  private cache = new Map<string, Observable<StockMouvement[]>>();

  constructor(private readonly mi: MIService) {}

  getAll(itno: string, whgr: string): Observable<StockMouvement[]> {
    const key = `${itno}-${whgr}`;
    if (!this.cache.has(key)) {
      const req: IMIRequest = {
        program:            'MMS080MI',
        transaction:        'SelMtrlTrans',
        record:             { ITNO: itno, WHLO: 'E01', WHGR: whgr, CONO: 100 },
        outputFields:       ['ORCA', 'RIDN', 'RIDL', 'TRQT', 'PLDT', 'CODT', 'RFTX', 'STAT', 'AGNO'],
        maxReturnedRecords: 999,
      };
      const obs = this.mi.execute(req).pipe(
        map((res: IMIResponse) =>
          (res.items ?? []).map(item => ({
            orca: item['ORCA'] ?? '',
            ridn: item['RIDN'] ?? '',
            ridl: item['RIDL'] ?? '',
            trqt: parseFloat(item['TRQT'] ?? '0') || 0,
            pldt: item['PLDT'] ?? '',
            codt: item['CODT'] ?? '',
            rftx: item['RFTX'] ?? '',
            stat: item['STAT'] ?? '',
            agno: item['AGNO'] ?? '',
          }))
        ),
        catchError(() => of([])),
        shareReplay(1)
      );
      this.cache.set(key, obs);
    }
    return this.cache.get(key)!;
  }
}
