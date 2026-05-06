# Documentation Projet – Vue Stock 360

## 1. Présentation générale

La **Vue Stock 360** est un mashup Angular connecté à Infor M3 permettant d’obtenir une vision complète et consolidée des stocks actuels et futurs d’un article.

L’application agrège plusieurs flux M3 (stock, production, achats, engagements clients) afin de fournir une **photographie fiable et exploitable** pour les équipes logistique, supply chain et ADV.

---

## 2. Objectifs fonctionnels

Pour un **code article (ITNO)**, l’application permet :

- Identifier rapidement l’article (désignation, unité, poids)
- Visualiser les stocks par statut
- Connaître les volumes à venir (OF / POF, achats)
- Identifier les engagements clients (réservations, actions)
- Comparer les données calculées entre elles (cohérence métier)

Toutes les informations clés sont centralisées dans un **onglet Synthèse**.

---

## 3. Stack technique

- Angular 18
- TypeScript
- IDS Enterprise NG pour les composants Soho
- M3 Odin pour les appels MI vers M3
- RxJS pour la gestion des flux asynchrones

---

## 4. Architecture globale

```ts
src/app/
 ├─ components/
 │  ├─ stock-search
 │  ├─ stock-synthese
 │  ├─ stock-reservations
 │  ├─ stock-actions
 │  ├─ stock-production
 │  └─ stock-achats
 ├─ services/
 │  ├─ stock-article.service.ts
 │  ├─ stock-stock.service.ts
 │  ├─ stock-production.service.ts
 │  ├─ stock-achat.service.ts
 │  └─ stock-client.service.ts
 ├─ models/
 │  ├─ article.model.ts
 │  ├─ stock.model.ts
 │  ├─ production.model.ts
 │  ├─ achat.model.ts
 │  └─ synthese-row.model.ts
 └─ utils/
    └─ m3-mapping.utils.ts
```

---

## 5. Principe de fonctionnement

1. L’utilisateur renseigne un **code article**
2. Le composant déclenche les chargements
3. Chaque service appelle son API M3 dédiée
4. Les réponses MI sont mappées vers des modèles métiers
5. Les calculs sont réalisés côté service
6. Le composant affiche les données sans logique métier

---

## 6. APIs M3 utilisées

### 6.1 Informations article

**MMS200MI – Get**

- Rôle : informations générales de l’article
- Champs : ITDS, UNMS
- Source unique pour l’unité de gestion

**CUSEXTMI – GetFieldValue**

- Table : MITMAS
- Champ : N796 (poids net)

---

### 6.2 Stocks

**MMS200MI – GetAggWhsGrp**

- WHGR : ESCAL_GD

Champs utilisés :

- STQT : stock disponible
- AVAL : stock affectable
- QUQT : stock sous contrôle
- RJQT : stock non conforme

Calcul métier :

- `RESA_VENTE = STQT – AVAL`

---

### 6.3 Production

**MMS080MI – SelMtrlTrans**

Paramètres communs : ITNO, WHLO = E01, WHGR = ESCAL_GD

- ORCA 100 : propositions d’OF (POF)
- ORCA 101 : ordres de fabrication (OF)
- Exclusion STAT = 10 pour les POF

Agrégation : somme des TRQT par catégorie.

---

### 6.4 Achats

**MMS080MI – SelMtrlTrans**

- ORCA 251 : ordres d’achats
- Agrégation des quantités TRQT

---

### 6.5 Engagements clients

**MMS080MI – SelMtrlTrans**

- ORCA 311 : réservations clients
- ORCA 030 : actions clients

Contrôle métier :

- Somme ORCA 311 = RESA_VENTE

---

## 7. Modèles de données

### ArticleModel

- itno
- itds
- unms
- netWeight

### StockModel

- stqt
- aval
- quqt
- rjqt

### SyntheseRowModel

- label
- value
- unit

---

## 8. Design applicatif (sans forkJoin)

Le design repose sur un **chargement lazy par onglet**.

- Aucun chargement global
- Aucun `forkJoin`
- Appels MI déclenchés uniquement à l’activation des onglets

Bénéfices : performance, lisibilité, charge M3 maîtrisée.

---

## 9. Gestion des onglets (par domaine)

Chaque onglet :

- est indépendant
- possède son composant et son service
- charge ses données une seule fois

Onglets : Synthèse, Stocks, Production, Achats, Réservations, Actions.

---

## 10. Design

- Propre et lisible
- Date formatter dd/mm/yyyy
- Couleur noir,blanc,jeune
- Icon soho
- Bien input bien alignés

## 11. Services et subscribe()

Les `subscribe()` sont localisés dans les composants :

```ts
this.isLoading = true;
this.productionService.loadProduction(itno).subscribe({
  next: (data) => (this.production = data),
  error: () => (this.errorMessage = "Erreur chargement production"),
  complete: () => (this.isLoading = false),
});
```

---

## 12. Synthèse progressive

L’onglet Synthèse :

- ne fait pas d’appels MI directs
- consomme les données déjà chargées
- garantit la cohérence inter-onglets

---

## 13. Bonnes pratiques de design

- Lazy load par onglet
- Aucun appel inutile
- Services indépendants
- Données chargées une seule fois
- Gestion mémoire maîtrisée

---

## 14. Conclusion

La **Vue Stock 360** repose sur un design orienté domaine.

Cette architecture assure performance, lisibilité et maintenabilité. Elle constitue la **référence technique du mashup**.
