import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { signOut } from 'firebase/auth';
import { ToastController, AlertController } from '@ionic/angular';
import { IonToggle } from '@ionic/angular/standalone';
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
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonButtons,
    CommonModule,
    FormsModule,

  ],
})
export class ProfilePage implements OnInit {
  currentUser: any = null;
  isDarkMode = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    // private darkModeService: DarkModeService
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

  async ngOnInit() {
    await this.loadUserData();
    // this.isDarkMode = this.darkModeService.getDarkModeStatus();
  }

  async loadUserData() {
    try {
      const localUser = JSON.parse(
        localStorage.getItem('currentUser') || 'null'
      );
      if (localUser && localUser.uid) {
        // Charger d'abord depuis localStorage
        this.currentUser = localUser;

        // Ensuite charger depuis Firestore pour avoir les données à jour
        await this.loadFromFirestore(localUser.uid);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  private async loadFromFirestore(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'utilisateur', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // console.log('📄 Données Firestore chargées:', userData);

        // Fusionner avec les données existantes
        if (userData?.['firstName'])
          this.currentUser.firstName = userData['firstName'];
        if (userData?.['lastName'])
          this.currentUser.lastName = userData['lastName'];
        if (userData?.['phone']) this.currentUser.phone = userData['phone'];
        if (userData?.['email']) this.currentUser.email = userData['email'];

        // Gérer l'image - priorité à profileImageBase64
        if (userData?.['profileImageBase64']) {
          this.currentUser.photoURL = userData['profileImageBase64'];
        } else if (userData?.['photoURL']) {
          this.currentUser.photoURL = userData['photoURL'];
        }

        // Mettre à jour localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
    } catch (error) {
      console.error('Erreur lors du chargement Firestore:', error);
    }
  }

  getProfileImage(): string {
    // Retourne l'URL de l'image ou null si pas d'image
    return this.currentUser?.photoURL || null;
  }

  getInitials(): string {
    const firstName = this.currentUser?.firstName || '';
    const lastName = this.currentUser?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'A';
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  modifyProfile() {
    this.router.navigate(['/edit-profile']);
  }

  openPaymentOptions() {
    console.log('Options de paiement');
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  openSecurity() {
    console.log('Sécurité');
  }

  openLanguage() {
    console.log('Langue');
  }

  // async toggleDarkMode() {
  //   const newMode = this.darkModeService.toggleDarkMode();
  //   this.isDarkMode = newMode;

  //   const toast = await this.toastCtrl.create({
  //     message: newMode ? '🌙 Mode sombre activé' : '☀️ Mode clair activé',
  //     duration: 2000,
  //     position: 'bottom',
  //     color: newMode ? 'dark' : 'light',
  //   });
  //   await toast.present();
  // }

  openTerms() {
    this.router.navigate(['/terms']);
  }

  openHelp() {
    this.router.navigate(['/help-center']);
  }

  inviteFriends() {
    console.log('Parrainer des amis');
  }

  // async logout() {
  //   const alert = await this.alertCtrl.create({
  //     header: 'Déconnexion',
  //     message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
  //     buttons: [
  //       {
  //         text: 'Annuler',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Déconnexion',
  //         role: 'confirm',
  //         handler: async () => {
  //           try {
  //             await signOut(this.auth);
  //             const toast = await this.toastCtrl.create({
  //               message: 'Déconnexion réussie ✅',
  //               duration: 2000,
  //               color: 'success',
  //             });
  //             await toast.present();
  //             this.router.navigate(['/signup'], { replaceUrl: true });
  //           } catch (error) {
  //             console.error('Erreur de déconnexion :', error);
  //             const toast = await this.toastCtrl.create({
  //               message: 'Erreur lors de la déconnexion ❌',
  //               duration: 2000,
  //               color: 'danger',
  //             });
  //             await toast.present();
  //           }
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }

  async changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          const toast = await this.toastCtrl.create({
            message: 'Veuillez sélectionner une image valide',
            duration: 2000,
            color: 'warning',
          });
          await toast.present();
          return;
        }

        // Rediriger vers la page d'édition
        this.router.navigate(['/edit-profile']);
      }
    };

    input.click();
  }

  async ionViewWillEnter() {
    console.log('🔄 Rechargement automatique du profil');
    await this.loadUserData();
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
              // 1. Déconnecter de Firebase
              await signOut(this.auth);

              // 2. Nettoyer le localStorage
              localStorage.removeItem('currentUser');
              localStorage.removeItem('userPhone');

              // 3. Vider toutes les données du localStorage si nécessaire
              // localStorage.clear(); // Optionnel

              // 4. Rediriger vers la page de connexion
              const toast = await this.toastCtrl.create({
                message: 'Déconnexion réussie ✅',
                duration: 2000,
                color: 'success',
              });
              await toast.present();

              // 5. Forcer la navigation avec replaceUrl: true
              this.router
                .navigate(['/signup'], { replaceUrl: true })
                .then(() => {
                  // 6. Forcer un rechargement complet si nécessaire
                  // window.location.reload(); // Optionnel si problèmes persistants
                });
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
}



