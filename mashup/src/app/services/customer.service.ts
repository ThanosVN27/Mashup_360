import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';

export interface WhgrOption {
  code:  string;
  depot: string;
}

@Injectable({ providedIn: 'root' })
export class WhgrService {

  private groupes$?: Observable<WhgrOption[]>;

  constructor(private readonly mi: MIService) {}

  getGroupes(): Observable<WhgrOption[]> {
    if (!this.groupes$) {
      const req: IMIRequest = {
        program:            'CMS100MI',
        transaction:        'LstWhsGroups',
        record:             {},
        outputFields:       ['MNWHGR', 'MNWHLO'],
        maxReturnedRecords: 100,
      };
      this.groupes$ = this.mi.execute(req).pipe(
        map((res: IMIResponse) =>
          [...new Set(
            (res.items ?? [])
              .map(item => (item['MNWHGR'] ?? '').trim())
              .filter(code => code !== '')
          )].map(code => ({ code, depot: '' }))
        ),
        catchError(() => of([{ code: 'GRP_ENTREPRISE', depot: '' }])),
        shareReplay(1)
      );
    }
    return this.groupes$;
  }
}
