import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { Router } from '@angular/router';

import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

import {
  IonContent,
  IonInput,
  IonButton,
  ToastController,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.page.html',
  styleUrls: ['./login-admin.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
  ],
})
export class LoginAdminPage {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private toastCtrl: ToastController,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // 🔐 LOGIN
  async login() {
    if (this.loginForm.invalid) return;
    this.loading = true;

    const { email, password } = this.loginForm.value;
    try {
      // Firebase Auth
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      // Vérifier rôle admin dans Firestore
      const usersRef = collection(this.firestore, 'utilisateur');

      const q = query(usersRef, where('login', '==', this.loginForm.value.email));
      const snap = await getDocs(q);

      if (snap.empty) {
        throw new Error('Utilisateur introuvable');
      }

      const userData = snap.docs[0].data();

      if (userData?.['role']?.['libelle'] !== 'admin') {
        throw new Error('Accès refusé');
      }

      // Sauvegarde locale
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          ...userData,
          id: snap.docs[0].id,
        }),
      );

      await this.showToast('Connexion réussie', 'success');

      // Redirection ADMIN
      this.router.navigate(['/admin-login/users'], { replaceUrl: true });
    } catch (err: any) {
      console.error(err);

      let message = 'Erreur de connexion';

      if (err.code === 'auth/wrong-password') {
        message = 'Mot de passe incorrect';
      }

      if (err.message === 'Accès refusé') {
        message = 'Vous n’êtes pas administrateur';
      }

      await this.showToast(message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  // 🔔 TOAST
  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary',
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    toast.present();
  }
}
