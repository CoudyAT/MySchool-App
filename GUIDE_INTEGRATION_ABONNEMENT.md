# Guide d'intégration du système d'abonnement dans les pages existantes

## 1. Dans la page des cours (courses.page.ts)

### Étape 1 : Importer les services nécessaires

```typescript
import { AbonnementService } from '../services/abonnement.service';
import { FiltreNiveauService } from '../services/filtre-niveau.service';
import { MatiereService } from '../services/matiere.service';
import { User } from 'src/app/models/user.model';
import { Subscription } from 'src/app/models/subscription.model';
import { Matiere } from 'src/app/models/course.model';
```

### Étape 2 : Injecter les services

```typescript
export class CoursesPage implements OnInit {
  private readonly abonnementService = inject(AbonnementService);
  private readonly filtreService = inject(FiltreNiveauService);
  private readonly matiereService = inject(MatiereService);

  currentUser: User | null = null;
  abonnementActif: Subscription | null = null;
  matieresAccessibles: Matiere[] = [];
  courses: Course[] = [];
  coursesFiltered: Course[] = [];
}
```

### Étape 3 : Charger les données avec filtrage

```typescript
ngOnInit() {
  this.loadUser();
  this.loadAbonnement();
}

loadUser() {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    this.currentUser = JSON.parse(userData);
  }
}

loadAbonnement() {
  if (!this.currentUser?.id) return;

  this.abonnementService
    .getActiveAbonnement(this.currentUser.id)
    .subscribe({
      next: (abonnement) => {
        this.abonnementActif = abonnement;
        
        // Si pas d'abonnement, rediriger
        if (!abonnement) {
          this.proposerAbonnement();
          return;
        }

        // Charger les matières et cours
        this.loadMatieresEtCours();
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
}

loadMatieresEtCours() {
  if (!this.currentUser?.niveauScolaire) return;

  // 1. Charger les matières disponibles
  this.abonnementService
    .getMatieresDisponibles(
      this.currentUser.niveauScolaire,
      this.currentUser.classe
    )
    .subscribe({
      next: (matieres) => {
        // Filtrer selon l'abonnement
        this.matieresAccessibles = this.filtreService.getMatieresAccessibles(
          this.currentUser!,
          matieres,
          this.abonnementActif?.matiereIds
        );

        // 2. Charger les cours
        this.loadCours();
      }
    });
}

loadCours() {
  this.courseService.getAllCourses().subscribe({
    next: (courses) => {
      this.courses = courses;
      
      // Filtrer par niveau
      this.coursesFiltered = this.filtreService.filtrerCoursParNiveau(
        courses,
        this.currentUser?.niveauScolaire,
        this.currentUser?.classe
      );

      // Filtrer par matières accessibles
      const matiereIdsAccessibles = this.matieresAccessibles.map(m => m.id);
      this.coursesFiltered = this.coursesFiltered.filter(
        course => !course.matiereId || matiereIdsAccessibles.includes(course.matiereId)
      );
    }
  });
}
```

### Étape 4 : Vérifier l'accès avant navigation

```typescript
naviguerVersCours(course: Course) {
  // Vérifier si le cours est accessible
  if (!this.isCoursAccessible(course)) {
    this.showToast('Vous n\'avez pas accès à ce cours', 'warning');
    return;
  }

  this.router.navigate(['/course-detail', course.id]);
}

isCoursAccessible(course: Course): boolean {
  // Si pas de matière associée, accessible par défaut
  if (!course.matiereId) return true;

  // Vérifier si la matière est dans la liste accessible
  return this.matieresAccessibles.some(m => m.id === course.matiereId);
}
```

## 2. Dans le template HTML (courses.page.html)

### Afficher info abonnement en haut

```html
<!-- Info abonnement -->
<ion-card *ngIf="abonnementActif" class="abonnement-info">
  <ion-card-content>
    <div class="abonnement-header">
      <ion-icon name="ribbon-outline"></ion-icon>
      <div>
        <h3>Mon abonnement</h3>
        <p *ngIf="abonnementActif.type === 'CLASSE'">
          Classe de {{ abonnementActif.classe }} - Toutes les matières
        </p>
        <p *ngIf="abonnementActif.type === 'MATIERES'">
          {{ abonnementActif.matiereIds?.length }} matières sélectionnées
        </p>
      </div>
    </div>

    <!-- Badge expiration -->
    <ion-badge *ngIf="abonnementExpireBientot()" color="warning">
      Expire dans {{ getJoursRestants() }} jours
    </ion-badge>
  </ion-card-content>
</ion-card>
```

### Afficher les cours avec badge d'accès

```html
<!-- Liste des cours -->
<ion-card *ngFor="let course of coursesFiltered" 
          [class.non-accessible]="!isCoursAccessible(course)"
          (click)="naviguerVersCours(course)">
  
  <!-- Badge accessible/non accessible -->
  <ion-badge 
    slot="end" 
    [color]="isCoursAccessible(course) ? 'success' : 'medium'">
    {{ isCoursAccessible(course) ? 'Accessible' : 'Verrouillé' }}
  </ion-badge>

  <ion-card-header>
    <ion-card-title>{{ course.title }}</ion-card-title>
  </ion-card-header>

  <ion-card-content>
    <p>{{ course.description }}</p>

    <!-- Message si non accessible -->
    <div *ngIf="!isCoursAccessible(course)" class="message-non-accessible">
      <ion-icon name="lock-closed-outline"></ion-icon>
      Ce cours n'est pas inclus dans votre abonnement
    </div>
  </ion-card-content>
</ion-card>
```

### Message si aucun cours accessible

```html
<ion-card *ngIf="coursesFiltered.length === 0 && !isLoading">
  <ion-card-content class="text-center">
    <ion-icon name="school-outline" size="large"></ion-icon>
    <h2>Aucun cours disponible</h2>
    <p>Aucun cours ne correspond à votre niveau et votre abonnement</p>
    <ion-button (click)="allerVersAbonnement()">
      Modifier mon abonnement
    </ion-button>
  </ion-card-content>
</ion-card>
```

## 3. Dans mes-cours.page.ts

### Filtrer uniquement les cours accessibles

```typescript
loadMesCours() {
  if (!this.currentUser) return;

  // 1. Charger l'abonnement
  this.abonnementService
    .getActiveAbonnement(this.currentUser.id!)
    .subscribe({
      next: (abonnement) => {
        this.abonnementActif = abonnement;

        // 2. Charger les cours inscrits
        this.coursService.getEnrolledCourses(this.currentUser!.id!).subscribe({
          next: (courses) => {
            // 3. Filtrer par niveau
            let coursesFiltered = this.filtreService.filtrerCoursParNiveau(
              courses,
              this.currentUser!.niveauScolaire,
              this.currentUser!.classe
            );

            // 4. Filtrer par matières accessibles si abonnement MATIERES
            if (abonnement?.type === 'MATIERES' && abonnement.matiereIds) {
              coursesFiltered = coursesFiltered.filter(
                course => !course.matiereId || 
                         abonnement.matiereIds!.includes(course.matiereId)
              );
            }

            this.mesCours = coursesFiltered;
          }
        });
      }
    });
}
```

## 4. Dans course-detail.page.ts

### Vérifier l'accès au cours

```typescript
ngOnInit() {
  const courseId = this.route.snapshot.paramMap.get('id');
  if (courseId) {
    this.loadCourse(courseId);
  }
}

loadCourse(courseId: string) {
  this.courseService.getCourseById(courseId).subscribe({
    next: (course) => {
      this.course = course;
      
      // Vérifier l'accès
      this.verifierAcces(course);
    }
  });
}

async verifierAcces(course: Course) {
  if (!this.currentUser?.id) {
    await this.showToast('Veuillez vous connecter', 'warning');
    this.router.navigate(['/login']);
    return;
  }

  // Charger l'abonnement
  this.abonnementService
    .getActiveAbonnement(this.currentUser.id)
    .subscribe({
      next: async (abonnement) => {
        if (!abonnement) {
          await this.showToast('Vous devez avoir un abonnement actif', 'warning');
          this.router.navigate(['/selection-matieres']);
          return;
        }

        // Vérifier si la matière du cours est accessible
        if (course.matiereId) {
          const estAccessible = !abonnement.matiereIds || 
                               abonnement.matiereIds.includes(course.matiereId);

          if (!estAccessible) {
            await this.showToast(
              'Ce cours n\'est pas inclus dans votre abonnement',
              'warning'
            );
            this.router.navigate(['/courses']);
            return;
          }
        }

        // Accès autorisé
        this.hasAccess = true;
      }
    });
}
```

## 5. Dans profile.page.ts

### Afficher l'abonnement dans le profil

```typescript
loadProfile() {
  this.loadUser();
  this.loadAbonnement();
}

loadAbonnement() {
  if (!this.currentUser?.id) return;

  this.abonnementService
    .getActiveAbonnement(this.currentUser.id)
    .subscribe({
      next: (abonnement) => {
        this.abonnementActif = abonnement;

        // Si abonnement MATIERES, charger les détails des matières
        if (abonnement?.matiereIds) {
          this.loadMatiereDetails(abonnement.matiereIds);
        }
      }
    });
}

loadMatiereDetails(matiereIds: string[]) {
  // Charger les détails de chaque matière
  matiereIds.forEach(id => {
    this.matiereService.getMatiereById(id).subscribe({
      next: (matiere) => {
        this.matieresAbonnement.push(matiere);
      }
    });
  });
}
```

### Dans le template du profil

```html
<!-- Section abonnement -->
<ion-card>
  <ion-card-header>
    <ion-card-title>Mon abonnement</ion-card-title>
  </ion-card-header>

  <ion-card-content>
    <div *ngIf="abonnementActif; else noAbonnement">
      <!-- Type -->
      <ion-item lines="none">
        <ion-label>
          <p>Type</p>
          <h3>{{ abonnementActif.type === 'CLASSE' ? 'Abonnement complet' : 'Abonnement 3 matières' }}</h3>
        </ion-label>
      </ion-item>

      <!-- Matières (si MATIERES) -->
      <ion-item *ngIf="abonnementActif.type === 'MATIERES'" lines="none">
        <ion-label>
          <p>Mes matières</p>
          <div class="matieres-list">
            <ion-chip *ngFor="let matiere of matieresAbonnement" [color]="matiere.color">
              <ion-icon [name]="matiere.icon"></ion-icon>
              <ion-label>{{ matiere.nom }}</ion-label>
            </ion-chip>
          </div>
        </ion-label>
      </ion-item>

      <!-- Date fin -->
      <ion-item lines="none">
        <ion-label>
          <p>Valable jusqu'au</p>
          <h3>{{ abonnementActif.dateFin | date:'dd/MM/yyyy' }}</h3>
        </ion-label>
        <ion-badge 
          slot="end" 
          [color]="abonnementExpireBientot() ? 'warning' : 'success'">
          {{ getJoursRestants() }} jours restants
        </ion-badge>
      </ion-item>

      <!-- Boutons action -->
      <div class="actions">
        <ion-button expand="block" (click)="renouvelerAbonnement()">
          Renouveler
        </ion-button>
      </div>
    </div>

    <ng-template #noAbonnement>
      <p>Vous n'avez pas d'abonnement actif</p>
      <ion-button expand="block" (click)="souscrire()">
        Choisir mes matières
      </ion-button>
    </ng-template>
  </ion-card-content>
</ion-card>
```

## 6. Garde de route (guard)

### Créer un guard pour protéger les routes

```typescript
// abonnement.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AbonnementService } from '../services/abonnement.service';
import { map } from 'rxjs/operators';

export const abonnementGuard: CanActivateFn = (route, state) => {
  const abonnementService = inject(AbonnementService);
  const router = inject(Router);
  
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!user.id) {
    router.navigate(['/login']);
    return false;
  }

  return abonnementService.hasActiveAbonnement(user.id).pipe(
    map(hasAbonnement => {
      if (!hasAbonnement) {
        router.navigate(['/selection-matieres']);
        return false;
      }
      return true;
    })
  );
};
```

### Utiliser le guard dans les routes

```typescript
// app.routes.ts
{
  path: 'courses',
  component: CoursesPage,
  canActivate: [abonnementGuard]
},
{
  path: 'course-detail/:id',
  component: CoursDetailPage,
  canActivate: [abonnementGuard]
}
```

## 7. Notifications d'expiration

### Service de notification

```typescript
// notification-abonnement.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationAbonnementService {
  private readonly abonnementService = inject(AbonnementService);
  private readonly toastCtrl = inject(ToastController);

  async verifierExpiration(userId: string) {
    this.abonnementService.getActiveAbonnement(userId).subscribe({
      next: async (abonnement) => {
        if (!abonnement) return;

        const joursRestants = this.getJoursRestants(abonnement.dateFin);

        // Notification 30 jours avant
        if (joursRestants === 30) {
          await this.afficherNotification(
            `Votre abonnement expire dans ${joursRestants} jours`,
            'warning'
          );
        }

        // Notification 7 jours avant
        if (joursRestants === 7) {
          await this.afficherNotification(
            `Votre abonnement expire dans ${joursRestants} jours`,
            'danger'
          );
        }

        // Notification le jour même
        if (joursRestants === 0) {
          await this.afficherNotification(
            'Votre abonnement expire aujourd\'hui !',
            'danger'
          );
        }
      }
    });
  }

  private getJoursRestants(dateFin: any): number {
    const fin = new Date(dateFin);
    const maintenant = new Date();
    return Math.ceil((fin.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));
  }

  private async afficherNotification(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 5000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'Renouveler',
          handler: () => {
            // Navigation vers renouvellement
          }
        }
      ]
    });
    await toast.present();
  }
}
```

## Résumé des modifications

1. ✅ **courses.page.ts** : Filtrer cours par niveau et abonnement
2. ✅ **mes-cours.page.ts** : Afficher uniquement cours accessibles
3. ✅ **course-detail.page.ts** : Vérifier accès avant affichage
4. ✅ **profile.page.ts** : Afficher info abonnement
5. ✅ **app.routes.ts** : Ajouter guard pour protéger les routes
6. ✅ **signup-flow.component.ts** : Rediriger vers sélection après inscription

## Points importants

- Toujours vérifier `niveauScolaire` avant de filtrer
- Gérer le cas où `abonnementActif` est null
- Afficher des messages clairs pour l'utilisateur
- Rediriger vers `/selection-matieres` si pas d'abonnement
- Vérifier l'accès à CHAQUE navigation vers un cours
