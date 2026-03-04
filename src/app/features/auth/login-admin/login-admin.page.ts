import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
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

function emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s\-().]{8,15}$/;
  if (emailRegex.test(value) || phoneRegex.test(value)) return null;
  return { invalidLoginFormat: true };
}

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
  isPhone = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private toastCtrl: ToastController,
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, emailOrPhoneValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  detectInputType(event: any) {
    const value = event.detail.value || '';
    const phoneRegex = /^\+?[\d\s\-().]{3,}$/;
    this.isPhone = phoneRegex.test(value) && !value.includes('@');
  }

  private buildFakeEmail(phone: string): string {
    const clean = phone.replace(/\s+/g, '').replace('+', '');
    return `${clean}@myschool.app`;
  }


  // 🔐 LOGIN
  async login() {
    if (this.loginForm.invalid) return;
    this.loading = true;

    const { login, password } = this.loginForm.value;

    try {
      let emailToUse: string;

      if (this.isPhone) {
        const usersRef = collection(this.firestore, 'utilisateur');
        const q = query(usersRef, where('phone', '==', login.replace(/\s+/g, '')));
        const snap = await getDocs(q);

        if (snap.empty) throw new Error('Utilisateur introuvable');

        const userData = snap.docs[0].data();
        if (userData?.['role']?.['libelle'] !== 'admin') throw new Error('Accès refusé');

        // Reconstruction du faux email 👇
        emailToUse = userData['email'] ?? this.buildFakeEmail(login);

        await signInWithEmailAndPassword(this.auth, emailToUse, password);

        localStorage.setItem('currentUser', JSON.stringify({ ...userData, id: snap.docs[0].id }));

      } else {
        // Connexion classique par email
        await signInWithEmailAndPassword(this.auth, login, password);

        const usersRef = collection(this.firestore, 'utilisateur');
        const q = query(usersRef, where('login', '==', login));
        const snap = await getDocs(q);

        if (snap.empty) throw new Error('Utilisateur introuvable');

        const userData = snap.docs[0].data();
        if (userData?.['role']?.['libelle'] !== 'admin') throw new Error('Accès refusé');

        localStorage.setItem('currentUser', JSON.stringify({ ...userData, id: snap.docs[0].id }));
      }

      await this.showToast('Connexion réussie', 'success');
      this.router.navigate(['/admin-login/users'], { replaceUrl: true });

    } catch (err: any) {
      console.error(err);
      const map: Record<string, string> = {
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/user-not-found': 'Aucun compte trouvé',
        'auth/invalid-credential': 'Identifiants incorrects',
        'Accès refusé': "Vous n'êtes pas administrateur",
        'Utilisateur introuvable': 'Aucun admin avec ces identifiants',
      };
      await this.showToast(map[err.code] ?? map[err.message] ?? 'Erreur de connexion', 'danger');
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
