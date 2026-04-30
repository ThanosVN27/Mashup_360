import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector:    'app-search',
  templateUrl: './search.component.html',
  styleUrls:   ['./search.component.css'],
})
export class SearchComponent {

  itno = '';
  @Output() recherche = new EventEmitter<string>();
  lancer(): void {
    const code = this.itno.trim();
    if (!code) { return; }
    this.recherche.emit(code);
  }
}
