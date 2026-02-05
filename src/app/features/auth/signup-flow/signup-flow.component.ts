import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from '@angular/fire/auth';

import {
  Firestore,
  collection,
  addDoc,
  query,
  getDocs,
  where,
} from '@angular/fire/firestore';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonIcon,
  IonSpinner,
  ToastController,
  AnimationController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBack,
  checkmarkCircle,
  library,
  person,
  calendar,
  location,
  call,
  business,
  school,
  sync,
  arrowForward,
  calendarOutline,
  flagOutline,
  alertCircleOutline,
  locationOutline,
  businessOutline,
  mapOutline,
  lockClosedOutline,
  callOutline,
  closeCircle,
  informationCircleOutline,
} from 'ionicons/icons';
import { nations } from 'src/app/shared/utils/nations';

interface UserData {
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  phone: string;
  birthDate: string;
  school: string;
  objectives: string[];
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  password: string;
  confirmPassword: string;
  classe: string;
  niveauScolaire: string;
}

@Component({
  selector: 'app-signup-flow',
  templateUrl: './signup-flow.component.html',
  styleUrls: ['./signup-flow.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonCheckbox,
    IonSelect,
    IonSelectOption,
    IonProgressBar,
    IonIcon,
    IonSpinner,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupFlowComponent implements OnInit {
  currentStep = 0;
  totalSteps = 4;
  countries = nations;
  isAnimating = false;
  maxDate: string;
  minDate: string;
  showPasswordField = false;
  otpSent = false;
  confirmationResult!: ConfirmationResult;
  recaptchaVerifier!: RecaptchaVerifier;

  otpForm!: FormGroup;

  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  showDatePickerOverlay = false;
  selectedDay: number | null = null;
  selectedMonth: number | null = null;
  selectedYear: number | null = null;

  // Listes pour les sélecteurs
  days: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  months: string[] = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  years: number[] = [
    ...Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i),
  ];

  @ViewChild('daySelect') daySelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('monthSelect') monthSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('yearSelect') yearSelect!: ElementRef<HTMLSelectElement>;

  // Nouveaux états
  isCheckingUser = false;
  userExistsError = false;

  welcomeForm!: FormGroup;
  personalInfoForm!: FormGroup;
  userInfoForm!: FormGroup;

  isSendingOtp = false;
  isVerifyingOtp = false;
  otpCountdown = 0;
  otpTimer: any;
  canResendOtp = true;

  availableObjectives = [
    {
      id: 'multi-domain',
      label: 'Se former sur un ou plusieurs domaines ?',
      selected: false,
      icon: 'library',
    },
    {
      id: 'exam-success',
      label: 'Réussir un exam',
      selected: false,
      icon: 'checkmark-circle',
    },
    {
      id: 'get-bac',
      label: 'Obtenir mon BAC',
      selected: false,
      icon: 'school',
    },
    {
      id: 'prepare-bfem',
      label: 'Je prépare le BFEM',
      selected: false,
      icon: 'school',
    },
    {
      id: 'get-certification',
      label: 'Obtenir une certification',
      selected: false,
      icon: 'checkmark-circle',
    },
    {
      id: 'improve-skills',
      label: 'Renforcer mes capacités',
      selected: false,
      icon: 'person',
    },
    {
      id: 'other-objectives',
      label: 'Autres objectifs',
      selected: false,
      icon: 'library',
    },
  ];

  niveauxEtude = [
    { value: 'ELEMENTAIRE', label: 'Élémentaire' },
    { value: 'MOYEN', label: 'Moyen (Collège)' },
    { value: 'SECONDAIRE', label: 'Secondaire (Lycée)' },
    { value: 'UNIVERSITAIRE', label: 'Universitaire' },
  ];

  classesParNiveau: { [key: string]: string[] } = {
    ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    MOYEN: ['6ème', '5ème', '4ème', '3ème'],
    SECONDAIRE: ['Seconde', 'Première', 'Terminale'],
    UNIVERSITAIRE: ['Licence1', 'Licence2', 'Licence3', 'Master1', 'Master2'],
  };

  classesDisponibles: string[] = [];

  userData: UserData = {
    firstName: '',
    lastName: '',
    country: '',
    address: '',
    phone: '',
    birthDate: '',
    school: '',
    objectives: [],
    acceptTerms: false,
    acceptPrivacy: false,
    password: '',
    confirmPassword: '',
    niveauScolaire: '',
    classe: '',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private animationCtrl: AnimationController,
    private auth: Auth,
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private platform: Platform,
  ) {
    addIcons({
      chevronBack,
      callOutline,
      person,
      calendarOutline,
      closeCircle,
      lockClosedOutline,
      location,
      school,
      checkmarkCircle,
      sync,
      business,
      informationCircleOutline,
      arrowForward,
      flagOutline,
      alertCircleOutline,
      locationOutline,
      businessOutline,
      mapOutline,
      calendar,
      call,
      library,
    });

    // Date maximale : 18 ans en arrière
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
    this.maxDate = eighteenYearsAgo.toISOString().split('T')[0];

    // Date minimale : 100 ans en arrière
    const hundredYearsAgo = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate(),
    );
    this.minDate = hundredYearsAgo.toISOString().split('T')[0];

    this.initForms();
  }

  ngOnInit() {
    this.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha-container',
      {
        size: 'invisible',
      },
    );
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.router.navigate(['/courses'], { replaceUrl: true });
    }
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password'], {
      queryParams: {
        phone: this.welcomeForm.value.phone,
      },
    });
  }

  initForms() {
    this.welcomeForm = this.fb.group({
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{8,}$/)],
      ],
      // password: [''],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Formulaire d'info personnelles avec confirmation mot de passe
    this.personalInfoForm = this.fb.group({
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{8,}$/)],
      ],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, Validators.requiredTrue],
      acceptPrivacy: [false, Validators.requiredTrue],
    });

    this.userInfoForm = this.fb.group({
      country: ['Senegal', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      // profession: ['', Validators.required],
      school: [''],
      niveauScolaire: ['', Validators.required], // Nouveau champ
      classe: ['', Validators.required], // Nouveau champ
    });
  }

  // =====================
  // Étape 1: Vérifier si connexion ou inscription
  // =====================

  async checkLoginOrSignup() {
    if (!this.welcomeForm.get('phone')?.valid || this.isCheckingUser) {
      return;
    }

    this.isCheckingUser = true;
    this.userExistsError = false;
    this.isAnimating = true;

    try {
      const phone = this.welcomeForm.value.phone;
      const cleanPhone = this.formatPhoneForSearch(phone);

      const usersCollection = collection(this.firestore, 'utilisateur');

      const phoneQuery = query(
        usersCollection,
        where('phone', '==', cleanPhone),
      );

      const snapshot = await getDocs(phoneQuery);

      // 🔹 CAS 1 : UTILISATEUR EXISTE
      if (!snapshot.empty) {
        this.showPasswordField = true;

        // Rendre le password obligatoire
        this.welcomeForm
          .get('password')
          ?.setValidators([Validators.required, Validators.minLength(6)]);
        this.welcomeForm.get('password')?.updateValueAndValidity();

        // Si mot de passe non encore saisi → on attend
        if (!this.welcomeForm.value.password) {
          await this.showToast(
            'Entrez votre mot de passe pour continuer',
            'primary',
          );
          return;
        }

        // 🔐 Vérification mot de passe
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData['password'] !== this.welcomeForm.value.password) {
          this.userExistsError = true;
          await this.showToast('Mot de passe incorrect', 'danger');
          return;
        }

        // ✅ Connexion OK
        localStorage.setItem(
          'currentUser',
          JSON.stringify({ ...userData, id: userDoc.id }),
        );
        localStorage.setItem('userPhone', cleanPhone);

        await this.showToast(
          `Bienvenue ${userData['firstName'] || ''} !`,
          'success',
        );

        setTimeout(() => {
          window.location.href = '/courses';
        }, 800);

        return;
      }

      // 🔹 CAS 2 : NOUVEL UTILISATEUR
      this.showPasswordField = false;

      this.welcomeForm.get('password')?.clearValidators();
      this.welcomeForm.get('password')?.updateValueAndValidity();

      this.userData.phone = cleanPhone;

      this.personalInfoForm.patchValue({
        phone: cleanPhone,
      });

      this.currentStep = 1;

      await this.showToast('Numéro non reconnu, création de compte', 'success');
    } catch (error: any) {
      console.error(error);
      await this.showToast('Erreur lors de la vérification', 'danger');
    } finally {
      this.isCheckingUser = false;
      this.isAnimating = false;
    }
  }

  // =====================
  // Navigation entre étapes
  // =====================

  async nextStep() {
    if (this.validateCurrentStep() && !this.isAnimating) {
      this.isAnimating = true;
      this.updateUserData();

      if (this.currentStep < this.totalSteps - 1) {
        await this.animateStepTransition('forward');
        this.currentStep++;
        this.prefillNextStep();
      } else {
        await this.completeSignup();
      }

      this.isAnimating = false;
    }
  }

  async previousStep() {
    if (this.currentStep > 0 && !this.isAnimating) {
      this.isAnimating = true;
      await this.animateStepTransition('backward');
      this.currentStep--;
      this.prefillCurrentStep();
      this.isAnimating = false;
    }
  }

  async animateStepTransition(direction: 'forward' | 'backward') {
    const currentContent = document.querySelector('.step-content.active');
    if (currentContent) {
      const animation = this.animationCtrl
        .create()
        .addElement(currentContent)
        .duration(300)
        .easing('cubic-bezier(0.4, 0.0, 0.2, 1)')
        .fromTo(
          'transform',
          'translateX(0)',
          `translateX(${direction === 'forward' ? '-100%' : '100%'})`,
        )
        .fromTo('opacity', '1', '0');

      await animation.play();
    }
  }

  // =====================
  // Validation
  // =====================

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.welcomeForm.valid;
      case 1:
        return this.personalInfoForm.valid && !this.passwordsMismatch();
      case 2:
        return this.userInfoForm.valid;
      case 3:
        return this.availableObjectives.some((obj) => obj.selected);
      default:
        return false;
    }
  }

  // Vérifier si les mots de passe correspondent
  passwordsMismatch(): boolean {
    if (this.currentStep !== 1) return false;

    const password = this.personalInfoForm.get('password')?.value;
    const confirmPassword = this.personalInfoForm.get('confirmPassword')?.value;

    return password !== confirmPassword && confirmPassword.length > 0;
  }

  // =====================
  // Gestion des données utilisateur
  // =====================

  updateUserData() {
    switch (this.currentStep) {
      case 0:
        this.userData.phone = this.welcomeForm.value.phone;
        this.userData.password = this.welcomeForm.value.password;
        break;
      case 1:
        this.userData.firstName = this.personalInfoForm.value.firstName;
        this.userData.lastName = this.personalInfoForm.value.lastName;
        this.userData.birthDate = this.personalInfoForm.value.birthDate;
        this.userData.password = this.personalInfoForm.value.password;

        // Ajoutez cette ligne pour synchroniser les checkboxes
        this.userData.acceptTerms = this.personalInfoForm.value.acceptTerms;
        this.userData.acceptPrivacy = this.personalInfoForm.value.acceptPrivacy;
        break;
      case 2:
        Object.assign(this.userData, this.userInfoForm.value);
        break;
      case 3:
        this.userData.objectives = this.availableObjectives
          .filter((obj) => obj.selected)
          .map((obj) => obj.id);
        break;
    }
  }

  prefillNextStep() {
    if (this.currentStep === 1) {
      const phone = this.userData.phone || this.welcomeForm.value.phone;
      const password =
        this.userData.password || this.welcomeForm.value.password;

      if (phone) {
        this.personalInfoForm.patchValue({ phone });
      }
      if (password) {
        this.personalInfoForm.patchValue({ password });
      }
    }
  }

  prefillCurrentStep() {
    // Ne rien faire pour l'instant
  }

  // =====================
  // Méthodes d'affichage
  // =====================

  getProgressPercentage(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  getCurrentStepTitle(): string {
    const titles = [
      'Bienvenue dans MySchool',
      'Informations personnelles',
      'Informations complémentaires',
      'Quels sont vos objectifs ?',
    ];
    return titles[this.currentStep];
  }

  getCurrentStepSubtitle(): string {
    const subtitles = [
      'Connectez-vous ou créez un compte',
      'Complétez vos informations personnelles',
      'Dites-nous en plus sur vous',
      '',
    ];
    return subtitles[this.currentStep];
  }

  goToSignupStep() {
    this.currentStep = 1;
  }

  getButtonText(): string {
    return this.currentStep === this.totalSteps - 1
      ? 'Commencer !'
      : 'Continuer';
  }

  getButtonColor(): string {
    return this.currentStep === this.totalSteps - 1 ? 'success' : 'primary';
  }

  // =====================
  // Validation helpers
  // =====================

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) return `Ce champ est requis`;
      if (field.errors['minlength']) {
        if (fieldName === 'password') return 'Minimum 6 caractères';
        return `Trop court`;
      }
      if (field.errors['pattern']) return `Format invalide`;
    }
    return '';
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  // =====================
  // Objectifs
  // =====================

  toggleObjective(objectiveId: string) {
    const objective = this.availableObjectives.find(
      (o) => o.id === objectiveId,
    );
    if (objective) {
      objective.selected = !objective.selected;
    }
  }

  getSelectedObjectivesCount(): number {
    return this.availableObjectives.filter((obj) => obj.selected).length;
  }

  async sendOtp() {
    if (!this.welcomeForm.get('phone')?.valid || this.isSendingOtp) {
      return;
    }

    this.isSendingOtp = true;
    const phone = this.welcomeForm.value.phone;

    try {
      // Initialiser le recaptcha si ce n'est pas déjà fait
      if (!this.recaptchaVerifier) {
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
      }

      // Nettoyer et formater le numéro pour Firebase
      const formattedPhone = this.formatPhoneForFirebase(phone);

      // Envoyer le code OTP
      this.confirmationResult = await signInWithPhoneNumber(
        this.auth,
        formattedPhone,
        this.recaptchaVerifier,
      );

      // Activer l'étape OTP
      this.otpSent = true;
      this.startOtpCountdown();

      await this.showToast('Code OTP envoyé par SMS', 'success');
    } catch (error: any) {
      console.error('Erreur envoi OTP:', error);

      let errorMessage = "Erreur lors de l'envoi du code OTP";

      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'Quota SMS dépassé. Contactez le support';
      }

      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isSendingOtp = false;
    }
  }

  async verifyOtp() {
    if (!this.otpForm.valid || this.isVerifyingOtp) {
      return;
    }

    this.isVerifyingOtp = true;
    const code = this.otpForm.value.otp;

    try {
      const result = await this.confirmationResult.confirm(code);
      const firebaseUser = result.user;

      // Numéro vérifié avec succès
      const verifiedPhone = firebaseUser.phoneNumber;
      const cleanPhone = this.formatPhoneForSearch(verifiedPhone || '');

      // 🔍 Vérifier si l'utilisateur existe déjà
      const usersRef = collection(this.firestore, 'utilisateur');
      const q = query(usersRef, where('phone', '==', cleanPhone));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // 🔐 Connexion d'un utilisateur existant
        const userDoc = snapshot.docs[0];
        localStorage.setItem(
          'currentUser',
          JSON.stringify({ ...userDoc.data(), id: userDoc.id }),
        );

        await this.showToast('Connexion réussie', 'success');
        setTimeout(() => {
          window.location.href = '/courses';
        }, 1000);
        return;
      }

      // 🆕 Nouvel utilisateur - passer à l'étape 1
      this.userData.phone = cleanPhone;
      this.personalInfoForm.patchValue({ phone: cleanPhone });
      this.currentStep = 1; // Passer à l'étape des infos personnelles
      this.otpSent = false;

      await this.showToast('Numéro vérifié avec succès', 'success');
    } catch (error: any) {
      console.error('Erreur vérification OTP:', error);

      let errorMessage = 'Code OTP incorrect';

      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Code OTP invalide';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Code OTP expiré. Veuillez en demander un nouveau';
        this.otpSent = false;
      }

      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isVerifyingOtp = false;
    }
  }

  private formatPhoneForFirebase(phone: string): string {
    // Nettoyer le numéro
    let clean = phone.replace(/\D/g, '');

    // Si le numéro commence par 0, ajouter +221
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '+221' + clean.substring(1);
    }
    // Si le numéro a 9 chiffres (Sénégal sans indicatif), ajouter +221
    else if (clean.length === 9) {
      clean = '+221' + clean;
    }
    // Si le numéro commence par 221, ajouter +
    else if (clean.startsWith('221') && clean.length === 12) {
      clean = '+' + clean;
    }
    // Si le numéro n'a pas de +, l'ajouter
    else if (!clean.startsWith('+')) {
      clean = '+' + clean;
    }

    return clean;
  }

  onDateBlur() {
    // Marquer le champ comme "touché" pour déclencher la validation
    this.personalInfoForm.get('birthDate')?.markAsTouched();

    // Optionnel: déclencher la validation
    this.personalInfoForm.get('birthDate')?.updateValueAndValidity();
  }

  // =====================
  // Finalisation de l'inscription
  // =====================

  async completeSignup() {
    this.updateUserData();

    try {
      const phone = this.personalInfoForm.value.phone;
      const password = this.personalInfoForm.value.password;
      const confirmPassword = this.personalInfoForm.value.confirmPassword;

      if (!phone || !password) {
        await this.showToast('Données incomplètes', 'danger');
        return;
      }

      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        await this.showToast(
          'Les mots de passe ne correspondent pas',
          'danger',
        );
        return;
      }

      // Vérifier si l'utilisateur existe déjà (double vérification)
      const usersCollection = collection(this.firestore, 'utilisateur');
      const phoneQuery = query(usersCollection, where('phone', '==', phone));
      const querySnapshot = await getDocs(phoneQuery);

      if (!querySnapshot.empty) {
        await this.showToast('Un compte existe déjà avec ce numéro', 'danger');
        return;
      }

      // Créer un utilisateur anonyme Firebase
      let authUser = this.auth.currentUser;
      if (!authUser) {
        const userCredential = await signInAnonymously(this.auth);
        authUser = userCredential.user;
      }

      // Préparer les données utilisateur
      const userDataToSave: any = {
        uid: authUser.uid,
        phone: phone,
        password,
        firstName: this.userData.firstName || '',
        lastName: this.userData.lastName || '',
        country: this.userData.country || '',
        address: this.userData.address || '',
        birthDate: this.userData.birthDate || '',
        school: this.userData.school || '',
        objectives: this.userData.objectives || [],
        acceptTerms: this.userData.acceptTerms,
        acceptPrivacy: this.userData.acceptPrivacy,
        level: 'beginner',
        login: phone,
        createdAt: new Date(),
        role: { libelle: 'student' },
        specializationId: null,
        status: 'active',
        classe: this.userData.classe || '',
        niveauScolaire: this.userData.niveauScolaire || '',
      };

      // Sauvegarder dans Firestore
      const userRef = await addDoc(usersCollection, userDataToSave);
      console.log('Utilisateur créé avec ID:', userRef.id);

      // Stocker en local
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          ...userDataToSave,
          id: userRef.id,
        }),
      );
      localStorage.setItem('userPhone', phone);

      await this.showToast('Inscription réussie !', 'success');
      setTimeout(() => {
        window.location.href = '/courses';
      }, 1000);
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      await this.showToast(`Erreur: ${error.message}`, 'danger');
    }
  }

  // =====================
  // Méthodes utilitaires
  // =====================

  private formatPhoneForSearch(phone: string): string {
    if (!phone) return '';

    // Nettoyer le numéro (enlever tout sauf les chiffres)
    let clean = phone.replace(/\D/g, '');

    // Si le numéro commence par +221, enlever le préfixe
    if (clean.startsWith('221') && clean.length === 12) {
      return clean.substring(3); // Enlever "221"
    }

    // Si le numéro a 10 chiffres et commence par 0, enlever le 0
    if (clean.length === 10 && clean.startsWith('0')) {
      return clean.substring(1);
    }

    // Si le numéro a 9 chiffres (format Sénégal), le garder tel quel
    if (clean.length === 9) {
      return clean;
    }

    // Par défaut, retourner le numéro nettoyé
    return clean;
  }

  // =====================
  // Gestion des dates
  // =====================

  openDatePicker() {
    const input = this.dateInput?.nativeElement;

    if (!input) return;

    // Stratégie différente selon l'appareil
    if (this.isMobile()) {
      // Sur mobile, focus direct
      input.focus();

      // Fallback pour iOS
      if (input.showPicker) {
        try {
          input.showPicker();
        } catch (error) {
          console.log('showPicker non supporté');
        }
      }
    } else {
      // Sur desktop, on peut ouvrir le picker
      if (input.showPicker) {
        input.showPicker();
      } else {
        input.focus();
      }
    }
  }

  clearDate(event: Event) {
    event.stopPropagation(); // Empêche l'ouverture du date picker

    this.personalInfoForm.patchValue({
      birthDate: '',
    });

    // Marquer comme touché pour afficher l'erreur si validation required
    this.personalInfoForm.get('birthDate')?.markAsTouched();
    this.personalInfoForm.get('birthDate')?.updateValueAndValidity();
  }

  isMobile(): boolean {
    return (
      this.platform.is('mobile') ||
      this.platform.is('mobileweb') ||
      window.innerWidth < 768
    );
  }

  onDateChange(event: any) {
    const selectedDate = event.target.value;

    if (selectedDate) {
      // Formater la date pour l'affichage
      this.personalInfoForm.patchValue({
        birthDate: selectedDate,
      });

      // Déclencher la validation
      this.personalInfoForm.get('birthDate')?.markAsTouched();
      this.personalInfoForm.get('birthDate')?.updateValueAndValidity();

      // Feedback utilisateur
      this.showDateFeedback(selectedDate);
    }
  }

  private showDateFeedback(date: string) {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Optionnel: Afficher l'âge calculé
    if (age >= 18) {
      console.log(`Âge: ${age} ans`);
    } else {
      console.log('Vous devez avoir au moins 18 ans');
    }
  }

  getFormattedDate(): string {
    const dateValue = this.personalInfoForm.get('birthDate')?.value;

    if (!dateValue) {
      return '';
    }

    try {
      const date = new Date(dateValue);

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return '';
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  }

  // =====================
  // Toast helper
  // =====================

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

  loginPage() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  showDatePicker() {
    // Pré-remplir avec la date actuelle si elle existe
    const currentDate = this.personalInfoForm.get('birthDate')?.value;
    if (currentDate) {
      const date = new Date(currentDate);
      this.selectedDay = date.getDate();
      this.selectedMonth = date.getMonth() + 1;
      this.selectedYear = date.getFullYear();
    } else {
      // Sinon, vider les sélections
      this.selectedDay = null;
      this.selectedMonth = null;
      this.selectedYear = null;
    }

    this.showDatePickerOverlay = true;

    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
  }

  // Fermer le date picker
  closeDatePicker(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showDatePickerOverlay = false;

    // Rétablir le défilement
    document.body.style.overflow = '';
  }

  // Mettre à jour la date sélectionnée
  updateSelectedDate() {
    if (this.daySelect && this.monthSelect && this.yearSelect) {
      const day = this.daySelect.nativeElement.value;
      const month = this.monthSelect.nativeElement.value;
      const year = this.yearSelect.nativeElement.value;

      this.selectedDay = day ? parseInt(day, 10) : null;
      this.selectedMonth = month ? parseInt(month, 10) : null;
      this.selectedYear = year ? parseInt(year, 10) : null;

      // Valider la date
      if (this.selectedDay && this.selectedMonth && this.selectedYear) {
        const isValidDate = this.validateDate(
          this.selectedYear,
          this.selectedMonth,
          this.selectedDay,
        );

        if (!isValidDate) {
          // Si la date est invalide (ex: 31 février), réinitialiser le jour
          this.selectedDay = null;
          this.daySelect.nativeElement.value = '';
        }
      }
    }
  }

  private validateDate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  calculateAge(): number {
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      return 0;
    }

    const birthDate = new Date(
      this.selectedYear,
      this.selectedMonth - 1,
      this.selectedDay,
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Confirmer la date sélectionnée
  confirmDate() {
    if (this.selectedDay && this.selectedMonth && this.selectedYear) {
      // Formater la date au format YYYY-MM-DD
      const formattedDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${this.selectedDay.toString().padStart(2, '0')}`;

      // Mettre à jour le formulaire
      this.personalInfoForm.patchValue({
        birthDate: formattedDate,
      });

      // Marquer comme touché pour la validation
      this.personalInfoForm.get('birthDate')?.markAsTouched();
      this.personalInfoForm.get('birthDate')?.updateValueAndValidity();

      // Vérifier l'âge minimum
      const age = this.calculateAge();
      if (age < 18) {
        this.showToast(
          'Vous devez avoir au moins 18 ans pour vous inscrire',
          'warning',
        );
      }

      // Fermer le date picker
      this.closeDatePicker();
    }
  }

  openTerms() {
    window.open('/terms', '_blank');
  }

  onNiveauEtudeChange(niveau: string) {
    if (niveau && this.classesParNiveau[niveau]) {
      this.classesDisponibles = this.classesParNiveau[niveau];
      // Réinitialiser la classe sélectionnée si elle n'est plus dans la liste
      const currentClasse = this.userInfoForm.get('classe')?.value;
      if (currentClasse && !this.classesDisponibles.includes(currentClasse)) {
        this.userInfoForm.patchValue({ classe: '' });
      }
    } else {
      this.classesDisponibles = [];
    }
  }

  startOtpCountdown() {
    this.otpCountdown = 60; // 60 secondes
    this.canResendOtp = false;

    this.otpTimer = setInterval(() => {
      this.otpCountdown--;

      if (this.otpCountdown <= 0) {
        clearInterval(this.otpTimer);
        this.canResendOtp = true;
      }
    }, 1000);
  }

  // Méthode pour renvoyer le code OTP
  async resendOtp() {
    if (!this.canResendOtp || this.isSendingOtp) {
      return;
    }

    // Réinitialiser le formulaire OTP
    this.otpForm.reset();

    // Renvoyer le code
    await this.sendOtp();
  }

  // Ajoutez aussi dans ngOnDestroy
  ngOnDestroy() {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
    }

    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
  }

  // openPrivacyPolicy() {
  //   window.open('/privacy-policy', '_blank');
  // }
}
