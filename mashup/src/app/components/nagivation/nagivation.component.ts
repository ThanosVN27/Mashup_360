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
    this.rechercheActuelle = { ...event };
  }
}
