import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonHeader, IonToolbar, IonIcon, IonButton, ModalController } from "@ionic/angular/standalone";
import { ToastController, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ProfileMenuComponent } from 'src/app/features/auth/profile-menu/profile-menu.component';



@Component({
  selector: 'app-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonToolbar, IonHeader],
})
export class DesktopHeaderComponent implements OnInit {
  @Input() activePage: string | undefined;
  showPremiumBar: boolean = false;
  userClasse: string = '';
  userNiveauScolaire: string = '';

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
    // Charger les données utilisateur
    this.loadUserData();

    // Vérifie la route au chargement
    // Cas 1 : au chargement de la page
    this.updatePremiumBar(this.router.url);

    // Cas 2 : quand on navigue
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updatePremiumBar(event.urlAfterRedirects);
      }
    });
  }

  loadUserData() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (localUser) {
      this.userClasse = localUser.classe || '';
      this.userNiveauScolaire = localUser.niveauScolaire || '';
    }
  }

  get subscriptionButtonText(): string {
    if (this.userNiveauScolaire === 'ELEMENTAIRE' && this.userClasse) {
      return `Souscrire à l'abonnement ${this.userClasse}`;
    }
    if (['MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'].includes(this.userNiveauScolaire) && this.userClasse) {
      return `Souscrire à l'abonnement ${this.userClasse}`;
    }
    return "Souscrire à l'abonnement";
  }

  updatePremiumBar(url: string) {
    console.log('Route actuelle:', url); // DEBUG

    // Afficher UNIQUEMENT sur /courses
    this.showPremiumBar = url === '/courses';
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async openPremiumModal() {
    // Récupérer les données utilisateur
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Cas ÉLÉMENTAIRE → redirection directe vers payment-method (abonnement classe)
    if (localUser?.niveauScolaire === 'ELEMENTAIRE') {
      this.router.navigate(['/payment-method'], {
        state: {
          isPremiumFlow: true,
          method: 'premium',
          plan: {
            type: 'ANNUAL',
            name: `Abonnement ${localUser.classe}`,
            price: 5000,
            currency: 'XOF',
          },
          isClasseSubscription: true,
          classe: localUser.classe,
          niveauScolaire: localUser.niveauScolaire,
          userInfo: {
            classe: localUser.classe,
            niveau: localUser.niveauScolaire,
          },
        },
      });
      return;
    }

    // Autres niveaux → sélection des cours premium
    this.router.navigate(['/premium-course-selection'], {
      state: {
        isPremiumFlow: true,
      },
    });
  }

  navigateTo(page: string) {
    if (page !== this.activePage) {
      // Mappage des routes
      const routes: { [key: string]: string } = {
        home: '/courses', // Accueil → CoursesPage
        courses: '/mes-cours', // Cours → MesCoursPage
        message: '/message', // Messages → Page messages
        achievements: '/achievements', // Réussites → Page réussites
        videos: '/video-page', // Videos → Page videos
      };

      const route = routes[page];
      if (route) {
        this.router.navigate([route]);
      }
    }
  }

  async openProfileMenu(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();

    // Mobile → page profil
    if (window.innerWidth < 1024) {
      this.goToProfile();
      return;
    }

    const popover = await this.popoverCtrl.create({
      component: ProfileMenuComponent,
      event: ev,
      side: 'bottom',
      alignment: 'end',
      translucent: true,
      showBackdrop: true,
      cssClass: 'profile-popover',
    });

    await popover.present();
  }

  openHelp() {
    this.router.navigate(['/help-center']);
  }
}
