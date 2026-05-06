import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockMouvementService } from './stock-mouvement.service';
import { StockMouvement } from '../models/stock-mouvement.model';

@Injectable({ providedIn: 'root' })
export class StockProductionService {

  constructor(private readonly mouv: StockMouvementService) {}

  // OF lancés (101) + POF confirmées (100, statut != 10).
  getProduction(itno: string): Observable<StockMouvement[]> {
    return this.mouv.getAll(itno).pipe(
      map(items => items.filter(m =>
        (m.orca === '100' && m.stat !== '10') || m.orca === '101'
      ))
    );
  }
}
