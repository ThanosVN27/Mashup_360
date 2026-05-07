import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WhgrService, WhgrOption } from '../../services/customer.service';

export interface RechercheEvent {
  itno: string;
  whgr: string;
}

@Component({
  selector:    'app-search',
  templateUrl: './search.component.html',
  styleUrls:   ['./search.component.css'],
})
export class SearchComponent implements OnInit {

  itno    = '';
  whgr    = '';
  groupes: WhgrOption[] = [];
  loadingGroupes = true;

  @Output() recherche = new EventEmitter<RechercheEvent>();

  constructor(private readonly whgrService: WhgrService) {}

  ngOnInit(): void {
    this.whgrService.getGroupes().subscribe({
      next: (groupes) => {
        this.groupes       = groupes;
        this.loadingGroupes = false;
        if (groupes.length > 0) {
          this.whgr = groupes[0].code;
        }
      },
      error: () => {
        this.groupes        = [{ code: 'GRP_ENTREPRISE' , depot: '100' }];
        this.whgr           = 'GRP_ENTREPRISE';
        this.loadingGroupes  = false;
      },
    });
  }

  lancer(): void {
    const itno = this.itno.trim();
    if (!itno || !this.whgr) return;
    this.recherche.emit({ itno, whgr: this.whgr });
  }
}
