import { Component } from '@angular/core';
import { RechercheEvent } from '../search/search.component';

@Component({
  selector:    'app-nagivation',
  templateUrl: './nagivation.component.html',
  styleUrl:    './nagivation.component.css',
})
export class NagivationComponent {

  rechercheActuelle: RechercheEvent | null = null;

  onRecherche(event: RechercheEvent): void {
    // Nouvel objet → le setter @Input de StockComponent se déclenche même si les valeurs n'ont pas changé
    this.rechercheActuelle = { ...event };
  }
}
