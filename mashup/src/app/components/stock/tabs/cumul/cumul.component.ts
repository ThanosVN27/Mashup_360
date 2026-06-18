import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SohoDatePickerComponent } from 'ids-enterprise-ng';

import { CumulLigne } from '../../../../models/stock-aktions.model';

@Component({
  selector:    'app-tab-cumul',
  templateUrl: './cumul.component.html',
  styleUrls:   ['./cumul.component.css'],
})
export class CumulComponent implements OnChanges {

  /** Donnée déjà chargée par le composant parent (forkJoin) — aucun appel M3 ici. */
  @Input() cumul: CumulLigne[] = [];
  @Input() unms = '';

  @ViewChild(SohoDatePickerComponent) private datePicker?: SohoDatePickerComponent;

  lignes:   CumulLigne[]          = [];   // vue filtrée affichée
  colonnes: SohoDataGridColumn[]  = [];
  allLignes: CumulLigne[]         = [];   // jeu complet reçu en entrée

  /** Seuil de filtrage au format "YYYYMM" — vide = aucun filtre. */
  seuilMois = '';

  get nbMois():   number { return this.lignes.length; }
  get totalQte(): number { return this.lignes.reduce((s, l) => s + l.oborqt, 0); }
  /** Total formaté comme les cellules de la grille (séparateur espace, sans virgule). */
  get totalQteLabel(): string { return this.totalQte.toLocaleString('fr-FR'); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unms']) {
      this.buildColonnes();
    }
    if (changes['cumul']) {
      this.allLignes = this.cumul ?? [];
      this.seuilMois = '';
      this.datePicker?.setValue('', false, false);
      this.appliquerFiltre();
    }
  }

  /** Lit la date choisie dans le datepicker SoHo et recalcule la vue. */
  onDateChange(): void {
    const date = this.datePicker?.getValue(true);
    if (date instanceof Date && !isNaN(date.getTime())) {
      const mm = `${date.getMonth() + 1}`.padStart(2, '0');
      this.seuilMois = `${date.getFullYear()}${mm}`;   // "YYYYMM"
    } else {
      this.seuilMois = '';
    }
    this.appliquerFiltre();
  }

  /** Réinitialise le filtre de date. */
  reinitialiserFiltre(): void {
    this.seuilMois = '';
    this.datePicker?.setValue('', false, false);
    this.appliquerFiltre();
  }

  /** Recalcule la vue à partir du seuil de mois (YYYYMM). */
  private appliquerFiltre(): void {
    this.lignes = this.seuilMois
      ? this.allLignes.filter(l => l.moisKey >= this.seuilMois)
      : [...this.allLignes];
  }

  private buildColonnes(): void {
    const unms = this.unms || 'U/M bs';
    this.colonnes = [
      { id: 'moisLabel', name: 'Mois', field: 'moisLabel',
        sortable: true, align: 'center', filterType: 'text' },
      { id: 'oborqt', name: 'Qté cdée', field: 'oborqt',
        sortable: true, align: 'center', filterType: 'integer',
        formatter: (_r: number, _c: number, v: number) =>
          `<strong>${(v ?? 0).toLocaleString('fr-FR')}</strong><span style="margin-left:6px;font-size:13px;color:#94a3b8">${unms}</span>` },
      { id: 'oborst', name: 'Statut', field: 'oborst',
        sortable: true, align: 'center', filterType: 'text',
        formatter: (_r: number, _c: number, v: string) =>
          `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;color:#065f46;background:#ecfdf5;border:1px solid #6ee7b7">${v} – Facturé</span>` },
    ];
  }
}
