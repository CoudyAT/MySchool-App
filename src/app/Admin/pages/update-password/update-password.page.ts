import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from 'src/app/features/auth/services/user.service';
import { ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonNote, IonToast, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.page.html',
  styleUrls: ['./update-password.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonNote, IonToast, IonBackButton, IonButtons, FormsModule]
})
export class UpdatePasswordPage implements OnInit {

  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);
  private fb = inject(FormBuilder);

  pwdForm: FormGroup;
  loading = false;
  toastVisible = false;
  toastMsg = '';
  toastColor: 'success' | 'danger' = 'success';

  currentUserId: string | null = null;

  constructor() {
    this.pwdForm = this.fb.group({
      currentPwd: ['', [Validators.required]],
      newPwd: ['', [Validators.required, Validators.minLength(6)]],
      confirmPwd: ['', Validators.required]
    }, { validators: this.matchPasswords });
  }

  ngOnInit() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      this.currentUserId = user.id;
    }
  }

  matchPasswords(group: FormGroup) {
    const newP = group.get('newPwd')?.value;
    const confirm = group.get('confirmPwd')?.value;
    return newP === confirm ? null : { mismatch: true };
  }

  async changePassword() {
    if (this.pwdForm.invalid || !this.currentUserId) {
      this.showToast('Formulaire invalide ou utilisateur non identifié', 'danger');
      return;
    }

    this.loading = true;

    const { currentPwd, newPwd } = this.pwdForm.value;

    try {
      await firstValueFrom(
        this.userService.updateUser(this.currentUserId, { password: newPwd })
      );

      this.showToast('Mot de passe modifié avec succès !', 'success');
      this.pwdForm.reset();
    } catch (err: any) {
      const msg = err.message?.includes('incorrect')
        ? 'Mot de passe actuel incorrect'
        : 'Erreur lors de la modification';
      this.showToast(msg, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    this.toastMsg = message;
    this.toastColor = color;
    this.toastVisible = true;
  }

}
