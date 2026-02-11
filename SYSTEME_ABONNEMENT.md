# Système d'Abonnement MySchool

## Vue d'ensemble

Système d'abonnement à 5 000 FCFA/an permettant aux utilisateurs d'accéder à des cours selon leur niveau scolaire.

## Types d'abonnements

### 1. ELEMENTAIRE (CI, CP, CE1, CE2, CM1, CM2)
- **Type** : Abonnement par CLASSE
- **Sélection** : Toutes les matières de la classe
- **Prix** : 5 000 FCFA/an

### 2. MOYEN, SECONDAIRE, UNIVERSITAIRE
- **Type** : Abonnement par MATIÈRES
- **Sélection** : EXACTEMENT 3 matières obligatoires
- **Prix** : 5 000 FCFA/an chacun

## Flux utilisateur

### 1. Inscription (`/signup`)

L'utilisateur renseigne :
- Informations personnelles (nom, prénom, téléphone...)
- **Niveau scolaire** : ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE
- **Classe** : Selon le niveau choisi

Fichier : `src/app/features/auth/signup-flow/signup-flow.component.ts`

### 2. Sélection des matières (`/selection-matieres`)

**Pour ELEMENTAIRE** :
- Affichage automatique : "Vous aurez accès à toutes les matières de votre classe"
- Pas de sélection manuelle

**Pour MOYEN/SECONDAIRE/UNIVERSITAIRE** :
- Interface de sélection avec cartes cliquables
- Compteur : X/3 matières sélectionnées
- Validation uniquement si exactement 3 matières

Fichiers :
- `src/app/features/abonnement/selection-matieres/selection-matieres.page.ts`
- `src/app/features/abonnement/selection-matieres/selection-matieres.page.html`
- `src/app/features/abonnement/selection-matieres/selection-matieres.page.scss`

### 3. Paiement (`/payments`)

Redirection vers la page de paiement avec :
- `abonnementId` : ID de l'abonnement créé
- `montant` : 5000 FCFA

### 4. Accès aux cours

L'utilisateur ne voit que :
- Les cours de SON niveau scolaire
- Les matières de SON abonnement

## Structure des données

### User Model (`src/app/models/user.model.ts`)

```typescript
export interface User {
  id: string;
  niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';
  classe: 'CI' | 'CP' | 'CE1' | ... | 'Master2';
  // ... autres champs
}
```

### Subscription Model (`src/app/models/subscription.model.ts`)

```typescript
export interface Subscription {
  id: string;
  userId: string;
  type: 'CLASSE' | 'MATIERES';
  niveauScolaire: NiveauScolaire;
  classe?: string; // Pour ELEMENTAIRE
  matiereIds?: string[]; // Pour MOYEN/SECONDAIRE/UNIVERSITAIRE (3 matières)
  montant: 5000;
  devise: 'XOF';
  dateDebut: Date;
  dateFin: Date; // +1 an
  statut: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
}
```

### Matiere Model (`src/app/models/course.model.ts`)

```typescript
export interface Matiere {
  id: string;
  nom: string;
  niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';
  classe?: string; // Optionnel
  icon: string;
  color: string;
  description?: string;
}
```

## Services

### AbonnementService (`src/app/features/services/abonnement.service.ts`)

Méthodes principales :
- `creerAbonnement(data)` : Créer un nouvel abonnement
- `getMatieresDisponibles(niveau, classe)` : Obtenir les matières filtrées
- `determinerTypeAbonnement(niveau)` : CLASSE ou MATIERES
- `validerAbonnement(data)` : Validation des règles métier

### MatiereService (`src/app/features/services/matiere.service.ts`)

Méthodes principales :
- `getAllMatieres()` : Toutes les matières
- `getMatieresByNiveau(niveau)` : Filtrer par niveau
- `getMatieresByClasse(classe)` : Filtrer par classe

### FiltreNiveauService (`src/app/features/services/filtre-niveau.service.ts`)

Méthodes principales :
- `filtrerMatieresParNiveau(matieres, niveau, classe)` : Filtrage des matières
- `filtrerCoursParNiveau(cours, niveau, classe)` : Filtrage des cours
- `getMatieresAccessibles(user, matieres, abonnement)` : Matières selon abonnement
- `isMatiereAccessible(matiere, user, abonnement)` : Vérifier l'accès

## Règles métier

### Validation de l'abonnement

1. **UserId obligatoire**
2. **NiveauScolaire obligatoire**
3. **Pour ELEMENTAIRE** :
   - Classe obligatoire
   - Classe valide : CI, CP, CE1, CE2, CM1, CM2
4. **Pour MOYEN/SECONDAIRE/UNIVERSITAIRE** :
   - Exactement 3 matières obligatoires
   - Matières du même niveau que l'utilisateur

### Filtrage des matières

```typescript
// L'utilisateur voit uniquement :
- Matières de son niveauScolaire
- Matières de sa classe (si spécifiée)
- Si abonnement MATIERES : uniquement les 3 matières choisies
```

### Prix unique

```typescript
PRIX = 5 000 FCFA/an
DEVISE = XOF
DUREE = 1 an
```

## Exemples d'utilisation

### Créer un abonnement ELEMENTAIRE

```typescript
const abonnementData: CreateSubscriptionDTO = {
  userId: 'user123',
  niveauScolaire: 'ELEMENTAIRE',
  classe: 'CE2',
  // Pas de matiereIds pour ELEMENTAIRE
};

abonnementService.creerAbonnement(abonnementData).subscribe();
```

### Créer un abonnement SECONDAIRE

```typescript
const abonnementData: CreateSubscriptionDTO = {
  userId: 'user123',
  niveauScolaire: 'SECONDAIRE',
  classe: 'Première',
  matiereIds: ['maths-id', 'physique-id', 'svt-id'], // Exactement 3
};

abonnementService.creerAbonnement(abonnementData).subscribe();
```

### Filtrer les matières pour un utilisateur

```typescript
const user: User = {
  id: 'user123',
  niveauScolaire: 'MOYEN',
  classe: '4ème'
};

// Obtenir les matières disponibles
abonnementService
  .getMatieresDisponibles(user.niveauScolaire, user.classe)
  .subscribe(matieres => {
    // matieres = toutes les matières de MOYEN / 4ème
  });
```

### Vérifier l'accès à une matière

```typescript
const user: User = { niveauScolaire: 'SECONDAIRE', classe: 'Terminale' };
const matiere: Matiere = { niveauScolaire: 'SECONDAIRE', ... };
const abonnementMatieres = ['maths-id', 'physique-id', 'francais-id'];

const estAccessible = filtreNiveauService.isMatiereAccessible(
  matiere,
  user,
  abonnementMatieres
);
```

## Intégration dans l'application

### 1. Après l'inscription

```typescript
// signup-flow.component.ts - après création du compte
setTimeout(() => {
  // Rediriger vers la sélection de matières
  this.router.navigate(['/selection-matieres']);
}, 1000);
```

### 2. Dans la page des cours

```typescript
// courses.page.ts
ngOnInit() {
  const user = this.getCurrentUser();
  
  // Charger l'abonnement actif
  this.abonnementService.getActiveAbonnement(user.id).subscribe(abonnement => {
    // Charger les matières accessibles
    this.filtreNiveauService.getMatieresAccessibles(
      user,
      toutesLesMatieres,
      abonnement?.matiereIds
    );
  });
}
```

### 3. Affichage conditionnel

```html
<!-- Afficher seulement si accessible -->
<ion-card *ngFor="let matiere of matieresAccessibles">
  <!-- Contenu -->
</ion-card>

<!-- Message si non accessible -->
<ion-card *ngIf="!isMatiereAccessible(matiere)">
  <p>{{ filtreNiveauService.getMessageNonAccessible(matiere, user) }}</p>
</ion-card>
```

## Tests

### Scénarios à tester

1. **Inscription ELEMENTAIRE**
   - Sélectionner classe CP
   - Vérifier accès à toutes les matières CP

2. **Inscription MOYEN**
   - Sélectionner 3 matières
   - Vérifier impossibilité de sélectionner 4ème matière
   - Vérifier impossibilité de valider avec 2 matières

3. **Filtrage**
   - User SECONDAIRE ne voit pas matières MOYEN
   - User 3ème ne voit pas matières 5ème

4. **Abonnement expiré**
   - Vérifier message d'expiration
   - Bloquer l'accès aux cours

## Routes

- `/signup` - Inscription avec choix niveau/classe
- `/selection-matieres` - Sélection des matières (après inscription)
- `/abonnement` - Liste des abonnements de l'utilisateur
- `/courses` - Cours filtrés par niveau/abonnement

## Prochaines étapes

1. ✅ Modèles créés
2. ✅ Services créés
3. ✅ Page sélection matières créée
4. ✅ Filtrage par niveau implémenté
5. 🔲 Intégrer dans la page des cours
6. 🔲 Ajouter vérification abonnement actif
7. 🔲 Gérer expiration d'abonnement
8. 🔲 Ajouter renouvellement automatique

## Support

Pour toute question sur le système d'abonnement, consulter :
- `AbonnementService` pour la logique métier
- `FiltreNiveauService` pour le filtrage
- `SelectionMatieresPage` pour l'interface utilisateur
