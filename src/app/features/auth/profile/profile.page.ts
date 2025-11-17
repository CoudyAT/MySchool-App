import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { ToastController, AlertController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonAvatar,
  IonList,
  IonBackButton,
  IonButtons,
  IonTitle,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  personOutline,
  cardOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  languageOutline,
  eyeOutline,
  documentTextOutline,
  helpCircleOutline,
  peopleOutline,
  logOutOutline,
  cameraOutline,
  chevronForwardOutline,
  chevronBackOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
   // IonTitle,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
   // IonAvatar,
    IonList,
   // IonBackButton,
    IonButtons,
    CommonModule,
    FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  currentUser: any = null;

  constructor(
    private router: Router,
    private auth: Auth,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      personOutline,
      cardOutline,
      notificationsOutline,
      shieldCheckmarkOutline,
      languageOutline,
      eyeOutline,
      documentTextOutline,
      helpCircleOutline,
      peopleOutline,
      logOutOutline,
      cameraOutline,
      chevronForwardOutline,
      chevronBackOutline,
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (localUser) {
      this.currentUser = localUser;
    }
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  modifyProfile() {
    // Navigation vers page de modification du profil
    console.log('Modifier le profil');
  }

  openPaymentOptions() {
    // Navigation vers options de paiement
    console.log('Options de paiement');
  }

  openNotifications() {
    // Navigation vers notifications
    console.log('Notifications');
  }

  openSecurity() {
    // Navigation vers sécurité
    console.log('Sécurité');
  }

  openLanguage() {
    // Navigation vers choix de langue
    console.log('Langue');
  }

  toggleDarkMode() {
    // Toggle du mode sombre
    console.log('Mode sombre');
  }

  openTerms() {
    // Navigation vers conditions d'utilisation
    console.log("Conditions d'utilisation");
  }

  openHelp() {
    // Navigation vers centre d'aide
    console.log("Centre d'aide");
  }

  inviteFriends() {
    // Fonction pour parrainer des amis
    console.log('Parrainer des amis');
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Déconnexion',
          role: 'confirm',
          handler: async () => {
            try {
              await signOut(this.auth);
              const toast = await this.toastCtrl.create({
                message: 'Déconnexion réussie ✅',
                duration: 2000,
                color: 'success',
              });
              await toast.present();
              this.router.navigate(['/signup'], { replaceUrl: true });
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

  changeProfilePicture() {
    // Fonction pour changer la photo de profil
    console.log('Changer la photo de profil');
  }
}
