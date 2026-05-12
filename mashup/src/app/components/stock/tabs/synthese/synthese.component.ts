import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { StockArticle } from '../../../../models/stock-article.model';
import { GroupService, WhgrOption } from '../../../../services/group.service';

@Component({
  selector:    'app-tab-synthese',
  templateUrl: './synthese.component.html',
  styleUrls:   ['./synthese.component.css'],
})
export class SyntheseComponent implements OnInit {

  @Input()  article!: StockArticle;
  @Input()  whgrSortant       = 'GRP_ENTREPRISE';
  @Output() tabChange         = new EventEmitter<string>();
  @Output() whgrSortantChange = new EventEmitter<string>();

  fluxEntrantOpen  = true;
  fluxSortantOpen  = true;
  whgrOptions: WhgrOption[] = [];
  whgrDropdownOpen = false;

  constructor(private readonly groupService: GroupService) {}

  ngOnInit(): void {
    this.groupService.getGroupes().subscribe(opts => {
      const hasDefault = opts.some(o => o.code === 'GRP_ENTREPRISE');
      this.whgrOptions = hasDefault ? opts : [{ code: 'GRP_ENTREPRISE' }, ...opts];
    });
  }

  selectWhgr(code: string): void {
    this.whgrSortant      = code;
    this.whgrDropdownOpen = false;
    this.whgrSortantChange.emit(code);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.whgrDropdownOpen = false;
  }

  get totalEntrant(): number {
    return this.article.totalPof + this.article.totalOf + this.article.totalAchats;
  }

  get totalSortant(): number {
    return this.article.totalActions + this.article.totalReservations;
  }

  get resaVerifiee(): boolean {
    return this.article.totalReservations === this.article.resaVente;
  }

  fmt(v: number): string {
    return Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
