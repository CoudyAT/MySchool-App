import { Component, OnInit } from '@angular/core';
import {
  IonicModule,
  PopoverController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { ReferralService } from '../services/referral.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ProfileMenuComponent implements OnInit {
  currentUser: any;
  referralLink: string | null = null;
  shareText: string = '';
  isReferralVisible = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private referralService: ReferralService
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      this.currentUser = JSON.parse(localUser);
    }
  }

  async modifyProfile() {
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/edit-profile']);
  }

  async changeProfilePicture() {
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/edit-profile']);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Déconnexion',
          handler: async () => {
            await signOut(this.auth);

            localStorage.clear();

            const toast = await this.toastCtrl.create({
              message: 'Déconnexion réussie ✅',
              duration: 2000,
            });

            await toast.present();

            await this.popoverCtrl.dismiss();
            this.router.navigate(['/login'], { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }

  async inviteFriends() {
    try {
      const loadingToast = await this.toastCtrl.create({
        message: 'Génération du lien de parrainage...',
        duration: 1500,
      });
      await loadingToast.present();

      const response = await this.referralService.generateReferralLink();

      if (!response?.success || !response?.data) {
        throw new Error('Réponse API invalide');
      }

      const { shareText, webLink } = response.data;

      this.referralLink = webLink;
      this.shareText = shareText;
      this.isReferralVisible = true;
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Impossible de générer le lien ❌',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async copyReferralLink() {
    if (!this.referralLink) return;

    await navigator.clipboard.writeText(this.referralLink);

    const toast = await this.toastCtrl.create({
      message: 'Lien copié 📋',
      duration: 1500,
      color: 'success',
    });
    await toast.present();
  }

  async shareReferralLink() {
    if (!this.shareText || !this.referralLink) return;

    const message = `${this.shareText}\n\n🔗 ${this.referralLink}`;

    if ((navigator as any).share) {
      await (navigator as any).share({
        title: '🎓 Invitation MySchool',
        text: message,
      });
    } else {
      await navigator.clipboard.writeText(message);

      const toast = await this.toastCtrl.create({
        message: 'Message copié 📋',
        duration: 1500,
        color: 'success',
      });
      await toast.present();
    }
  }

  // Méthode pour fermer le bloc parrainage
  closeReferralBox() {
    // Option 1: Masquer directement
    //  this.isReferralVisible = false;

    // Option 2: Animation avant de masquer
    const referralBox = document.querySelector('.referral-box');
    if (referralBox) {
      referralBox.classList.add('closing');
      setTimeout(() => {
        this.isReferralVisible = false;
      }, 300);
    }
  }

  // Option: Méthode pour afficher à nouveau
  showReferralBox() {
    this.isReferralVisible = true;
  }

  openPaymentOptions() {
    this.router.navigate(['/payments-history']);
  }

  openAbonnement() {
    this.router.navigate(['/abonnement']);
  }

}
