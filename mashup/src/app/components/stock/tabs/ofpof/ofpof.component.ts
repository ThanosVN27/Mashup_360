import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StockMouvement } from '../../../../models/stock-mouvement.model';
import { formatM3Date, formatM3Qty } from '../../../../shared/utils/m3-date.util';
import { formatM3Status } from '../../../../shared/utils/m3-status.util';

@Component({
  selector:    'app-tab-ofpof',
  templateUrl: './ofpof.component.html',
  styleUrls:   ['./ofpof.component.css'],
})
export class OfPofComponent implements OnChanges {

  @Input() isLoading    = false;
  @Input() errorMessage = '';
  @Input() unms = '';
  @Input() set lignes(data: StockMouvement[]) {
    this.toutesLignes   = data;
    this.lignesFiltrees = this.filtrer(data);
  }

  toutesLignes:   StockMouvement[] = [];
  lignesFiltrees: StockMouvement[] = [];
  filtre: 'tous' | 'of' | 'pof'   = 'tous';
  colonnes: SohoDataGridColumn[]   = [];

  get countOf():  number { return this.toutesLignes.filter(l => l.orca === '101').length; }
  get countPof(): number { return this.toutesLignes.filter(l => l.orca === '100').length; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unms']) {
      this.colonnes = [
        { id: 'type', name: 'Type', field: 'orca', width: 150, align: 'center', filterType: 'text',
          formatter: (_row: number, _cell: number, value: string) => {
            const label    = value === '100' ? 'POF' : 'OF';
            const cssClass = value === '100' ? 'badge-pof' : 'badge-of';
            return `<span class="${cssClass}">${label}</span>`;
          },
        },
        { id: 'ridn', name: 'Numéro',              field: 'ridn', width: 200, sortable: true, align: 'center', filterType: 'text' },
        { id: 'trqt', name: 'Quantité à produire', field: 'trqt', width: 200, sortable: true, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: number) => formatM3Qty(v, this.unms) },
        { id: 'pldt', name: 'Date',   field: 'pldt', width: 200, sortable: true, align: 'center', filterType: 'text',
          formatter: (_row: number, _cell: number, value: string) => formatM3Date(value) },
        { id: 'stat', name: 'Statut', field: 'stat', width: 250, align: 'center', filterType: 'text',
          formatter: (_r: number, _c: number, v: string) => formatM3Status(v) },
      ];
    }
  }

  setFiltre(f: 'tous' | 'of' | 'pof'): void {
    this.filtre         = f;
    this.lignesFiltrees = this.filtrer(this.toutesLignes);
  }

  private filtrer(data: StockMouvement[]): StockMouvement[] {
    if (this.filtre === 'of')  return data.filter(l => l.orca === '101');
    if (this.filtre === 'pof') return data.filter(l => l.orca === '100');
    return [...data];
  }
}
