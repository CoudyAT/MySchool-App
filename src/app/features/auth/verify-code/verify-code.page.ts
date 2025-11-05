import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { getAuth, ConfirmationResult } from 'firebase/auth';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  templateUrl: './verify-code.page.html',
  styleUrls: ['./verify-code.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VerifyCodePage {
  @ViewChildren('codeInput') codeInputElements!: QueryList<ElementRef>;

  codeForm: FormGroup;
  loading = false;
  confirmationResult!: ConfirmationResult;
  phoneNumber: string | null = null;

  // Tableau pour les 6 champs de code
  codeInputs = Array(6)
    .fill(null)
    .map(() => ({ value: '' }));

  // Timer pour le renvoi du code
  resendTimer = 0;
  private timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth
  ) {
    // Initialiser les icônes Ionic
    addIcons({ mailOutline });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    const storedResult = window.localStorage.getItem('confirmationResult');
    this.phoneNumber = window.localStorage.getItem('userPhone');

    if (storedResult) {
      this.confirmationResult = JSON.parse(storedResult);
    } else {
      alert('Session expirée. Veuillez recommencer.');
      this.router.navigate(['/phone-login']);
    }

    // Démarrer le timer de renvoi
    this.startResendTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Gère la saisie dans un champ de code
   */
  onCodeInput(event: any, index: number) {
    const input = event.target;
    let value = input.value;

    // Ne garder que le dernier caractère saisi (au cas où plusieurs caractères)
    if (value.length > 1) {
      value = value.slice(-1);
      input.value = value;
      this.codeInputs[index].value = value;
    }

    // Si un chiffre a été saisi et qu'on n'est pas au dernier champ
    if (value && index < 5) {
      const nextInput = input.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Mettre à jour le formControl avec le code complet
    this.updateCodeForm();

    // Si les 6 chiffres sont remplis, valider automatiquement
    if (this.isCodeComplete()) {
      setTimeout(() => this.verifyCode(), 300);
    }
  }

  /**
   * Gère les touches spéciales (Backspace, flèches)
   */
  onKeyDown(event: any, index: number) {
    const input = event.target;

    // Si Backspace et le champ est vide, revenir au champ précédent
    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        const prevInput = input.previousElementSibling;
        if (prevInput) {
          prevInput.focus();
          // Optionnel : vider le champ précédent
          this.codeInputs[index - 1].value = '';
          this.updateCodeForm();
        }
      }
    }

    // Flèche gauche : aller au champ précédent
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = input.previousElementSibling;
      if (prevInput) prevInput.focus();
    }

    // Flèche droite : aller au champ suivant
    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = input.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
  }

  /**
   * Gère le collage d'un code complet
   */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';

    // Ne garder que les chiffres
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    // Remplir les champs avec les chiffres
    digits.split('').forEach((digit, index) => {
      if (index < 6) {
        this.codeInputs[index].value = digit;
      }
    });

    // Mettre à jour le formulaire
    this.updateCodeForm();

    // Focus sur le dernier champ rempli ou le premier vide
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    setTimeout(() => {
      const inputs = this.codeInputElements.toArray();
      if (inputs[lastFilledIndex]) {
        inputs[lastFilledIndex].nativeElement.focus();
      }
    }, 0);

    // Si le code est complet, valider automatiquement
    if (digits.length === 6) {
      setTimeout(() => this.verifyCode(), 300);
    }
  }

  /**
   * Met à jour le FormControl avec le code complet
   */
  updateCodeForm() {
    const code = this.codeInputs.map((input) => input.value).join('');
    this.codeForm.patchValue({ code });
  }

  /**
   * Vérifie si les 6 chiffres sont remplis
   */
  isCodeComplete(): boolean {
    return this.codeInputs.every((input) => input.value !== '');
  }

  /**
   * Valide le code de vérification
   */
  async verifyCode() {
    if (!this.codeForm.valid) {
      return;
    }

    const code = this.codeForm.value.code;
    this.loading = true;

    try {
      const result = await this.confirmationResult.confirm(code);
      console.log('✅ Utilisateur connecté :', result.user);

      // Nettoyer le localStorage
      window.localStorage.removeItem('confirmationResult');
      window.localStorage.removeItem('userPhone');

      this.router.navigate(['/courses'], { replaceUrl: true });
    } catch (error: any) {
      console.error('❌ Erreur de vérification:', error);

      // Afficher l'erreur
      alert('Code invalide ou expiré. Veuillez réessayer.');

      // Vider les champs et refocus sur le premier
      this.resetCodeInputs();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Réinitialise tous les champs de code
   */
  resetCodeInputs() {
    this.codeInputs.forEach((input) => (input.value = ''));
    this.codeForm.reset();

    // Focus sur le premier champ
    setTimeout(() => {
      const inputs = this.codeInputElements.toArray();
      if (inputs[0]) {
        inputs[0].nativeElement.focus();
      }
    }, 0);
  }

  /**
   * Démarre le timer pour le renvoi du code
   */
  startResendTimer() {
    this.resendTimer = 60; // 60 secondes

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  /**
   * Renvoie le code de vérification
   */
  async resendCode() {
    if (this.resendTimer > 0) {
      return;
    }

    try {
      // Récupérer le numéro et renvoyer le code
      // Note: Il faudra réimplémenter l'envoi du SMS
      // car Firebase ne conserve pas le confirmationResult

      alert('Un nouveau code a été envoyé par SMS');
      this.startResendTimer();
      this.resetCodeInputs();

      // TODO: Implémenter la logique de renvoi du code
      // Vous devrez probablement retourner à la page de login
      // ou réimplémenter signInWithPhoneNumber ici
    } catch (error) {
      console.error('Erreur lors du renvoi:', error);
      alert('Erreur lors du renvoi du code. Veuillez réessayer.');
    }
  }

  /**
   * Retourne le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.codeForm.get(fieldName);
    if (field?.errors?.['required']) return 'Code requis';
    if (field?.errors?.['minlength']) return 'Le code doit contenir 6 chiffres';
    return '';
  }

  /**
   * Vérifie si un champ est invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.codeForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }
}
