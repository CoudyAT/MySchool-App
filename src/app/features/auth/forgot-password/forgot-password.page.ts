import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  phonePortraitOutline,
  lockClosedOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
  ],
})
export class ForgotPasswordPage {
  step = 0;
  generatedCode = '';
  userDocRef: any;
  maskedPhone = ''; // Ex: "*** *** **123"

  phoneForm = this.fb.group({
    phone: ['', Validators.required],
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4)]],
  });

  passwordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private toast: ToastController,
    private router: Router
  ) {
    addIcons({
      phonePortraitOutline,
      lockClosedOutline,
      checkmarkCircleOutline,
    });
  }

  async sendCode() {
    const phone = this.phoneForm.value.phone!;
    const usersRef = collection(this.firestore, 'utilisateur');

    const q = query(usersRef, where('phone', '==', phone));
    const snap = await getDocs(q);

    if (snap.empty) {
      return this.showToast('Aucun compte trouvé avec ce numéro', 'danger');
    }

    this.userDocRef = snap.docs[0].ref;

    // 🎭 Masquer le numéro (garder les 3 derniers chiffres)
    this.maskedPhone = this.maskPhone(phone);

    // 🔐 Génération code OTP
    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('CODE OTP:', this.generatedCode); // SMS plus tard

    this.step = 1;
    this.showToast('Code envoyé par SMS', 'success');
  }

  maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const last3 = cleaned.slice(-3);
    const masked = '*** *** **' + last3;
    return masked;
  }

  verifyCode(): void {
    if (this.codeForm.value.code !== this.generatedCode) {
      this.showToast('Code incorrect', 'danger');
      return;
    }

    this.step = 2;
    this.showToast('Code vérifié avec succès', 'success');
  }

  passwordsMismatch(): boolean {
    return (
      this.passwordForm.value.password !==
      this.passwordForm.value.confirmPassword
    );
  }

  async resetPassword() {
    await updateDoc(this.userDocRef, {
      password: this.passwordForm.value.password,
    });

    this.showToast('Mot de passe réinitialisé avec succès', 'success');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

  async showToast(message: string, color: any) {
    const t = await this.toast.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await t.present();
  }
}
