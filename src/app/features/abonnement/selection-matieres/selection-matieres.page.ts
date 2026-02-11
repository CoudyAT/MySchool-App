import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonLabel,
  IonItem,
  IonList,
  IonSpinner,
  IonBadge,
  ToastController,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  alertCircle,
  schoolOutline,
  bookOutline,
  ribbonOutline,
  arrowBack, informationCircleOutline } from 'ionicons/icons';

import { AbonnementService } from '../../services/abonnement.service';
import { MatiereService } from '../../services/matiere.service';
import { User } from 'src/app/models/user.model';
import { Matiere } from 'src/app/models/course.model';
import { CreateSubscriptionDTO } from 'src/app/models/subscription.model';

@Component({
  selector: 'app-selection-matieres',
  templateUrl: './selection-matieres.page.html',
  styleUrls: ['./selection-matieres.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonLabel,
    IonItem,
    IonList,
    IonSpinner,
    IonBadge,
    IonBackButton,
    IonButtons,
  ],
})
export class SelectionMatieresPage implements OnInit {
  private readonly abonnementService = inject(AbonnementService);
  private readonly matiereService = inject(MatiereService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  currentUser: User | null = null;
  matieres: Matiere[] = [];
  selectedMatiereNoms: string[] = []; // Stocker les noms des matières
  isLoading = true;
  isSaving = false;

  // Configuration selon le niveau
  typeAbonnement: 'CLASSE' | 'MATIERE' = 'MATIERE';
  nombreMatieresRequises = 0;
  prixAbonnement = 5000;

  constructor() {
    addIcons({schoolOutline,bookOutline,ribbonOutline,checkmarkCircle,alertCircle,informationCircleOutline,arrowBack,});
  }

  ngOnInit() {
    this.loadUser();
    this.configurerAbonnement();
    this.loadMatieres();
  }

  /**
   * Charger l'utilisateur depuis le localStorage
   */
  loadUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }

    if (!this.currentUser || !this.currentUser.niveauScolaire) {
      this.showToast('Veuillez configurer votre profil d\'abord', 'warning');
      this.router.navigate(['/profile']);
    }
  }

  /**
   * Configurer le type d'abonnement selon le niveau
   */
  configurerAbonnement() {
    if (!this.currentUser?.niveauScolaire) return;

    this.typeAbonnement = this.abonnementService.determinerTypeAbonnement(
      this.currentUser.niveauScolaire
    );
    this.nombreMatieresRequises = this.abonnementService.getNombreMatieresRequises(
      this.currentUser.niveauScolaire
    );
    this.prixAbonnement = this.abonnementService.PRIX_ABONNEMENT;
  }

  /**
   * Charger les matières disponibles
   */
  loadMatieres() {
    if (!this.currentUser?.niveauScolaire) {
      this.isLoading = false;
      return;
    }

    this.abonnementService
      .getMatieresDisponibles(
        this.currentUser.niveauScolaire,
        this.currentUser.classe
      )
      .subscribe({
        next: (matieres) => {
          this.matieres = matieres.filter(m => m.isActive !== false);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement matières:', error);
          this.showToast('Erreur lors du chargement des matières', 'danger');
          this.isLoading = false;
        },
      });
  }

  /**
   * Toggle selection d'une matière
   */
  toggleMatiere(matiereNom: string) {
    const index = this.selectedMatiereNoms.indexOf(matiereNom);

    if (index > -1) {
      // Désélectionner
      this.selectedMatiereNoms.splice(index, 1);
    } else {
      // Vérifier la limite
      if (this.selectedMatiereNoms.length >= this.nombreMatieresRequises) {
        this.showToast(
          `Vous ne pouvez sélectionner que ${this.nombreMatieresRequises} matières`,
          'warning'
        );
        return;
      }
      // Sélectionner
      this.selectedMatiereNoms.push(matiereNom);
    }
  }

  /**
   * Vérifier si une matière est sélectionnée
   */
  isMatiereSelected(matiereNom: string): boolean {
    return this.selectedMatiereNoms.includes(matiereNom);
  }

  /**
   * Vérifier si la sélection est valide
   */
  isSelectionValide(): boolean {
    // Pour CLASSE, pas besoin de matières
    if (this.typeAbonnement === 'CLASSE') {
      return !!this.currentUser?.classe;
    }

    // Pour MATIERE, exactement 3 matières requises
    return this.selectedMatiereNoms.length === this.nombreMatieresRequises;
  }

  /**
   * Valider et créer l'abonnement
   */
  async validerSelection() {
    if (!this.currentUser?.id || !this.currentUser.niveauScolaire || !this.currentUser.classe) {
      this.showToast('Utilisateur non connecté ou profil incomplet', 'danger');
      return;
    }

    if (!this.isSelectionValide()) {
      this.showToast(
        `Veuillez sélectionner ${this.nombreMatieresRequises} matières`,
        'warning'
      );
      return;
    }

    this.isSaving = true;

    const abonnementData: CreateSubscriptionDTO = {
      userId: this.currentUser.id,
      niveauScolaire: this.currentUser.niveauScolaire,
      classe: this.currentUser.classe,
      typeAbonnement: this.typeAbonnement,
      ...(this.typeAbonnement === 'MATIERE' && { matieres: this.selectedMatiereNoms }),
    };

    this.abonnementService.creerAbonnement(abonnementData).subscribe({
      next: async (response) => {
        await this.showToast('Redirection vers le paiement...', 'success');

        // Sauvegarder l'ID de souscription pour référence
        localStorage.setItem('pendingSubscriptionId', response.data.subscriptionId);
        localStorage.setItem('pendingPaymentId', response.data.paymentId);

        // Rediriger vers Wave payment
        globalThis.location.href = response.data.paymentUrl;
      },
      error: async (error) => {
        console.error('Erreur création abonnement:', error);
        await this.showToast(
          error.error?.message || 'Erreur lors de la création de l\'abonnement',
          'danger'
        );
        this.isSaving = false;
      },
    });
  }

  /**
   * Obtenir les matières sélectionnées
   */
  getSelectedMatieres(): Matiere[] {
    return this.matieres.filter((m) =>
      this.selectedMatiereNoms.includes(m.nom)
    );
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
   * Obtenir la description du type d'abonnement
   */
  getDescriptionAbonnement(): string {
    if (this.typeAbonnement === 'CLASSE') {
      return `Abonnement complet pour la classe de ${this.currentUser?.classe}`;
    }
    return `Sélectionnez ${this.nombreMatieresRequises} matières pour votre niveau ${this.currentUser?.niveauScolaire}`;
  }

  /**
   * Obtenir le texte du bouton
   */
  getButtonText(): string {
    if (!this.isSelectionValide()) {
      const reste = this.nombreMatieresRequises - this.selectedMatiereNoms.length;
      return reste > 0
        ? `Sélectionnez ${reste} matière${reste > 1 ? 's' : ''} de plus`
        : 'Sélection invalide';
    }
    return `Valider et payer ${this.prixAbonnement.toLocaleString()} FCFA`;
  }
}
