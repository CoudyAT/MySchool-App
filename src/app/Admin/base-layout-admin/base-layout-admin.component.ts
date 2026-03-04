import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { signOut } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { ToastController, AlertController } from '@ionic/angular';


@Component({
  selector: 'app-base-layout-admin',
  templateUrl: './base-layout-admin.component.html',
  styleUrls: ['./base-layout-admin.component.scss'],
  standalone: true,
  imports: [RouterOutlet, CommonModule],
})
export class BaseLayoutAdminComponent {
  activePage = '';
  activeTab: string = 'dashboard';
  currentUser: any = null;
  showProfileMenu = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(
      localStorage.getItem('currentUser') || 'null',
    );
  }

  navigate(page: string) {
    // Map des pages vers les routes complètes
    const routeMap: { [key: string]: string } = {
      dashboard: '/admin-login/',
      users: '/admin-login/users',
      'list-cours': '/admin-login/list-cours',
      projects: '/admin-login/enrollments',
      faq: '/admin-login/faq',
      intructors: '/admin-login/instructors',
      chat: '/admin-login/chat',
      matiere: '/admin-login/matiere',
      referrals: '/admin-login/referrals',
      'code-promo': '/admin-login/code-promo',
    };

    this.activePage = page;

    const route = routeMap[page] || `/admin-login/${page}`;
    this.router.navigate([route]);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Déconnexion',
          role: 'confirm',
          handler: async () => {
            try {
              await signOut(this.auth);
              localStorage.removeItem('currentUser');
              const toast = await this.toastCtrl.create({
                message: 'Déconnexion réussie ✅',
                duration: 2000,
                color: 'success',
              });
              await toast.present();
              this.router.navigate(['/login-admin'], { replaceUrl: true });
            } catch (error) {
              console.error('Erreur de déconnexion :', error);
              const toast = await this.toastCtrl.create({
                message: 'Erreur lors de la déconnexion ❌',
                duration: 2000,
                color: 'danger',
              });
              await toast.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async updatePassword() {
    this.router.navigate(['/admin-login/update-password']);
  }
}
