import { Component } from '@angular/core';


@Component({
  selector:    'app-nagivation',
  templateUrl: './nagivation.component.html',
  styleUrl:    './nagivation.component.css',
})
export class NagivationComponent {

  // Code article transmis par SearchComponent, passé à StockComponent
  itnoActuel = '';

  onRecherche(itno: string): void {
    this.itnoActuel = itno;
  }
}
