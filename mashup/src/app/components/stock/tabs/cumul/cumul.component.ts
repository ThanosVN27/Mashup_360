import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SohoDatePickerComponent } from 'ids-enterprise-ng';

import { CumulLigne } from '../../../../models/stock-aktions.model';

type PivotRow = Record<string, string | number>;

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

  colonnes:  SohoDataGridColumn[] = [];
  pivotRows: PivotRow[]           = [];   // 12 mois + ligne Total
  annees:    string[]             = [];   // années présentes (colonnes)
  allLignes: CumulLigne[]         = [];   // jeu complet reçu en entrée

  /** Seuil de filtrage au format "YYYYMM" — vide = aucun filtre. */
  seuilMois = '';

  get nbLignesData(): number { return this.allLignes.length; }

  private readonly MOIS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cumul']) {
      this.allLignes = this.cumul ?? [];
      this.seuilMois = '';
      this.datePicker?.setValue('', false, false);
    }
    this.construirePivot();
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
    this.construirePivot();
  }

  /** Réinitialise le filtre de date. */
  reinitialiserFiltre(): void {
    this.seuilMois = '';
    this.datePicker?.setValue('', false, false);
    this.construirePivot();
  }

  /** Construit le tableau croisé : mois en lignes, années en colonnes, + ligne Total. */
  private construirePivot(): void {
    const lignes = this.seuilMois
      ? this.allLignes.filter(l => l.moisKey >= this.seuilMois)
      : this.allLignes;

    this.annees = [...new Set(lignes.map(l => l.moisKey.slice(0, 4)))].sort();

    // Quantité par (mois 1-12, année)
    const parCase = new Map<string, number>();
    for (const l of lignes) {
      const annee = l.moisKey.slice(0, 4);
      const mois  = parseInt(l.moisKey.slice(4, 6), 10);
      const key   = `${mois}-${annee}`;
      parCase.set(key, (parCase.get(key) ?? 0) + l.oborqt);
    }

    const totaux: Record<string, number> = {};
    const rows: PivotRow[] = [];

    for (let m = 1; m <= 12; m++) {
      const row: PivotRow = { mois: this.MOIS[m - 1] };
      for (const a of this.annees) {
        const v = parCase.get(`${m}-${a}`) ?? 0;
        row[a]    = v;
        totaux[a] = (totaux[a] ?? 0) + v;
      }
      rows.push(row);
    }

    // Ligne Total (drapeau _total pour la mise en forme)
    const totalRow: PivotRow = { mois: 'Total', _total: 1 };
    for (const a of this.annees) totalRow[a] = totaux[a] ?? 0;
    rows.push(totalRow);

    this.pivotRows = rows;
    this.buildColonnes();
  }

  private buildColonnes(): void {
    const unite = this.unms || 'U/M bs';

    const cols: SohoDataGridColumn[] = [
      {
        id: 'mois', name: 'Mois', field: 'mois',
        sortable: false, align: 'left',
        formatter: (_r: number, _c: number, v: any, _col: any, item: any) =>
          item?.['_total'] ? `<strong>${v}</strong>` : v,
      },
    ];

    for (const annee of this.annees) {
      cols.push({
        id: annee, name: annee, field: annee,
        sortable: false, align: 'right',
        formatter: (_r: number, _c: number, v: any, _col: any, item: any) =>
          this.fmtCellule(Number(v) || 0, unite, !!item?.['_total']),
      });
    }

    this.colonnes = cols;
  }

  /** Rendu d'une cellule chiffrée : quantité + unité, négatif en rouge, total en gras. */
  private fmtCellule(n: number, unite: string, total: boolean): string {
    if (!n && !total) return '<span style="color:#cbd5e1">—</span>';

    const couleur = n < 0 ? '#dc2626' : (total ? '#0f172a' : '#1e293b');
    const poids   = total ? '700' : '400';
    const valeur  = n.toLocaleString('fr-FR');

    return `<span style="color:${couleur};font-weight:${poids};font-variant-numeric:tabular-nums">${valeur}</span>`
         + `<span style="margin-left:5px;font-size:12px;color:#94a3b8">${unite}</span>`;
  }
}
