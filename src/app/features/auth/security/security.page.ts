import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonItem,
  IonInput,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ToastController, LoadingController } from '@ionic/angular';

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
  lockClosedOutline,
  eyeOffOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  keyOutline,
  checkmarkDoneOutline,
  lockOpenOutline,
  bulbOutline,
  closeOutline,
  checkmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonItem,
    IonInput,
    IonSpinner,
  ],
})
export class SecurityPage {
  private firestore = inject(Firestore);

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  isSaving = false;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) {
    addIcons({
      chevronBackOutline,
      lockClosedOutline,
      shieldCheckmarkOutline,
      keyOutline,
      checkmarkDoneOutline,
      lockOpenOutline,
      bulbOutline,
      closeOutline,
      checkmarkOutline,
      cameraOutline,
      personOutline,
      cardOutline,
      notificationsOutline,
      languageOutline,
      eyeOutline,
      eyeOffOutline,
      documentTextOutline,
      helpCircleOutline,
      peopleOutline,
      logOutOutline,
      chevronForwardOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }

  passwordsMismatch(): boolean {
    return (
      this.newPassword !== this.confirmPassword &&
      this.confirmPassword.length > 0
    );
  }

  canChangePassword(): boolean {
    return (
      !!this.oldPassword &&
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  async changePassword() {
    if (!this.canChangePassword()) return;

    this.isSaving = true;
    const loading = await this.loadingCtrl.create({
      message: 'Modification du mot de passe...',
    });
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!user?.uid) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérification ancien mot de passe
      if (this.oldPassword !== user.password) {
        throw new Error('Ancien mot de passe incorrect');
      }

      const userRef = doc(this.firestore, 'utilisateur', user.uid);

      await updateDoc(userRef, {
        password: this.newPassword,
        updatedAt: new Date(),
      });

      // Mise à jour localStorage
      user.password = this.newPassword;
      localStorage.setItem('currentUser', JSON.stringify(user));

      await loading.dismiss();
      this.isSaving = false;

      this.showToast('Mot de passe modifié avec succès 🔐', 'success');
      this.router.navigate(['/profile']);
    } catch (error: any) {
      await loading.dismiss();
      this.isSaving = false;
      this.showToast(
        error.message || 'Erreur lors de la modification ❌',
        'danger',
      );
    }
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: color as any,
    });
    await toast.present();
  }
}
