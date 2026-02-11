import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

import { AbonnementService } from '../../services/abonnement.service';
import { MatiereService } from '../../services/matiere.service';
import { FiltreNiveauService } from '../../services/filtre-niveau.service';
import { User } from 'src/app/models/user.model';
import { Matiere } from 'src/app/models/course.model';
import { Subscription } from 'src/app/models/subscription.model';

/**
 * EXEMPLE D'INTÉGRATION DU SYSTÈME D'ABONNEMENT
 *
 * Ce fichier montre comment intégrer le filtrage par niveau et abonnement
 * dans une page de cours ou de matières.
 */
@Component({
  selector: 'app-exemple-integration-abonnement',
  template: `
    <!-- Exemple de template -->
    <ion-content>
      <!-- Afficher les matières accessibles uniquement -->
      <div *ngFor="let matiere of matieresAccessibles">
        <ion-card (click)="ouvrirMatiere(matiere)">
          <ion-card-header>
            <ion-card-title>{{ matiere.nom }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ matiere.description }}</p>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Message si aucune matière accessible -->
      <ion-card *ngIf="matieresAccessibles.length === 0 && !isLoading">
        <ion-card-content>
          <p>Aucune matière disponible</p>
          <ion-button (click)="allerVersAbonnement()">
            Choisir mes matières
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Matières non accessibles (grisées) -->
      <div *ngFor="let matiere of matieresNonAccessibles">
        <ion-card class="disabled">
          <ion-card-header>
            <ion-card-title>{{ matiere.nom }}</ion-card-title>
            <ion-badge color="warning">Non accessible</ion-badge>
          </ion-card-header>
          <ion-card-content>
            <p>{{ getMessageNonAccessible(matiere) }}</p>
            <ion-button size="small" (click)="modifierAbonnement()">
              Modifier mon abonnement
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ExempleIntegrationAbonnement implements OnInit {
  private readonly abonnementService = inject(AbonnementService);
  private readonly matiereService = inject(MatiereService);
  private readonly filtreService = inject(FiltreNiveauService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  currentUser: User | null = null;
  abonnementActif: Subscription | null = null;
  toutesLesMatieres: Matiere[] = [];
  matieresAccessibles: Matiere[] = [];
  matieresNonAccessibles: Matiere[] = [];
  isLoading = true;

  ngOnInit() {
    this.chargerDonnees();
  }

  /**
   * ÉTAPE 1 : Charger toutes les données nécessaires
   */
  async chargerDonnees() {
    // 1. Charger l'utilisateur
    this.currentUser = this.getCurrentUser();

    if (!this.currentUser) {
      await this.showToast('Veuillez vous connecter', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    // 2. Vérifier si l'utilisateur a configuré son niveau
    if (!this.currentUser.niveauScolaire) {
      await this.showToast('Veuillez configurer votre profil', 'warning');
      this.router.navigate(['/profile']);
      return;
    }

    // 3. Charger l'abonnement actif
    this.abonnementService.getActiveAbonnement(this.currentUser.id!).subscribe({
      next: (abonnement) => {
        this.abonnementActif = abonnement;

        if (!abonnement) {
          // Pas d'abonnement actif
          this.proposerAbonnement();
          return;
        }

        // 4. Charger les matières avec filtrage
        this.chargerMatieres();
      },
      error: (error) => {
        console.error('Erreur chargement abonnement:', error);
        this.showToast('Erreur lors du chargement', 'danger');
      }
    });
  }

  /**
   * ÉTAPE 2 : Charger et filtrer les matières
   */
  chargerMatieres() {
    if (!this.currentUser?.niveauScolaire) return;

    // Charger toutes les matières du niveau de l'utilisateur
    this.abonnementService
      .getMatieresDisponibles(
        this.currentUser.niveauScolaire,
        this.currentUser.classe
      )
      .subscribe({
        next: (matieres) => {
          this.toutesLesMatieres = matieres;

          // Séparer les matières accessibles et non accessibles
          this.filtrerMatieres();

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement matières:', error);
          this.showToast('Erreur lors du chargement des matières', 'danger');
          this.isLoading = false;
        }
      });
  }

  /**
   * ÉTAPE 3 : Filtrer les matières selon l'abonnement
   */
  filtrerMatieres() {
    if (!this.currentUser) return;

    // Obtenir les IDs des matières de l'abonnement
    const matiereIdsAbonnement = this.abonnementActif?.matiereIds;

    // Séparer accessibles et non accessibles
    this.matieresAccessibles = [];
    this.matieresNonAccessibles = [];

    this.toutesLesMatieres.forEach(matiere => {
      const estAccessible = this.filtreService.isMatiereAccessible(
        matiere,
        this.currentUser!,
        matiereIdsAbonnement
      );

      if (estAccessible) {
        this.matieresAccessibles.push(matiere);
      } else {
        this.matieresNonAccessibles.push(matiere);
      }
    });

    console.log('Matières accessibles:', this.matieresAccessibles.length);
    console.log('Matières non accessibles:', this.matieresNonAccessibles.length);
  }

  /**
   * MÉTHODE ALTERNATIVE : Filtrage simple
   */
  filtrerMatieresSimple() {
    if (!this.currentUser) return;

    const matiereIdsAbonnement = this.abonnementActif?.matiereIds;

    // Utiliser le service de filtrage
    this.matieresAccessibles = this.filtreService.getMatieresAccessibles(
      this.currentUser,
      this.toutesLesMatieres,
      matiereIdsAbonnement
    );
  }

  /**
   * Obtenir le message expliquant pourquoi une matière n'est pas accessible
   */
  getMessageNonAccessible(matiere: Matiere): string {
    if (!this.currentUser) return '';

    return this.filtreService.getMessageNonAccessible(
      matiere,
      this.currentUser
    );
  }

  /**
   * Ouvrir une matière
   */
  ouvrirMatiere(matiere: Matiere) {
    // Vérifier une dernière fois l'accès
    if (!this.isMatiereAccessible(matiere)) {
      this.showToast('Vous n\'avez pas accès à cette matière', 'warning');
      return;
    }

    // Naviguer vers les cours de la matière
    this.router.navigate(['/cours'], {
      queryParams: {
        matiereId: matiere.id
      }
    });
  }

  /**
   * Vérifier si une matière est accessible
   */
  isMatiereAccessible(matiere: Matiere): boolean {
    if (!this.currentUser) return false;

    return this.filtreService.isMatiereAccessible(
      matiere,
      this.currentUser,
      this.abonnementActif?.matiereIds
    );
  }

  /**
   * Proposer de créer un abonnement
   */
  async proposerAbonnement() {
    await this.showToast(
      'Vous devez choisir vos matières pour accéder aux cours',
      'warning'
    );

    // Rediriger vers la sélection de matières après 2 secondes
    setTimeout(() => {
      this.router.navigate(['/selection-matieres']);
    }, 2000);
  }

  /**
   * Aller vers la page d'abonnement
   */
  allerVersAbonnement() {
    this.router.navigate(['/selection-matieres']);
  }

  /**
   * Modifier l'abonnement existant
   */
  async modifierAbonnement() {
    if (!this.abonnementActif) return;

    // Afficher un message d'information
    await this.showToast(
      'Pour modifier vos matières, contactez le support',
      'primary'
    );

    // Ou rediriger vers une page de modification
    // this.router.navigate(['/modifier-abonnement']);
  }

  /**
   * Obtenir l'utilisateur courant
   */
  private getCurrentUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Afficher un toast
   */
  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  /**
   * EXEMPLE : Vérifier l'accès avant de naviguer
   */
  naviguerVersCours(coursId: string, matiereId: string) {
    // Trouver la matière
    const matiere = this.toutesLesMatieres.find(m => m.id === matiereId);

    if (!matiere) {
      this.showToast('Matière non trouvée', 'danger');
      return;
    }

    // Vérifier l'accès
    if (!this.isMatiereAccessible(matiere)) {
      this.showToast(
        `Vous n'avez pas accès à cette matière. ${this.getMessageNonAccessible(matiere)}`,
        'warning'
      );
      return;
    }

    // Navigation autorisée
    this.router.navigate(['/course-detail', coursId]);
  }

  /**
   * EXEMPLE : Afficher un badge selon le statut d'accès
   */
  getBadgeColor(matiere: Matiere): string {
    return this.isMatiereAccessible(matiere) ? 'success' : 'medium';
  }

  /**
   * EXEMPLE : Afficher le type d'abonnement
   */
  getTypeAbonnementLabel(): string {
    if (!this.abonnementActif) return 'Aucun abonnement';

    if (this.abonnementActif.type === 'CLASSE') {
      return `Abonnement complet - Classe de ${this.abonnementActif.classe}`;
    }

    const nbMatieres = this.abonnementActif.matiereIds?.length || 0;
    return `Abonnement ${nbMatieres} matières`;
  }

  /**
   * EXEMPLE : Vérifier si l'abonnement expire bientôt
   */
  abonnementExpireBientot(): boolean {
    if (!this.abonnementActif?.dateFin) return false;

    const dateFin = new Date(this.abonnementActif.dateFin);
    const maintenant = new Date();
    const joursRestants = Math.ceil(
      (dateFin.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)
    );

    return joursRestants <= 30 && joursRestants > 0;
  }

  /**
   * EXEMPLE : Obtenir les jours restants
   */
  getJoursRestants(): number {
    if (!this.abonnementActif?.dateFin) return 0;

    const dateFin = new Date(this.abonnementActif.dateFin);
    const maintenant = new Date();
    const joursRestants = Math.ceil(
      (dateFin.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, joursRestants);
  }
}
