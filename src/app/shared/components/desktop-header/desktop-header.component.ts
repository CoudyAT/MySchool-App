import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonIcon, IonButton } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular/standalone'; 
import { ToastController } from '@ionic/angular';
import { PreminumModalComponent } from 'src/app/features/component/preminum-modal/preminum-modal.component';
import { NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopoverController } from '@ionic/angular';
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
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
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

  updatePremiumBar(url: string) {
    console.log('Route actuelle:', url); // DEBUG

    // Afficher UNIQUEMENT sur /courses
    this.showPremiumBar = url === '/courses';
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async openPremiumModal() {
    const modal = await this.modalCtrl.create({
      component: PreminumModalComponent,
      cssClass: 'premium-modal',
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.subscribed) {
      // L'utilisateur a souscrit
      const toast = await this.toastCtrl.create({
        message: 'Bienvenue dans Premium ! 🌟',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    }
  }

  navigateTo(page: string) {
    if (page !== this.activePage) {
      // Mappage des routes
      const routes: { [key: string]: string } = {
        home: '/courses', // Accueil → CoursesPage
        courses: '/mes-cours', // Cours → MesCoursPage
        message: '/message', // Messages → Page messages
        achievements: '/achievements', // Réussites → Page réussites
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
}
