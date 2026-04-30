import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  readonly todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day:     '2-digit',
    month:   'long',
    year:    'numeric',
  });
}
