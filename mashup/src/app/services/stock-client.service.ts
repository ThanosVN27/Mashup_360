import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { StockMouvementService } from './stock-mouvement.service';
import { StockMouvement } from '../models/stock-mouvement.model';

@Injectable({ providedIn: 'root' })
export class StockClientService {

  constructor(
    private readonly mouv: StockMouvementService,
    private readonly mi: MIService,
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

  getActions(itno: string, whgr: string): Observable<StockMouvement[]> {
    return this.mouv.getAll(itno, whgr).pipe(
      map(items => items.filter(m => m.orca === '030'))
    );
  }

  private fetchAgno(orno: string, ponr: string): Observable<string> {
    const req: IMIRequest = {
      program:      'OIS100MI',
      transaction:  'GetLine',
      record:       { CONO: 100, ORNO: orno, PONR: ponr},
      outputFields: ['AGNO'],
    };
    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => (res.item?.['AGNO'] ?? '').trim() || '---'),
      catchError(() => of('---'))
    );
  }
}
