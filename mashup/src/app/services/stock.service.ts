import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';


@Injectable({ providedIn: 'root' })
export class StockService {

  constructor(private readonly mi: MIService) {}


  // Désignation et unité via MMS200MI/Get
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
      })),
      catchError(() => of({ itds: '', unms: '' }))
    );
  }

  // Marque (V_CFI1) et site de production (V_SPRO) via CMS100MI/LstItemInfos (plage F_ITNO / T_ITNO)
  getItemInfos(itno: string): Observable<{ cfi1: string; siteProd: string }> {
    const code = itno.trim().toUpperCase();
    const req: IMIRequest = {
      program:            'CMS100MI',
      transaction:        'LstItemInfos',
      record:             { F_ITNO: code, T_ITNO: code },
      outputFields:       ['V_CFI1', 'V_SPRO'],
      maxReturnedRecords: 1,
    };

    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => {
        const item = ((res.items ?? []) as Array<Record<string, string | undefined>>)[0]
                     ?? (res.item as Record<string, string | undefined> | undefined)
                     ?? {};
        return {
          cfi1:     (item['V_CFI1'] ?? '').replace(/\s*\(\*\)\s*/g, ' ').trim(),
          siteProd: (item['V_SPRO'] ?? '').trim(),
        };
      }),
      catchError(() => of({ cfi1: '', siteProd: '' }))
    );
  }

  // Poids net : d'abord le champ personnalisé N496, sinon NEWE sur MMS200MI
  getPoidsNet(itno: string): Observable<string> {
    const req: IMIRequest = {
      program:      'CUSEXTMI',
      transaction:  'GetFieldValue',
      record:       { FILE: 'MITMAS', PK01: itno },
      outputFields: ['N496'],
    };

    return this.mi.execute(req).pipe(
      map((res: IMIResponse) => res.item?.['N496'] ?? '0'),
      catchError(() => of('0')),
      switchMap(n496 => {
        if (parseFloat(n496) !== 0) return of(n496);

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

  // Conditionnement UVC : COFA formaté sans zéros en trop, ALUN comme libellé d'unité
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

  getStocksAgreges(
    itno: string,
    whgr: string,
  ): Observable<{ aval: number; alqt: number; quqt: number; rjqt: number }> {
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
}
