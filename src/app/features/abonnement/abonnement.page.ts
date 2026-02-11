import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { SubscriptionService } from '../services/subscription.service';
import { Router } from '@angular/router';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.page.html',
  styleUrls: ['./abonnement.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    DatePipe,
    LowerCasePipe,
    DesktopHeaderComponent,
  ],
})
export class AbonnementPage implements OnInit {
  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];
  currentUser: any;
  searchText: string = '';
  selectedStatus: string = '';
  selectedNiveau: string = '';
  selectedClasse: string = '';
  isLoading: boolean = true;

  // Classes disponibles selon le niveau
  classesParNiveau: Record<string, string[]> = {
    'ELEMENTAIRE': ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    'MOYEN': ['6ème', '5ème', '4ème', '3ème'],
    'SECONDAIRE': ['Seconde', 'Première', 'Terminale'],
    'UNIVERSITAIRE': ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
  };

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadSubscriptions();
  }

  /**
   * Charger l'utilisateur courant depuis le localStorage
   */
  loadUser() {
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      this.currentUser = JSON.parse(localUser);
    }
  }

  /**
   * Charger les abonnements de l'utilisateur
   */
  loadSubscriptions() {
    if (!this.currentUser?.id) {
      this.isLoading = false;
      return;
    }

    this.subscriptionService
      .getUserSubscriptions(this.currentUser.id)
      .subscribe({
        next: (res) => {
          this.subscriptions = res.data.map((sub: any) => ({
            ...sub,
            startDate: this.convertTimestampToDate(sub.startDate),
            endDate: this.convertTimestampToDate(sub.endDate),
            createdAt: this.convertTimestampToDate(sub.createdAt),
            // Déterminer le statut basé sur la date
            status: this.getSubscriptionStatus(
              this.convertTimestampToDate(sub.startDate),
              this.convertTimestampToDate(sub.endDate)
            ),
          }));

          // Initialiser la liste filtrée
          this.filteredSubscriptions = [...this.subscriptions];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des abonnements:', err);
          this.isLoading = false;
        },
      });
  }

  /**
   * Convertir un timestamp Firestore en Date JavaScript
   */
  convertTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    // Si c'est un objet Firestore avec _seconds
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }

    // Si c'est déjà une date ou un timestamp milliseconde
    return new Date(timestamp);
  }

  /**
   * Déterminer le statut d'un abonnement
   */
  getSubscriptionStatus(startDate: Date, endDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Si la date de fin est passée
    if (today > end) {
      return 'EXPIRED';
    }

    // Si la date de début est dans le futur
    if (today < start) {
      return 'PENDING';
    }

    // Sinon, c'est actif
    return 'ACTIVE';
  }

  /**
   * Calculer les jours restants
   */
  getRemainingDays(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Obtenir les classes disponibles selon le niveau sélectionné
   */
  getClassesDisponibles(): string[] {
    if (!this.selectedNiveau) {
      return [];
    }
    return this.classesParNiveau[this.selectedNiveau] || [];
  }

  /**
   * Gérer le changement de niveau (réinitialiser la classe)
   */
  onNiveauChange() {
    this.selectedClasse = '';
    this.filterSubscriptions();
  }

  /**
   * Filtrer les abonnements selon la recherche, le statut, le niveau et la classe
   */
  filterSubscriptions() {
    this.filteredSubscriptions = this.subscriptions.filter((sub) => {
      // Filtre par recherche (nom du plan, description, etc.)
      const matchesSearch =
        (sub.plan?.toLowerCase().includes(this.searchText.toLowerCase()) ||
          sub.description
            ?.toLowerCase()
            .includes(this.searchText.toLowerCase())) ??
        true;

      // Filtre par statut
      const matchesStatus = this.selectedStatus
        ? sub.status === this.selectedStatus
        : true;

      // Filtre par niveau scolaire
      const matchesNiveau = this.selectedNiveau
        ? sub.niveauScolaire === this.selectedNiveau
        : true;

      // Filtre par classe
      const matchesClasse = this.selectedClasse
        ? sub.classe === this.selectedClasse
        : true;

      return matchesSearch && matchesStatus && matchesNiveau && matchesClasse;
    });
  }

  /**
   * Voir les détails d'un abonnement
   */
  viewDetails(subscription: any) {
    console.log('Voir détails:', subscription);
    // À implémenter : afficher un modal ou rediriger vers une page de détails
    // this.modalController.create({
    //   component: SubscriptionDetailComponent,
    //   componentProps: { subscription }
    // }).then(modal => modal.present());
  }

  /**
   * Gérer l'abonnement (renouveler, annuler, etc.)
   */
  manageSubscription(subscription: any) {
    console.log('Gérer abonnement:', subscription);
    // À implémenter : afficher un modal de gestion
    // Options possibles :
    // - Renouveler l'abonnement
    // - Annuler l'abonnement
    // - Voir les détails de paiement
    // - Changer le plan
  }

  /**
   * Supprimer/annuler un abonnement
   */
  cancelSubscription(subscription: any) {
    if (confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
      console.log('Annuler abonnement:', subscription);
      // À implémenter : appel API pour annuler
      // this.subscriptionService.cancelSubscription(subscription.id).subscribe({
      //   next: () => {
      //     this.loadSubscriptions();
      //   },
      //   error: (err) => {
      //     console.error('Erreur:', err);
      //   }
      // });
    }
  }

  /**
   * Aller à la page des cours
   */
  goToCourses() {
    this.router.navigate(['/courses']);
  }
}
