import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
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
} from 'ionicons/icons';
import { nations } from 'src/app/shared/utils/nations';

interface UserData {
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  phone: string;
  profession: string;
  birthDate: string;
  school: string;
  objectives: string[];
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  password: string;
  confirmPassword: string;
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
  currentStep = 1;
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

  // Nouveaux états
  isCheckingUser = false;
  userExistsError = false;

  welcomeForm!: FormGroup;
  personalInfoForm!: FormGroup;
  userInfoForm!: FormGroup;

  professions = [
    'Étudiant',
    'Employé',
    'Entrepreneur',
    'Fonctionnaire',
    'Enseignant',
    'Ingénieur',
    'Médecin',
    'Avocat',
    'Autre',
  ];

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

  userData: UserData = {
    firstName: '',
    lastName: '',
    country: '',
    address: '',
    phone: '',
    profession: '',
    birthDate: '',
    school: '',
    objectives: [],
    acceptTerms: false,
    acceptPrivacy: false,
    password: '',
    confirmPassword: '',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private animationCtrl: AnimationController,
    private auth: Auth,
    private firestore: Firestore,
    private toastCtrl: ToastController
  ) {
    addIcons({
      chevronBack,
      callOutline,
      checkmarkCircle,
      arrowForward,
      person,
      calendarOutline,
      flagOutline,
      alertCircleOutline,
      locationOutline,
      businessOutline,
      mapOutline,
      sync,
      location,
      business,
      school,
      calendar,
      call,
      library,
      lockClosedOutline,
    });

    // Date maximale : 18 ans en arrière
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    this.maxDate = eighteenYearsAgo.toISOString().split('T')[0];

    // Date minimale : 100 ans en arrière
    const hundredYearsAgo = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
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
      }
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
    });

    this.userInfoForm = this.fb.group({
      country: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      profession: ['', Validators.required],
      school: [''],
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
        where('phone', '==', cleanPhone)
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
            'primary'
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
          JSON.stringify({ ...userData, id: userDoc.id })
        );
        localStorage.setItem('userPhone', cleanPhone);

        await this.showToast(
          `Bienvenue ${userData['firstName'] || ''} !`,
          'success'
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
          `translateX(${direction === 'forward' ? '-100%' : '100%'})`
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

        // Toujours prendre le bon password
        this.userData.password = this.personalInfoForm.value.password;
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
      (o) => o.id === objectiveId
    );
    if (objective) {
      objective.selected = !objective.selected;
    }
  }

  getSelectedObjectivesCount(): number {
    return this.availableObjectives.filter((obj) => obj.selected).length;
  }

  async sendOtp() {
    const phone = this.welcomeForm.value.phone;

    try {
      this.confirmationResult = await signInWithPhoneNumber(
        this.auth,
        phone,
        this.recaptchaVerifier
      );

      this.otpSent = true;
      await this.showToast('Code envoyé par SMS', 'success');
    } catch (error) {
      console.error(error);
      await this.showToast('Erreur lors de l’envoi du code', 'danger');
    }
  }

  async verifyOtp() {
    const code = this.otpForm.value.otp;

    try {
      const result = await this.confirmationResult.confirm(code);
      const firebaseUser = result.user;

      const phone = firebaseUser.phoneNumber;
      const cleanPhone = this.formatPhoneForSearch(phone || '');

      // 🔍 Vérifier si l'utilisateur existe en Firestore
      const usersRef = collection(this.firestore, 'utilisateur');
      const q = query(usersRef, where('phone', '==', cleanPhone));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // 🔐 Connexion
        const userDoc = snapshot.docs[0];
        localStorage.setItem(
          'currentUser',
          JSON.stringify({ ...userDoc.data(), id: userDoc.id })
        );

        await this.showToast('Connexion réussie', 'success');
        window.location.href = '/courses';
        return;
      }

      // 🆕 Nouvel utilisateur → inscription
      this.userData.phone = cleanPhone;
      this.personalInfoForm.patchValue({ phone: cleanPhone });

      this.currentStep = 1;
    } catch (error) {
      console.error(error);
      await this.showToast('Code incorrect', 'danger');
    }
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
          'danger'
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
        profession: this.userData.profession || '',
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
        })
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
    if (this.dateInput && this.dateInput.nativeElement) {
      this.dateInput.nativeElement.showPicker();
    }
  }

  onDateChange(event: any) {
    const selectedDate = event.target.value;
    this.personalInfoForm.patchValue({
      birthDate: selectedDate,
    });
  }

  getFormattedDate(): string {
    const dateValue = this.personalInfoForm.get('birthDate')?.value;
    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // =====================
  // Toast helper
  // =====================

  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary'
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
