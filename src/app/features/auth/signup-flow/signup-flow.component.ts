import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  Auth,
  ConfirmationResult,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, Timestamp, collection, addDoc, deleteDoc } from '@angular/fire/firestore';
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
} from 'ionicons/icons';

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
    IonCard,
    IonCardContent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupFlowComponent {
  currentStep = 0;
  totalSteps = 4;
  isAnimating = false;

  // Formulaires pour chaque étape
  welcomeForm!: FormGroup;
  personalInfoForm!: FormGroup;
  userInfoForm!: FormGroup;
  objectivesForm!: FormGroup;
  recaptchaVerifier!: RecaptchaVerifier | null;
  confirmationResult!: ConfirmationResult | null;
  verificationCode = '';
  isCodeSent = false;

  countries = [
    'France',
    'Sénégal',
    "Côte d'Ivoire",
    'Mali',
    'Burkina Faso',
    'Niger',
    'Guinée',
    'Tchad',
    'Autre',
  ];

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
      phonePortraitOutline,
      callOutline,
      paperPlaneOutline,
      checkmarkCircle,
      shieldCheckmarkOutline,
      keypadOutline,
      informationCircleOutline,
      arrowForward,
      person,
      calendar,
      location,
      call,
      business,
      school,
      sync,
      mail,
      library,
    });
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
      this.personalInfoForm.patchValue({
        phone: this.userData.phone,
      });
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

  // async completeSignup() {
  //   this.updateUserData();
  //   console.log('📦 Données utilisateur complètes:', this.userData);

  //   try {
  //     const user = this.auth.currentUser; // 🔹 L’utilisateur connecté via téléphone

  //     if (!user) {
  //       await this.showToast(
  //         'Aucun utilisateur connecté. Veuillez vous reconnecter.',
  //         'danger'
  //       );
  //       return;
  //     }

  //     // 🔥 1. Sauvegarde des données utilisateur dans Firestore
  //     await setDoc(doc(this.firestore, 'users', user.uid), {
  //       uid: user.uid,
  //       phone: this.userData.phone,
  //       firstName: this.userData.firstName,
  //       lastName: this.userData.lastName,
  //       birthDate: this.userData.birthDate,
  //       country: this.userData.country,
  //       address: this.userData.address,
  //       profession: this.userData.profession,
  //       school: this.userData.school,
  //       objectives: this.userData.objectives,
  //       createdAt: new Date(),
  //     });

  //     console.log('✅ Profil utilisateur enregistré avec succès !');

  //     await this.showToast('Inscription réussie ✅', 'success');

  //     // 🔹 2. Redirection vers la page d’accueil
  //     this.router.navigate(['/courses'], { replaceUrl: true });
  //   } catch (error: any) {
  //     console.error('❌ Erreur lors de la sauvegarde Firestore :', error);
  //     await this.showToast(`Erreur : ${error.message}`, 'danger');
  //   }
  // }

  // async completeSignup() {
  //   this.updateUserData();

  //   try {
  //     let userUid: string;
  //     let isAuthenticated = false;

  //     const authUser = this.auth.currentUser;
  //     if (authUser) {
  //       userUid = authUser.uid;
  //       isAuthenticated = true;
  //       console.log('✅ Utilisateur authentifié:', userUid);

  //       // Force refresh token
  //       await authUser.getIdToken(true);
  //     } else {
  //       userUid = this.generateUniqueId();
  //       console.log('🆕 Utilisateur non authentifié:', userUid);
  //     }

  //     const userDataToSave: any = {
  //       uid: userUid,
  //       phone: this.userData.phone,
  //       firstName: this.userData.firstName,
  //       lastName: this.userData.lastName,
  //       level: 'beginner',
  //       login: null,
  //       password: this.generatePasswordFromData(),
  //       createdAt: Timestamp.fromDate(new Date()),
  //       role: { libelle: 'student' },
  //       specializationId: null,
  //       status: 'active',
  //     };

  //     console.log('🟢 Avant setDoc', userUid);
  //     await setDoc(doc(this.firestore, 'utilisateur', userUid), userDataToSave);
  //     console.log('🟢 Document écrit avec succès');

  //     const message = isAuthenticated
  //       ? 'Inscription réussie ✅'
  //       : 'Profil créé avec succès 🔥';

  //     await this.showToast(message, 'success');
  //     this.router.navigate(['/courses'], { replaceUrl: true });
  //   } catch (error: any) {
  //     console.error('❌ Erreur Firestore:', error);
  //     console.error('Code:', error.code);
  //     console.error('Message:', error.message);
  //     await this.showToast(`Erreur: ${error.message}`, 'danger');
  //   }
  // }

  async completeSignup() {
    this.updateUserData();

    try {
      const authUser = this.auth.currentUser;

      if (!authUser) {
        await this.showToast(
          'Utilisateur non connecté. Veuillez vous reconnecter.',
          'danger'
        );
        return;
      }

      // 1. FORCE LE TOKEN (CRUCIAL)
      const idToken = await authUser.getIdToken(true);
      console.log('Token rafraîchi:', idToken ? 'OK' : 'ÉCHEC');

      // 2. VÉRIFIE QUE L'UTILISATEUR EST BIEN AUTHENTIFIÉ
      if (!authUser.uid) {
        throw new Error('UID manquant');
      }

      const userDataToSave: any = {
        uid: authUser.uid,
        phone: this.userData.phone,
        firstName: this.userData.firstName,
        lastName: this.userData.lastName,
        level: 'beginner',
        login: null,
        password: this.generatePasswordFromData(),
        createdAt: new Date(),
        role: { libelle: 'student' },
        specializationId: null,
        status: 'active',
      };

      console.log('Avant setDoc - UID:', authUser.uid);
      await setDoc(
        doc(this.firestore, 'utilisateur', authUser.uid),
        userDataToSave
      );
      console.log('Document écrit avec succès');

      await this.showToast('Inscription réussie', 'success');
      this.router.navigate(['/courses'], { replaceUrl: true });
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      await this.showToast(`Erreur: ${error.message}`, 'danger');
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
    color: 'success' | 'danger' | 'primary' = 'primary'
  ) {
    const t = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await t.present();
  }

  // Ajoutez cette propriété pour stocker les infos de session
  private verificationSession: any;

  // Méthode pour envoyer le code (à vérifier aussi)
  // async sendVerificationCode() {
  //   try {
  //     this.isAnimating = true;

  //     // Format du numéro (assurez-vous qu'il est au format international)
  //     console.log('Numéro avant formatage:', this.welcomeForm.value.phone);

  //     const phone = this.welcomeForm.value.phone;

  //     // Configuration pour le recaptcha
  //     const applicationVerifier = new RecaptchaVerifier(
  //       this.auth,
  //       'recaptcha-container',
  //       {
  //         size: 'invisible',
  //         callback: (response: string) => {
  //           console.log('reCAPTCHA résolu:', response);
  //         },
  //       }
  //     );

  //     // Envoi du code SMS
  //     const confirmationResult = await signInWithPhoneNumber(
  //       this.auth,
  //       phone,
  //       applicationVerifier
  //     );

  //     // Stockez la confirmation pour la vérification
  //     this.confirmationResult = confirmationResult;

  //     console.log('ConfirmationResult:', confirmationResult);

  //     await this.showToast('Code SMS envoyé !', 'success');
  //     this.isCodeSent = true;
  //   } catch (error: any) {
  //     console.error('Erreur envoi code:', error);
  //     let errorMessage = "Erreur lors de l'envoi du code.";

  //     if (error.code === 'auth/invalid-phone-number') {
  //       errorMessage = 'Numéro de téléphone invalide.';
  //     } else if (error.code === 'auth/too-many-requests') {
  //       errorMessage = 'Trop de tentatives. Réessayez plus tard.';
  //     }

  //     await this.showToast(errorMessage, 'danger');
  //   } finally {
  //     this.isAnimating = false;
  //   }
  // }

  async sendVerificationCode() {
    this.isAnimating = true;

    const phone = this.welcomeForm.value.phone?.replace(/\D/g, ''); // Enlève espaces, etc.
    if (!phone) {
      await this.showToast('Numéro invalide', 'danger');
      this.isAnimating = false;
      return;
    }

    // 1. GÉNÈRE UN OTP (6 chiffres)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. SAUVEGARDE L'OTP DANS FIRESTORE (pour vérification)
    const otpRef = doc(this.firestore, 'temp_otps', phone);
    await setDoc(otpRef, {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    // 3. OUVRE WHATSAPP AVEC LE MESSAGE
    const message = `Votre code MySchool : *${otp}*\nValable 5 minutes.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    // Ouvre WhatsApp (mobile) ou WhatsApp Web (desktop)
    window.open(whatsappUrl, '_blank');

    this.isCodeSent = true;
    await this.showToast('Ouvrez WhatsApp pour voir le code', 'success');
    this.isAnimating = false;
  }

  onVerificationCodeChange(event: any) {
    this.verificationCode = event.detail.value;
    console.log('Code saisi:', this.verificationCode);
  }

  // Méthode corrigée pour vérifier le code

  // async verifyCodeAndContinue() {
  //   try {
  //     this.isAnimating = true;

  //     if (!this.confirmationResult) {
  //       await this.showToast('Aucun code à vérifier.', 'danger');
  //       return;
  //     }

  //     // 1. Vérifie le code SMS
  //     const result = await this.confirmationResult.confirm(
  //       this.verificationCode
  //     );
  //     const user = result.user;

  //     console.log('✅ Authentifié :', user.phoneNumber);
  //     this.userData.phone = user.phoneNumber ?? '';

  //     // 2. VÉRIFIE SI L'UTILISATEUR EXISTE DÉJÀ DANS FIRESTORE
  //     const userDocRef = doc(this.firestore, 'utilisateur', user.uid);
  //     const userSnap = await getDoc(userDocRef);

  //     if (userSnap.exists()) {
  //       // UTILISATEUR EXISTE → DIRECT /courses
  //       console.log('Utilisateur déjà inscrit → Redirection /courses');
  //       await this.showToast('Bienvenue de retour !', 'success');
  //       this.router.navigate(['/courses'], { replaceUrl: true });
  //       return;
  //     }

  //     // 3. UTILISATEUR NOUVEAU → Passe à l'étape suivante
  //     await this.showToast('Nouveau ? Complétez votre profil', 'primary');
  //     this.currentStep = 1;
  //     this.prefillNextStep();
  //   } catch (error: any) {
  //     console.error('❌ Erreur:', error);
  //     await this.showToast('Code invalide ou expiré.', 'danger');
  //   } finally {
  //     this.isAnimating = false;
  //   }
  // }

  async verifyCodeAndContinue() {
    this.isAnimating = true;

    const phone = this.welcomeForm.value.phone?.replace(/\D/g, '');
    const enteredCode = this.verificationCode;

    try {
      const otpDoc = await getDoc(doc(this.firestore, 'temp_otps', phone));
      if (!otpDoc.exists()) {
        throw new Error('Code expiré');
      }

      const data = otpDoc.data();
      if (data['code'] !== enteredCode || data['expiresAt'].toDate() < new Date()) {
        throw new Error('Code invalide');
      }

      // SUPPRIME L'OTP
      await deleteDoc(doc(this.firestore, 'temp_otps', phone));

      // CRÉE L'UTILISATEUR FIREBASE (custom token ou lien)
      // → Tu peux garder ton login SMS, ou passer à custom token plus tard

      this.currentStep = 1;
      this.prefillNextStep();
    } catch (error) {
      await this.showToast('Code invalide ou expiré', 'danger');
    } finally {
      this.isAnimating = false;
    }
  }

  // Sauvegarde locale en cas de problème Firestore
  private saveUserDataLocally(user: any) {
    const userData = {
      uid: user.uid,
      phone: user.phoneNumber,
      createdAt: new Date(),
      pendingSync: true,
    };
    localStorage.setItem('pendingUserData', JSON.stringify(userData));
  }
}
