import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';

export interface WhgrOption {
  code: string;
}

@Injectable({ providedIn: 'root' })
export class WhgrService {

  private groupes$?: Observable<WhgrOption[]>;

  constructor(
    private readonly mi:   MIService,
    private readonly user: UserService,
  ) {}

  getGroupes(): Observable<WhgrOption[]> {
    if (!this.groupes$) {
      const req: IMIRequest = {
        program:            'CMS100MI',
        transaction:        'LstWhsGroups',
        record:             {},
        outputFields:       ['MNWHGR'],
        maxReturnedRecords: 100,
      };
      // Attend que le contexte utilisateur M3 soit prêt avant d'appeler l'API
      this.groupes$ = this.user.getUserContext().pipe(
        switchMap(() => this.mi.execute(req)),
        map((res: IMIResponse) =>
          [...new Set(
            (res.items ?? [])
              .map(item => (item['MNWHGR'] ?? '').trim())
              .filter(code => code !== '')
          )].map(code => ({ code }))
        ),
        catchError(() => of([{ code: 'GRP_ENTREPRISE' }])),
        shareReplay(1)
      );
    }
    return this.groupes$;
  }
}
