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
  signInWithEmailAndPassword,
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
  IonSelectOption,
  IonSelect,
  IonSegment,
  IonSegmentButton,
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
  mailOutline,
  lockClosedOutline,
  logInOutline,
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
    IonSelectOption,
    IonSelect,
    IonSegment,
    IonSegmentButton,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLIonInputElement>;
  @ViewChild('otpInput') otpInput!: ElementRef<HTMLIonInputElement>;

  // ─── Mode de connexion ───────────────────────────────────────────────────────
  loginMode: 'phone' | 'email' = 'phone';

  // ─── Formulaires ────────────────────────────────────────────────────────────
  phoneForm!: FormGroup;
  otpForm!: FormGroup;
  emailForm!: FormGroup;

  // ─── États OTP (téléphone) ───────────────────────────────────────────────────
  otpSent = false;
  loading = false;
  verifying = false;
  otpError = '';
  displayedPhone = '';
  countdown = 0;
  countdownInterval: any;
  showOtpText = false;
  autoVerify = true;

  // ─── États Email ─────────────────────────────────────────────────────────────
  emailLoading = false;
  emailLoginError = '';
  showPassword = false;

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
      mailOutline,
      lockClosedOutline,
      logInOutline,
    });
  }

  ngOnInit() {
    this._buildForms();

    this.route.queryParams.subscribe((params) => {
      if (params['phone']) {
        const phone = params['phone'];
        if (phone.startsWith('+')) {
          const match = phone.match(/^(\+\d+)(.+)$/);
          if (match) {
            this.phoneForm.patchValue({ countryCode: match[1], phone: match[2].trim() });
          }
        }
      }
    });

    this.initializeRecaptcha();

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.router.navigate(['/courses'], { replaceUrl: true });
    }

    const savedAutoVerify = localStorage.getItem('autoVerifyOtp');
    if (savedAutoVerify !== null) {
      this.autoVerify = savedAutoVerify === 'true';
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.phoneInput && !this.otpSent) {
        this.phoneInput.nativeElement.setFocus();
      }
    }, 300);
  }

  // ─── Construction des formulaires ────────────────────────────────────────────

  private _buildForms() {
    this.phoneForm = this.fb.group({
      countryCode: ['+221', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]],
    });

    this.otpForm = this.fb.group({
      otpCode: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d+$/)],
      ],
    });

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ─── Changement de mode ───────────────────────────────────────────────────────

  onLoginModeChange() {
    // Réinitialiser les erreurs au changement de mode
    this.emailLoginError = '';
    this.otpError = '';
  }

  // ─── Connexion par email / mot de passe ───────────────────────────────────────

  async loginWithEmail() {
    if (!this.emailForm.valid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.emailLoading = true;
    this.emailLoginError = '';

    const { email, password } = this.emailForm.value;

    try {
      // 1. Authentification Firebase
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = credential.user;

      // 2. Recherche de l'utilisateur dans Firestore par email
      const usersCollection = collection(this.firestore, 'utilisateur');
      const emailQuery = query(usersCollection, where('email', '==', email));
      const snapshot = await getDocs(emailQuery);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        localStorage.setItem('currentUser', JSON.stringify({ ...userData, id: userId }));

        // 3. Synchronisation de l'abonnement
        try {
          const response = await fetch(`https://myschool.com/api/subscriptions/sync-status/${userId}`);
          const result = await response.json();
          if (result.success) {
            localStorage.setItem('userSubscription', JSON.stringify(result.data));
          }
        } catch (err) {
          console.warn('Impossible de récupérer l\'abonnement', err);
        }

        const firstName = userData['firstName'] || '';
        await this.showToast(firstName ? `Bienvenue ${firstName} !` : 'Connexion réussie !', 'success');

        // 4. Redirection selon le rôle
        const role = userData['role']?.libelle?.toString().toLowerCase() || 'user';
        const route = role === 'admin' ? '/admin-login/users' : '/courses';
        setTimeout(() => this.router.navigate([route], { replaceUrl: true }), 500);

      } else {
        // Utilisateur Firebase mais pas dans Firestore → inscription incomplète
        await this.showToast('Aucun compte trouvé pour cet email.', 'warning');
        this.emailLoginError = 'Aucun compte associé à cet email.';
      }

    } catch (error: any) {
      console.error('Erreur connexion email:', error);

      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Aucun compte trouvé pour cet email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/user-disabled': 'Ce compte a été désactivé.',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
        'auth/invalid-credential': 'Email ou mot de passe incorrect.',
      };

      this.emailLoginError = errorMap[error.code] || 'Erreur lors de la connexion.';
      await this.showToast(this.emailLoginError, 'danger');
    } finally {
      this.emailLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  // Validation formulaire email
  isEmailFieldInvalid(field: string): boolean {
    const control = this.emailForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  getEmailFieldError(field: string): string {
    const control = this.emailForm.get(field);
    if (!control?.errors) return '';
    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['email']) return 'Format email invalide';
    if (control.errors['minlength']) return 'Le mot de passe doit contenir au moins 6 caractères';
    return '';
  }

  // ─── Connexion par téléphone (OTP) — code inchangé ───────────────────────────

  initializeRecaptcha() {
    setTimeout(() => {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA résolu'),
        'expired-callback': () => console.log('reCAPTCHA expiré'),
      });
    }, 500);
  }

  onPhoneInput(event: any) {
    const digits = (event.target.value || '').replace(/\D/g, '');
    this.phoneForm.patchValue({ phone: digits }, { emitEvent: false });
  }

  async sendOtp() {
    if (!this.phoneForm.valid) {
      await this.showToast('Veuillez entrer un numéro valide', 'warning');
      return;
    }

    const countryCode = this.phoneForm.get('countryCode')?.value;
    let phoneNumber = (this.phoneForm.get('phone')?.value || '').replace(/\D/g, '');
    const fullPhone = countryCode + phoneNumber;

    if (countryCode === '+221' && phoneNumber.length !== 9) {
      await this.showToast('Le numéro sénégalais doit contenir 9 chiffres', 'warning');
      return;
    }

    this.loading = true;
    this.displayedPhone = this.formatPhoneDisplay(fullPhone);

    try {
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) throw new Error('reCAPTCHA container not found');

      if (this.recaptchaVerifier) {
        try { await this.recaptchaVerifier.clear(); } catch (e) { }
      }
      this.initializeRecaptcha();
      await new Promise((r) => setTimeout(r, 1000));

      this.confirmationResult = await signInWithPhoneNumber(this.auth, fullPhone, this.recaptchaVerifier);
      this.otpSent = true;
      this.loading = false;
      this.startCountdown();
      await this.showToast('Code envoyé par SMS avec succès', 'success');

      setTimeout(() => {
        try { this.otpInput?.nativeElement.setFocus(); } catch (e) { }
      }, 300);
    } catch (error: any) {
      this.loading = false;
      const errorMap: Record<string, string> = {
        'auth/invalid-phone-number': 'Numéro de téléphone invalide',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
        'auth/quota-exceeded': 'Quota SMS dépassé',
        'auth/captcha-check-failed': 'Échec de vérification reCAPTCHA',
        'auth/invalid-app-credential': "Erreur de configuration Firebase.",
      };
      await this.showToast(errorMap[error.code] || "Erreur lors de l'envoi du code", 'danger');
    }
  }

  onCountryCodeChange() {
    setTimeout(() => { this.phoneInput?.nativeElement.setFocus(); }, 100);
  }

  onSingleOtpInput(event: any) {
    let value = (event.target.value || '').replace(/\D/g, '').substring(0, 6);
    this.otpForm.patchValue({ otpCode: value });
    this.otpError = '';
    if (this.autoVerify && value.length === 6) {
      setTimeout(() => this.verifyOtp(), 500);
    }
  }

  onOtpKeyDown(event: KeyboardEvent) {
    const allowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!allowed.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const digits = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    this.otpForm.patchValue({ otpCode: digits });
    this.otpError = '';
    if (this.autoVerify && digits.length === 6) {
      setTimeout(() => this.verifyOtp(), 500);
    }
  }

  validateOtpLength() {
    const val = this.otpForm.get('otpCode')?.value || '';
    this.otpError = val.length > 0 && val.length < 6 ? 'Le code doit contenir 6 chiffres' : '';
  }

  toggleOtpVisibility() {
    this.showOtpText = !this.showOtpText;
    setTimeout(() => {
      this.otpInput?.nativeElement.getInputElement().then((n: HTMLInputElement) => {
        n.type = this.showOtpText ? 'text' : 'password';
      });
    }, 10);
  }

  onAutoVerifyChange() {
    localStorage.setItem('autoVerifyOtp', this.autoVerify.toString());
    if (this.autoVerify && this.isOtpComplete()) {
      setTimeout(() => this.verifyOtp(), 300);
    }
  }

  async verifyOtp() {
    if (!this.isOtpComplete() || this.verifying) return;
    this.verifying = true;
    this.otpError = '';

    try {
      const result = await this.confirmationResult.confirm(this.getOtpCode());
      const phone = result.user.phoneNumber;
      const cleanPhone = this.formatPhoneForSearch(phone || '');
      const userExists = await this.checkUserExists(cleanPhone);
      if (userExists) {
        await this.handleExistingUser(cleanPhone);
      } else {
        await this.handleNewUser(cleanPhone);
      }
    } catch (error: any) {
      const errorMap: Record<string, string> = {
        'auth/invalid-verification-code': 'Code incorrect. Veuillez réessayer.',
        'auth/code-expired': 'Code expiré. Veuillez en demander un nouveau.',
        'auth/credential-already-in-use': 'Ce numéro est déjà associé à un autre compte.',
      };
      this.otpError = errorMap[error.code] || 'Erreur de vérification';
      await this.showToast(this.otpError, 'danger');
      this.otpForm.patchValue({ otpCode: '' });
      setTimeout(() => { try { this.otpInput?.nativeElement.setFocus(); } catch (e) { } }, 100);
    } finally {
      this.verifying = false;
    }
  }

  isOtpComplete(): boolean {
    const v = this.otpForm.get('otpCode')?.value || '';
    return v.length === 6 && /^\d+$/.test(v);
  }

  getOtpCode(): string {
    return this.otpForm.get('otpCode')?.value || '';
  }

  async handleExistingUser(phone: string) {
    try {
      const usersCollection = collection(this.firestore, 'utilisateur');
      const snapshot = await getDocs(query(usersCollection, where('phone', '==', phone)));

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        localStorage.setItem('currentUser', JSON.stringify({ ...userData, id: userId }));
        localStorage.setItem('userPhone', phone);

        if (!this.auth.currentUser) await signInAnonymously(this.auth);

        try {
          const res = await fetch(`https://myschool.com/api/subscriptions/sync-status/${userId}`);
          const result = await res.json();
          if (result.success) localStorage.setItem('userSubscription', JSON.stringify(result.data));
        } catch (e) { }

        const firstName = userData['firstName'] || '';
        await this.showToast(firstName ? `Bienvenue ${firstName} !` : 'Connexion réussie !', 'success');

        const role = userData['role']?.libelle?.toString().toLowerCase() || 'user';
        const route = role === 'admin' ? '/admin-login/users' : '/courses';
        setTimeout(() => this.router.navigate([route], { replaceUrl: true }), 500);
      } else {
        await this.showToast('Utilisateur non trouvé', 'danger');
      }
    } catch (error) {
      await this.showToast('Erreur lors de la connexion', 'danger');
      throw error;
    }
  }

  async handleNewUser(phone: string) {
    await this.showToast('Numéro vérifié avec succès', 'success');
    localStorage.setItem('pendingPhone', phone);
    localStorage.setItem('verifiedPhone', phone);
    setTimeout(() => {
      this.router.navigate(['/signup'], {
        queryParams: { phone },
        state: { verified: true, phoneNumber: phone },
        replaceUrl: true,
      }).catch(() => { window.location.href = `/signup?phone=${phone}`; });
    }, 800);
  }

  async checkUserExists(phone: string): Promise<boolean> {
    try {
      const snapshot = await getDocs(query(collection(this.firestore, 'utilisateur'), where('phone', '==', phone)));
      return !snapshot.empty;
    } catch {
      return false;
    }
  }

  async resendOtp() {
    this.otpForm.reset();
    this.otpError = '';
    await this.sendOtp();
  }

  editPhoneNumber() {
    this.otpSent = false;
    this.otpForm.reset();
    this.clearCountdown();
    this.otpError = '';
    this.showOtpText = false;
    setTimeout(() => { this.phoneInput?.nativeElement.setFocus(); }, 300);
  }

  startCountdown() {
    this.countdown = 300;
    this.clearCountdown();
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) { this.countdown--; } else { this.clearCountdown(); }
    }, 1000);
  }

  clearCountdown() {
    if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; }
  }

  formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('221') && cleaned.length === 12) {
      const local = cleaned.substring(3);
      return `+221 ${local.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
    }
    return phone;
  }

  formatPhoneForSearch(phone: string): string {
    if (!phone) return '';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('221') && clean.length === 12) return clean.substring(3);
    if (clean.length === 10 && clean.startsWith('0')) return clean.substring(1);
    return clean;
  }

  getFieldError(): string {
    const field = this.phoneForm.get('phone');
    if (!field?.errors) return '';
    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['pattern']) return 'Format invalide (ex: 771234567)';
    return '';
  }

  isFieldInvalid(): boolean {
    const field = this.phoneForm.get('phone');
    return !!(field && field.touched && field.invalid);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'primary') {
    const t = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }
}