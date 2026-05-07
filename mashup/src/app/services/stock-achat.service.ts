import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockMouvementService } from './stock-mouvement.service';
import { StockMouvement } from '../models/stock-mouvement.model';

@Injectable({ providedIn: 'root' })
export class StockAchatService {

  constructor(private readonly mouv: StockMouvementService) {}

  getAchats(itno: string, whgr: string): Observable<StockMouvement[]> {
    return this.mouv.getAll(itno, whgr).pipe(
      map(items => items.filter(m => m.orca === '251'))
    );
  }
}
