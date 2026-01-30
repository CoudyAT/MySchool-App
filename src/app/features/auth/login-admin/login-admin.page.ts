import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBack,
  callOutline,
  sendOutline,
  checkmarkOutline,
  pencilOutline,
} from 'ionicons/icons';
import { IonicModule } from "@ionic/angular";
@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.page.html',
  styleUrls: ['./login-admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
  ],
})
export class LoginAdminPage implements OnInit {
  phoneForm: FormGroup;
  otpForm: FormGroup;
  otpSent = false;
  loading = false;
  verifying = false;
  otpError = '';
  displayedPhone = '';
  countdown = 0;
  countdownInterval: any;

  recaptchaVerifier!: RecaptchaVerifier;
  confirmationResult!: ConfirmationResult;

  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLIonInputElement>;

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
    });

    // Initialiser avec +221 par défaut
    this.phoneForm = this.fb.group({
      phone: [
        '+221',
        [Validators.required, Validators.pattern(/^\+\d{6,15}$/)],
      ],
    });

    // Formulaire OTP avec 6 champs individuels
    this.otpForm = this.fb.group({
      digit0: ['', Validators.required],
      digit1: ['', Validators.required],
      digit2: ['', Validators.required],
      digit3: ['', Validators.required],
      digit4: ['', Validators.required],
      digit5: ['', Validators.required],
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
  // async sendOtp() {
  //   if (!this.phoneForm.valid || this.loading) {
  //     return;
  //   }

  //   this.loading = true;
  //   this.otpError = '';

  //   try {
  //     let phone = this.phoneForm.value.phone;

  //     // Normaliser le numéro
  //     phone = this.normalizePhone(phone);

  //     // Vérifier la longueur minimale
  //     if (phone.length < 13) {
  //       // +221 + 9 chiffres
  //       this.otpError = 'Numéro de téléphone incomplet';
  //       await this.showToast('Veuillez entrer un numéro complet', 'warning');
  //       return;
  //     }

  //     this.displayedPhone = this.formatPhoneDisplay(phone);

  //     // Envoyer le code OTP
  //     this.confirmationResult = await signInWithPhoneNumber(
  //       this.auth,
  //       phone,
  //       this.recaptchaVerifier
  //     );

  //     // Succès
  //     this.otpSent = true;
  //     this.startCountdown();

  //     await this.showToast('Code envoyé par SMS', 'success');

  //     // Stocker temporairement le numéro
  //     localStorage.setItem('pendingPhone', this.formatPhoneForSearch(phone));

  //     // Mettre le focus sur le premier champ OTP
  //     setTimeout(() => {
  //       const firstOtpInput = document.querySelector(
  //         '.otp-input'
  //       ) as HTMLInputElement;
  //       if (firstOtpInput) {
  //         firstOtpInput.focus();
  //       }
  //     }, 100);
  //   } catch (error: any) {
  //     console.error('Erreur envoi OTP:', error);

  //     if (error.code === 'auth/invalid-phone-number') {
  //       this.otpError = 'Numéro de téléphone invalide';
  //     } else if (error.code === 'auth/too-many-requests') {
  //       this.otpError = 'Trop de tentatives. Veuillez réessayer plus tard.';
  //     } else {
  //       this.otpError = "Erreur lors de l'envoi du code";
  //     }

  //     await this.showToast(this.otpError, 'danger');
  //   } finally {
  //     this.loading = false;
  //   }
  // }

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

      // Focus sur le premier champ OTP
      setTimeout(() => {
        const firstOtpInput = document.querySelector(
          '.otp-input',
        ) as HTMLInputElement;
        if (firstOtpInput) {
          firstOtpInput.focus();
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

  // Vérifier OTP
  async verifyOtp() {
    if (!this.isOtpComplete() || this.verifying) {
      return;
    }

    this.verifying = true;
    this.otpError = '';

    // Afficher un loader
    await this.showToast('Vérification du code...', 'primary');

    try {
      // Récupérer le code OTP complet
      const otpCode = this.getOtpCode();

      // Vérifier le code OTP avec Firebase
      const result = await this.confirmationResult.confirm(otpCode);

      // Code OTP valide
      const phone = result.user.phoneNumber;
      const cleanPhone = this.formatPhoneForSearch(phone || '');

      // Vérifier si l'utilisateur existe dans Firestore
      const userExists = await this.checkUserExists(cleanPhone);

      if (userExists) {
        // Utilisateur existant → connexion
        await this.handleExistingUser(cleanPhone);
      } else {
        // Nouvel utilisateur → inscription
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

      // Réinitialiser les champs OTP en cas d'erreur
      this.resetOtpFields();
    } finally {
      this.verifying = false;
    }
  }

  // Méthode handleExistingUser corrigée
  // async handleExistingUser(phone: string) {
  //   try {
  //     const usersCollection = collection(this.firestore, 'utilisateur');
  //     const phoneQuery = query(usersCollection, where('phone', '==', phone));
  //     const snapshot = await getDocs(phoneQuery);

  //     if (!snapshot.empty) {
  //       const userDoc = snapshot.docs[0];
  //       const userData = userDoc.data();

  //       // Stocker les données utilisateur
  //       localStorage.setItem(
  //         'currentUser',
  //         JSON.stringify({
  //           ...userData,
  //           id: userDoc.id,
  //         })
  //       );
  //       localStorage.setItem('userPhone', phone);

  //       // Connexion Firebase anonyme
  //       if (!this.auth.currentUser) {
  //         await signInAnonymously(this.auth);
  //       }

  //       // Toast de bienvenue
  //       const firstName = userData['firstName'] || '';
  //       await this.showToast(
  //         firstName ? `Bienvenue ${firstName} !` : 'Connexion réussie !',
  //         'success'
  //       );

  //       // IMPORTANT: Redirection vers /courses
  //       console.log('Redirection vers /courses...');

  //       // Utiliser router.navigate avec replaceUrl
  //       setTimeout(() => {
  //         this.router
  //           .navigate(['/courses'], {
  //             replaceUrl: true,
  //           })
  //           .then(() => {
  //             console.log('Navigation réussie vers /courses');
  //           })
  //           .catch((err) => {
  //             console.error('Erreur navigation:', err);
  //             // Fallback: redirection via window.location
  //             window.location.href = '/courses';
  //           });
  //       }, 1000);
  //     } else {
  //       await this.showToast('Utilisateur non trouvé', 'danger');
  //     }
  //   } catch (error) {
  //     console.error('Erreur connexion utilisateur:', error);
  //     await this.showToast('Erreur lors de la connexion', 'danger');
  //     throw error;
  //   }
  // }

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

  // Méthode handleNewUser corrigée
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

  // Méthode checkUserExists améliorée
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
    // Focus sur le premier champ OTP
    setTimeout(() => {
      const firstOtpInput = document.querySelector(
        '.otp-input',
      ) as HTMLInputElement;
      if (firstOtpInput) {
        firstOtpInput.focus();
      }
    }, 100);
  }
  // Vérifier si l'utilisateur existe
  // async checkUserExists(phone: string): Promise<boolean> {
  //   try {
  //     const usersCollection = collection(this.firestore, 'utilisateur');
  //     const phoneQuery = query(usersCollection, where('phone', '==', phone));
  //     const snapshot = await getDocs(phoneQuery);
  //     return !snapshot.empty;
  //   } catch (error) {
  //     console.error('Erreur vérification utilisateur:', error);
  //     return false;
  //   }
  // }

  // // Gérer utilisateur existant
  // async handleExistingUser(phone: string) {
  //   try {
  //     const usersCollection = collection(this.firestore, 'utilisateur');
  //     const phoneQuery = query(usersCollection, where('phone', '==', phone));
  //     const snapshot = await getDocs(phoneQuery);

  //     if (!snapshot.empty) {
  //       const userDoc = snapshot.docs[0];
  //       const userData = userDoc.data();

  //       // Stocker les données utilisateur
  //       localStorage.setItem(
  //         'currentUser',
  //         JSON.stringify({
  //           ...userData,
  //           id: userDoc.id,
  //         })
  //       );
  //       localStorage.setItem('userPhone', phone);

  //       // Connexion Firebase anonyme
  //       if (!this.auth.currentUser) {
  //         await signInAnonymously(this.auth);
  //       }

  //       // Toast de bienvenue
  //       const firstName = userData['firstName'] || '';
  //       await this.showToast(
  //         firstName ? `Bienvenue ${firstName} !` : 'Connexion réussie !',
  //         'success'
  //       );

  //       // Redirection vers la page d'accueil
  //       setTimeout(() => {
  //         window.location.href = '/courses';
  //       }, 1000);
  //     }
  //   } catch (error) {
  //     console.error('Erreur connexion utilisateur:', error);
  //     throw error;
  //   }
  // }

  // // Gérer nouvel utilisateur
  // async handleNewUser(phone: string) {
  //   await this.showToast('Numéro vérifié avec succès', 'success');

  //   // Rediriger vers le flux d'inscription
  //   this.router.navigate(['/signup-flow'], {
  //     queryParams: { phone },
  //     state: {
  //       verified: true,
  //       phoneNumber: phone,
  //     },
  //   });
  // }

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

    // Remettre le focus sur le champ téléphone
    setTimeout(() => {
      if (this.phoneInput) {
        this.phoneInput.nativeElement.setFocus();
      }
    }, 100);
  }

  // Gestion de l'OTP
  onOtpInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Ne garder que les chiffres
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.otpForm.get('digit' + index)?.setValue('');
      return;
    }

    // Si un chiffre est entré, passer au champ suivant
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `[formcontrolname="digit${index + 1}"]`,
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Vérifier si l'OTP est complet
    if (this.isOtpComplete()) {
      // Auto-soumettre après un délai court
      setTimeout(() => {
        this.verifyOtp();
      }, 500);
    }
  }

  onOtpBackspace(event: any, index: number) {
    if (
      event.key === 'Backspace' &&
      !this.otpForm.get('digit' + index)?.value &&
      index > 0
    ) {
      const prevInput = document.querySelector(
        `[formcontrolname="digit${index - 1}"]`,
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onOtpKeyDown(event: any, index: number) {
    // Permettre seulement les chiffres, backspace, tab, flèches
    if (!/[0-9]|Backspace|Tab|ArrowLeft|ArrowRight/.test(event.key)) {
      event.preventDefault();
    }

    // Navigation avec les flèches
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelector(
        `[formcontrolname="digit${index - 1}"]`,
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
      event.preventDefault();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = document.querySelector(
        `[formcontrolname="digit${index + 1}"]`,
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
      event.preventDefault();
    }
  }

  // Récupérer le code OTP complet
  getOtpCode(): string {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += this.otpForm.get('digit' + i)?.value || '';
    }
    return code;
  }

  // Vérifier si l'OTP est complet
  isOtpComplete(): boolean {
    for (let i = 0; i < 6; i++) {
      if (!this.otpForm.get('digit' + i)?.value) {
        return false;
      }
    }
    return true;
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
