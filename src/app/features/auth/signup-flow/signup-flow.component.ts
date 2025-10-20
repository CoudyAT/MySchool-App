import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  IonBackButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
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
    // IonBackButton,
    // IonButtons,
    // IonIcon,
    // IonCard,
    // IonCardContent,
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
    private animationCtrl: AnimationController
  ) {
    addIcons({
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
    });
    this.initForms();
  }

  initForms() {
    this.welcomeForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.email]],
    });

    this.personalInfoForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', Validators.required],
    });

    this.userInfoForm = this.fb.group({
      country: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{8,}$/)],
      ],
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
        // && this.userData.acceptTerms &&
        // this.userData.acceptPrivacy
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
        this.userData.identifier = this.welcomeForm.value.identifier;
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
        identifier: this.userData.identifier,
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

  async completeSignup() {
    this.updateUserData();
    console.log('Données utilisateur complètes:', this.userData);

    // Simulation d'une API call
    try {
      // await this.authService.signup(this.userData);

      // Pour le développement local, on sauvegarde dans localStorage
      localStorage.setItem('userSignedUp', 'true');
      localStorage.setItem('userData', JSON.stringify(this.userData));

      // Navigation vers le dashboard
      this.router.navigate(['/courses'], { replaceUrl: true });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      // Gérer l'erreur (afficher un toast, etc.)
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
}
