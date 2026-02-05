import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import {
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInAnonymously,
} from '@angular/fire/auth';
import {
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonProgressBar,
  ToastController,
  IonCheckbox,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBack,
  callOutline,
  sendOutline,
  checkmarkOutline,
  pencilOutline,
  keyOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonIcon,
    IonProgressBar,
    IonCheckbox,
    IonLabel,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLIonInputElement>;
  @ViewChild('otpInput') otpInput!: ElementRef<HTMLIonInputElement>;

  phoneForm: FormGroup;
  otpForm: FormGroup;
  otpSent = false;
  loading = false;
  verifying = false;
  otpError = '';
  displayedPhone = '';
  countdown = 0;
  countdownInterval: any;
  showOtpText = false;
  autoVerify = true; // Vérification automatique par défaut

  recaptchaVerifier!: RecaptchaVerifier;
  confirmationResult!: ConfirmationResult;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: Auth,
    private firestore: Firestore,
    private toastCtrl: ToastController,
  ) {
    addIcons({
      chevronBack,
      callOutline,
      sendOutline,
      checkmarkOutline,
      pencilOutline,
      keyOutline,
      eyeOutline,
      eyeOffOutline,
    });

    // Initialiser avec +221 par défaut
    this.phoneForm = this.fb.group({
      phone: [
        '+221',
        [Validators.required, Validators.pattern(/^\+\d{6,15}$/)],
      ],
    });

    // Formulaire OTP SIMPLIFIÉ - un seul champ
    this.otpForm = this.fb.group({
      otpCode: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });
  }

  ngOnInit() {
    // Vérifier si un numéro est passé en paramètre
    this.route.queryParams.subscribe((params) => {
      if (params['phone']) {
        const phone = this.normalizePhone(params['phone']);
        this.phoneForm.patchValue({ phone });
      }
    });

    // Initialiser reCAPTCHA
    this.initializeRecaptcha();

    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.router.navigate(['/courses'], { replaceUrl: true });
    }

    // Charger la préférence de vérification automatique
    const savedAutoVerify = localStorage.getItem('autoVerifyOtp');
    if (savedAutoVerify !== null) {
      this.autoVerify = savedAutoVerify === 'true';
    }
  }

  ngAfterViewInit() {
    // Mettre le focus sur le champ téléphone
    setTimeout(() => {
      if (this.phoneInput && !this.otpSent) {
        this.phoneInput.nativeElement.setFocus();
      }
    }, 300);
  }

  initializeRecaptcha() {
    setTimeout(() => {
      this.recaptchaVerifier = new RecaptchaVerifier(
        this.auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA résolu');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expiré');
          },
        },
      );
    }, 500);
  }

  // Normaliser le numéro de téléphone
  normalizePhone(phone: string): string {
    if (!phone) return '+221';

    // Si le numéro commence déjà par +, le garder
    if (phone.startsWith('+')) {
      return phone;
    }

    // Nettoyer les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('221')) {
      return '+' + cleaned;
    }

    if (cleaned.length === 9) {
      // Numéro Sénégal: 771234567 -> +221771234567
      return '+221' + cleaned;
    }

    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      // Numéro avec 0: 0771234567 -> +221771234567
      return '+221' + cleaned.substring(1);
    }

    // Par défaut, ajouter +221
    return '+221' + cleaned;
  }

  // Gestion de la saisie du téléphone
  onPhoneInput(event: any) {
    let value = event.target.value || '';

    // Si l'utilisateur supprime le +221, le remettre
    if (!value.startsWith('+221')) {
      // Ajouter +221 si absent
      if (value.startsWith('+')) {
        // Si c'est un autre code pays, le garder
        // Sinon, forcer +221
        if (value.length <= 4) {
          value = '+221';
        }
      } else {
        // Ajouter +221 devant
        const digits = value.replace(/\D/g, '');
        value = '+221' + digits;
      }

      // Mettre à jour le champ
      this.phoneForm.patchValue({ phone: value });

      // Déplacer le curseur à la fin
      setTimeout(() => {
        if (this.phoneInput) {
          const inputEl = this.phoneInput.nativeElement;
          inputEl.setFocus();
          // Positionner le curseur à la fin
          const input = inputEl.getInputElement();
          input.then((nativeInput: HTMLInputElement) => {
            nativeInput.setSelectionRange(value.length, value.length);
          });
        }
      }, 10);
    }
  }

  // Envoyer OTP
  async sendOtp() {
    // Vérifier que le formulaire est valide
    if (!this.phoneForm.valid) {
      await this.showToast('Veuillez entrer un numéro valide', 'warning');
      return;
    }

    const phone = this.phoneForm.value.phone;

    // Vérifier que le numéro est complet (9 chiffres après +221)
    const cleanPhone = this.formatPhoneForSearch(phone);
    if (cleanPhone.length !== 9) {
      await this.showToast('Le numéro doit contenir 9 chiffres', 'warning');
      return;
    }

    // Activer le loader
    this.loading = true;

    // Formater le numéro pour l'affichage
    this.displayedPhone = this.formatPhoneDisplay(phone);

    // Afficher un toast informatif
    await this.showToast(
      `Envoi du code à ${this.displayedPhone}...`,
      'primary',
    );

    try {
      // Envoyer le code OTP avec reCAPTCHA
      this.confirmationResult = await signInWithPhoneNumber(
        this.auth,
        phone,
        this.recaptchaVerifier,
      );

      // Succès
      this.otpSent = true;
      this.loading = false;

      // Démarrer le compte à rebours
      this.startCountdown();

      await this.showToast('Code envoyé par SMS avec succès', 'success');

      // Focus sur le champ OTP
      setTimeout(() => {
        if (this.otpInput) {
          this.otpInput.nativeElement.setFocus();
        }
      }, 300);
    } catch (error: any) {
      console.error('Erreur envoi OTP:', error);
      this.loading = false;

      // Gestion des erreurs spécifiques Firebase
      let errorMessage = "Erreur lors de l'envoi du code";

      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'Quota SMS dépassé. Veuillez contacter le support.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'Échec de vérification reCAPTCHA. Réessayez.';
      }

      await this.showToast(errorMessage, 'danger');
    }
  }

  // Gestion de la saisie OTP simplifiée
  onSingleOtpInput(event: any) {
    const input = event.target;
    let value = input.value || '';

    // Nettoyer : ne garder que les chiffres
    value = value.replace(/\D/g, '');

    // Limiter à 6 chiffres
    if (value.length > 6) {
      value = value.substring(0, 6);
    }

    // Mettre à jour la valeur du formulaire
    this.otpForm.patchValue({ otpCode: value });

    // Effacer les erreurs
    this.otpError = '';

    // Vérification automatique si activée
    if (this.autoVerify && value.length === 6) {
      // Petit délai pour laisser le temps à l'utilisateur de voir le code
      setTimeout(() => {
        this.verifyOtp();
      }, 500);
    }
  }

  onOtpKeyDown(event: KeyboardEvent) {
    // Permettre seulement les chiffres, backspace, delete, tab, flèches
    const allowedKeys = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];

    if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits) {
      this.otpForm.patchValue({ otpCode: digits });

      // Focus à la fin du texte
      setTimeout(() => {
        if (this.otpInput) {
          this.otpInput.nativeElement.setFocus();
          // Positionner le curseur à la fin
          const inputEl = this.otpInput.nativeElement;
          inputEl.getInputElement().then((nativeInput: HTMLInputElement) => {
            nativeInput.setSelectionRange(digits.length, digits.length);
          });
        }
      }, 10);

      // Effacer les erreurs
      this.otpError = '';

      // Vérification automatique si activée
      if (this.autoVerify && digits.length === 6) {
        setTimeout(() => {
          this.verifyOtp();
        }, 500);
      }
    }
  }

  validateOtpLength() {
    const otpValue = this.otpForm.get('otpCode')?.value || '';
    if (otpValue.length > 0 && otpValue.length < 6) {
      this.otpError = 'Le code doit contenir 6 chiffres';
    } else {
      this.otpError = '';
    }
  }

  toggleOtpVisibility() {
    this.showOtpText = !this.showOtpText;

    // Changer le type d'input
    setTimeout(() => {
      if (this.otpInput) {
        const inputEl = this.otpInput.nativeElement;
        inputEl.getInputElement().then((nativeInput: HTMLInputElement) => {
          nativeInput.type = this.showOtpText ? 'text' : 'password';
        });
      }
    }, 10);
  }

  onAutoVerifyChange() {
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('autoVerifyOtp', this.autoVerify.toString());

    if (this.autoVerify && this.isOtpComplete()) {
      // Si l'utilisateur active l'auto-verification et que le code est déjà complet
      setTimeout(() => {
        this.verifyOtp();
      }, 300);
    }
  }

  // Vérifier OTP
  async verifyOtp() {
    if (!this.isOtpComplete() || this.verifying) {
      return;
    }

    this.verifying = true;
    this.otpError = '';

    try {
      const otpCode = this.getOtpCode();
      const result = await this.confirmationResult.confirm(otpCode);
      const phone = result.user.phoneNumber;
      const cleanPhone = this.formatPhoneForSearch(phone || '');
      const userExists = await this.checkUserExists(cleanPhone);

      if (userExists) {
        await this.handleExistingUser(cleanPhone);
      } else {
        await this.handleNewUser(cleanPhone);
      }
    } catch (error: any) {
      console.error('Erreur vérification OTP:', error);

      if (error.code === 'auth/invalid-verification-code') {
        this.otpError = 'Code incorrect. Veuillez réessayer.';
      } else if (error.code === 'auth/code-expired') {
        this.otpError = 'Code expiré. Veuillez en demander un nouveau.';
      } else if (error.code === 'auth/credential-already-in-use') {
        this.otpError = 'Ce numéro est déjà associé à un autre compte.';
      } else {
        this.otpError = 'Erreur de vérification';
      }

      await this.showToast(this.otpError, 'danger');

      // Effacer le champ OTP en cas d'erreur
      this.otpForm.patchValue({ otpCode: '' });

      // Remettre le focus sur le champ OTP
      setTimeout(() => {
        if (this.otpInput) {
          this.otpInput.nativeElement.setFocus();
        }
      }, 100);
    } finally {
      this.verifying = false;
    }
  }

  // Vérifier si l'OTP est complet
  isOtpComplete(): boolean {
    const otpValue = this.otpForm.get('otpCode')?.value || '';
    return otpValue.length === 6 && /^\d+$/.test(otpValue);
  }

  // Récupérer le code OTP complet
  getOtpCode(): string {
    return this.otpForm.get('otpCode')?.value || '';
  }

  async handleExistingUser(phone: string) {
    try {
      const usersCollection = collection(this.firestore, 'utilisateur');
      const phoneQuery = query(usersCollection, where('phone', '==', phone));
      const snapshot = await getDocs(phoneQuery);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Stocker les données utilisateur
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            ...userData,
            id: userDoc.id,
          }),
        );
        localStorage.setItem('userPhone', phone);

        // Connexion Firebase anonyme si nécessaire
        if (!this.auth.currentUser) {
          await signInAnonymously(this.auth);
        }

        // Toast de bienvenue
        const firstName = userData['firstName'] || '';
        await this.showToast(
          firstName ? `Bienvenue ${firstName} !` : 'Connexion réussie !',
          'success',
        );

        // 🔹 Redirection selon le rôle
        const roleObj = userData['role'];
        const role = roleObj?.libelle?.toString().toLowerCase() || 'user';
        if (role.toLowerCase() === 'admin') {
          // Redirection vers l'admin
          setTimeout(() => {
            this.router.navigate(['/admin-login/users'], { replaceUrl: true });
          }, 500);
        } else {
          // Redirection utilisateur normal
          setTimeout(() => {
            this.router.navigate(['/courses'], { replaceUrl: true });
          }, 500);
        }
      } else {
        await this.showToast('Utilisateur non trouvé', 'danger');
      }
    } catch (error) {
      console.error('Erreur connexion utilisateur:', error);
      await this.showToast('Erreur lors de la connexion', 'danger');
      throw error;
    }
  }

  async handleNewUser(phone: string) {
    try {
      await this.showToast('Numéro vérifié avec succès', 'success');

      // Stocker temporairement le numéro pour l'inscription
      localStorage.setItem('pendingPhone', phone);
      localStorage.setItem('verifiedPhone', phone);

      // Rediriger vers le flux d'inscription
      console.log('Redirection vers signup-flow avec phone:', phone);

      // Ajouter un petit délai pour s'assurer que le toast s'affiche
      setTimeout(() => {
        this.router
          .navigate(['/signup'], {
            queryParams: { phone },
            state: {
              verified: true,
              phoneNumber: phone,
            },
            replaceUrl: true,
          })
          .then(() => {
            console.log('Navigation vers signup-flow réussie');
          })
          .catch((err) => {
            console.error('Erreur navigation signup:', err);
            // Fallback
            window.location.href = `/signup?phone=${phone}`;
          });
      }, 800);
    } catch (error) {
      console.error('Erreur redirection inscription:', error);
      await this.showToast('Erreur lors de la redirection', 'danger');
    }
  }

  async checkUserExists(phone: string): Promise<boolean> {
    try {
      console.log('Vérification utilisateur pour le numéro:', phone);

      const usersCollection = collection(this.firestore, 'utilisateur');
      const phoneQuery = query(usersCollection, where('phone', '==', phone));
      const snapshot = await getDocs(phoneQuery);

      const exists = !snapshot.empty;
      console.log('Utilisateur existe?', exists);

      return exists;
    } catch (error) {
      console.error('Erreur vérification utilisateur:', error);
      return false;
    }
  }

  // Méthode utilitaire pour réinitialiser les champs OTP
  resetOtpFields() {
    this.otpForm.reset();
    // Focus sur le champ OTP
    setTimeout(() => {
      if (this.otpInput) {
        this.otpInput.nativeElement.setFocus();
      }
    }, 100);
  }

  // Renvoyer OTP
  async resendOtp() {
    this.otpForm.reset();
    this.otpError = '';
    await this.sendOtp();
  }

  // Modifier le numéro
  editPhoneNumber() {
    this.otpSent = false;
    this.otpForm.reset();
    this.clearCountdown();
    this.otpError = '';
    this.showOtpText = false;

    // Remettre le focus sur le champ téléphone
    setTimeout(() => {
      if (this.phoneInput) {
        this.phoneInput.nativeElement.setFocus();
      }
    }, 100);
  }

  // Gestion du compte à rebours
  startCountdown() {
    this.countdown = 300; // 5 minutes
    this.clearCountdown();

    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.clearCountdown();
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  // Formater le numéro pour l'affichage
  formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('221') && cleaned.length === 12) {
      // Format: +221 77 123 45 67
      const local = cleaned.substring(3);
      return `+221 ${local.replace(
        /(\d{2})(\d{3})(\d{2})(\d{2})/,
        '$1 $2 $3 $4',
      )}`;
    }

    return phone;
  }

  // Formater pour la recherche en base
  formatPhoneForSearch(phone: string): string {
    if (!phone) return '';
    let clean = phone.replace(/\D/g, '');

    if (clean.startsWith('221') && clean.length === 12) {
      return clean.substring(3); // Enlever "221"
    }
    if (clean.length === 10 && clean.startsWith('0')) {
      return clean.substring(1); // Enlever le 0 initial
    }
    if (clean.length === 9) {
      return clean; // Format Sénégal
    }
    return clean;
  }

  // Validation des champs
  getFieldError(): string {
    const field = this.phoneForm.get('phone');
    if (!field?.errors) return '';

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['pattern']) return 'Format invalide (ex: +221771234567)';

    return '';
  }

  isFieldInvalid(): boolean {
    const field = this.phoneForm.get('phone');
    return !!(field && field.touched && field.invalid);
  }

  // Redirection vers l'inscription
  goToSignup() {
    this.router.navigate(['/signup']);
  }

  // Helper pour les toasts
  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary',
  ) {
    const t = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await t.present();
  }
}
