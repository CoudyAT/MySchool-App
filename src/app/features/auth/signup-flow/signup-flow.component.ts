import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  Auth,
  ConfirmationResult,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInAnonymously,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  collection,
  addDoc,
  deleteDoc,
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
  IonCard,
  IonCardContent,
  ToastController,
  AnimationController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBack,
  checkmarkCircle,
  library,
  person,
  mail,
  calendar,
  location,
  call,
  business,
  school,
  sync,
  phonePortraitOutline,
  callOutline,
  paperPlaneOutline,
  shieldCheckmarkOutline,
  keypadOutline,
  informationCircleOutline,
  arrowForward,
  logIn,
  calendarOutline,
  flagOutline,
  alertCircleOutline,
  locationOutline,
  businessOutline,
  mapOutline,
} from 'ionicons/icons';
import { nations } from 'src/app/shared/utils/nations';

interface UserData {
  identifier: string;
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupFlowComponent {
  currentStep = 0;
  totalSteps = 4;
  countries = nations;
  isAnimating = false;
  maxDate = new Date().toISOString(); // Aujourd'hui
  minDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 100)
  ).toISOString(); // Il y a 100 ans
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  // Formulaires pour chaque étape
  welcomeForm!: FormGroup;
  personalInfoForm!: FormGroup;
  userInfoForm!: FormGroup;
  objectivesForm!: FormGroup;
  recaptchaVerifier!: RecaptchaVerifier | null;
  confirmationResult!: ConfirmationResult | null;
  verificationCode = '';
  isCodeSent = false;
  private isOtpVerified = false;
  private isCodeSending = false;

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
    identifier: '',
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
      paperPlaneOutline,
      checkmarkCircle,
      shieldCheckmarkOutline,
      keypadOutline,
      informationCircleOutline,
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
      phonePortraitOutline,
      calendar,
      call,
      mail,
      library,
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
    this.recaptchaVerifier = null;
    this.initForms();
  }

  initForms() {
    this.welcomeForm = this.fb.group({
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{8,}$/)],
      ],
    });

    this.personalInfoForm = this.fb.group({
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{8,}$/)],
      ],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', Validators.required],
    });

    this.userInfoForm = this.fb.group({
      country: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      profession: ['', Validators.required],
      school: [''],
    });

    this.objectivesForm = this.fb.group({});
  }

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

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.welcomeForm.valid;
      case 1:
        return this.personalInfoForm.valid;
      case 2:
        return this.userInfoForm.valid;
      case 3:
        return this.availableObjectives.some((obj) => obj.selected);
      default:
        return false;
    }
  }

  updateUserData() {
    switch (this.currentStep) {
      case 0:
        this.userData.phone = this.welcomeForm.value.phone;
        break;
      case 1:
        Object.assign(this.userData, this.personalInfoForm.value);
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
      if (phone) {
        this.personalInfoForm.patchValue({ phone });
      }
      console.log('Pré-remplissage du téléphone:', phone);
    }
  }

  prefillCurrentStep() {
    if (this.currentStep === 0) {
      this.welcomeForm.patchValue({ identifier: this.userData.identifier });
    }
  }

  toggleObjective(objectiveId: string) {
    const objective = this.availableObjectives.find(
      (o) => o.id === objectiveId
    );
    if (objective) {
      objective.selected = !objective.selected;
    }
  }

  getProgressPercentage(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  getCurrentStepTitle(): string {
    const titles = [
      'Bienvenue dans MySchool',
      'Créer votre compte gratuit',
      'Créer votre compte gratuit',
      'Quels sont vos objectifs ?',
    ];
    return titles[this.currentStep];
  }

  getCurrentStepSubtitle(): string {
    const subtitles = [
      'Connectez-vous ou créez un compte',
      'Informations personnelles',
      "Informations de l'utilisateur",
      '',
    ];
    return subtitles[this.currentStep];
  }

  getButtonText(): string {
    return this.currentStep === this.totalSteps - 1
      ? 'Commencer !'
      : 'Continuer';
  }

  getButtonColor(): string {
    return this.currentStep === this.totalSteps - 1 ? 'success' : 'primary';
  }

  // Validation helpers
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) return `Ce champ est requis`;
      if (field.errors['email']) return `Format d'email invalide`;
      if (field.errors['minlength']) return `Trop court`;
      if (field.errors['pattern']) return `Format invalide`;
    }
    return '';
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  getSelectedObjectivesCount(): number {
    return this.availableObjectives.filter((obj) => obj.selected).length;
  }

  generatePasswordFromData(): string {
    const namePart = this.userData.firstName?.slice(0, 3) || 'usr';
    const rand = Math.floor(Math.random() * 10000);
    return `${namePart}${rand}`;
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

  // Étape 1 : Envoi du code WhatsApp
  async sendVerificationCode() {
    if (this.isCodeSending) return;

    this.isCodeSending = true;
    this.isAnimating = true;

    const phone = this.welcomeForm.value.phone?.replace(/\D/g, '');
    if (!phone || phone.length < 10) {
      await this.showToast('Numéro invalide', 'danger');
      this.isCodeSending = false;
      this.isAnimating = false;
      return;
    }

    try {
      // Génère OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Sauvegarde dans Firestore (temp_otps)
      const otpRef = doc(this.firestore, 'temp_otps', phone);
      await setDoc(otpRef, {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      });

      // Ouvre WhatsApp
      const message = `Votre code MySchool : *${otp}*\nValable 5 minutes.`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, '_blank');

      this.isCodeSent = true;
      await this.showToast('Ouvrez WhatsApp pour voir le code', 'success');
    } catch (error: any) {
      await this.showToast('Erreur envoi code', 'danger');
      console.error(error);
    } finally {
      this.isCodeSending = false;
      this.isAnimating = false;
    }
  }

  // Étape 2 : Vérification du code
  async verifyCodeAndContinue() {
    this.isAnimating = true;

    const phone = this.welcomeForm.value.phone?.replace(/\D/g, '');
    const enteredCode = this.verificationCode.trim();

    if (!phone || !enteredCode) {
      await this.showToast('Veuillez entrer le code', 'danger');
      this.isAnimating = false;
      return;
    }

    try {
      const otpDoc = await getDoc(doc(this.firestore, 'temp_otps', phone));
      if (!otpDoc.exists()) {
        throw new Error('Code expiré ou inexistant');
      }

      const data = otpDoc.data();
      const now = new Date();

      if (data['code'] !== enteredCode || data['expiresAt'].toDate() < now) {
        throw new Error('Code invalide ou expiré');
      }

      // OTP VALIDE → SUPPRIME ET AUTORISE LA SUITE
      await deleteDoc(doc(this.firestore, 'temp_otps', phone));
      this.isOtpVerified = true; // Autorise l'inscription

      this.currentStep = 1;
      this.prefillNextStep();

      await this.showToast('Code vérifié !', 'success');
    } catch (error: any) {
      await this.showToast(error.message || 'Code invalide', 'danger');
      console.error(error);
    } finally {
      this.isAnimating = false;
    }
  }

  // Étape 3 : Finalisation de l'inscription
  async completeSignup() {
    // BLOQUE SI OTP NON VÉRIFIÉ
    if (!this.isOtpVerified) {
      await this.showToast("Veuillez d'abord vérifier votre code", 'danger');
      this.router.navigate(['/welcome'], { replaceUrl: true });
      return;
    }

    this.updateUserData();

    try {
      const phone = this.userData.phone?.replace(/\D/g, '');
      if (!phone) {
        await this.showToast('Numéro de téléphone invalide', 'danger');
        return;
      }

      // Référence à la collection
      const usersCollection = collection(this.firestore, 'utilisateur');

      // Vérifie si un utilisateur avec ce numéro existe déjà
      const phoneQuery = query(usersCollection, where('phone', '==', phone));
      const querySnapshot = await getDocs(phoneQuery);

      if (!querySnapshot.empty) {
        await this.showToast('Cet utilisateur existe déjà.', 'danger');
        return;
      }

      // Crée un utilisateur anonyme si nécessaire
      let authUser = this.auth.currentUser;
      if (!authUser) {
        const userCredential = await signInAnonymously(this.auth);
        authUser = userCredential.user;
        console.log('Connecté anonymement:', authUser.uid);
      }

      // Prépare les données utilisateur
      const userDataToSave: any = {
        uid: authUser.uid,
        phone: phone,
        firstName: this.userData.firstName || '',
        lastName: this.userData.lastName || '',
        level: 'beginner',
        login: phone,
        password: this.generatePasswordFromData(),
        createdAt: new Date(),
        role: { libelle: 'student' },
        specializationId: null,
        status: 'active',
      };

      // AJOUTE avec ID auto-généré
      const userRef = await addDoc(usersCollection, userDataToSave);
      console.log('Utilisateur créé avec ID:', userRef.id);

      // Succès
      await this.showToast('Inscription réussie !', 'success');
      this.router.navigate(['/courses'], { replaceUrl: true });
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      await this.showToast(`Erreur: ${error.message}`, 'danger');
    }
  }

  onVerificationCodeChange(event: any) {
    this.verificationCode = event.detail.value;
    console.log('Code saisi:', this.verificationCode);
  }

  openDatePicker() {
    // Ouvre le sélecteur de date natif
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

    // Convertir la date au format français (jj/mm/aaaa)
    const date = new Date(dateValue);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}


