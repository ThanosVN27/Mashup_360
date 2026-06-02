import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GroupService, WhgrOption } from '../../services/group.service';

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

  itno           = '';
  whgr           = '';
  groupes:       WhgrOption[] = [];
  loadingGroupes = true;

  @Output() recherche = new EventEmitter<RechercheEvent>();

  constructor(private readonly whgrService: GroupService) {}

  ngOnInit(): void {
    this.whgrService.getGroupes().subscribe({
      next: (groupes) => {
        this.groupes        = groupes;
        const preferred     = groupes.find(g => g.code.toUpperCase() === 'GRP_ENTREPRISE');
        this.whgr           = preferred?.code ?? groupes[0]?.code ?? '';
        this.loadingGroupes = false;
      },
      error: () => {
        this.groupes        = [];
        this.whgr           = '';
        this.loadingGroupes = false;
      },
    });
  }

  lancer(): void {
    const itno = this.itno.trim().toUpperCase();
    if (itno && this.whgr) {
      this.recherche.emit({ itno, whgr: this.whgr });
    }
  }
}
