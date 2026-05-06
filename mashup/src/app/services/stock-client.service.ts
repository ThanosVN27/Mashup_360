import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockMouvementService } from './stock-mouvement.service';
import { StockMouvement } from '../models/stock-mouvement.model';

@Injectable({ providedIn: 'root' })
export class StockClientService {

  constructor(private readonly mouv: StockMouvementService) {}

  // Réservations client (ORCA 311).
  getReservations(itno: string): Observable<StockMouvement[]> {
    return this.mouv.getAll(itno).pipe(
      map(items => items.filter(m => m.orca === '311'))
    );
  }

  // Actions client (ORCA 030).
  getActions(itno: string): Observable<StockMouvement[]> {
    return this.mouv.getAll(itno).pipe(
      map(items => items.filter(m => m.orca === '030'))
    );
  }
}
