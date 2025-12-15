import { Component, CUSTOM_ELEMENTS_SCHEMA, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { runInInjectionContext, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
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
} from '@angular/fire/auth';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { call } from 'ionicons/icons';

@Component({
  selector: 'app-phone-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonButton, IonInput],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements OnInit {
  private injector = inject(Injector);
  phoneForm: FormGroup;
  loading = false;
  recaptchaVerifier!: RecaptchaVerifier;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {
    addIcons({ call });
    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+\d{6,15}$/)]],
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.recaptchaVerifier = new RecaptchaVerifier(
        this.auth,
        'recaptcha-container',
        { size: 'invisible' }
      );
    }, 500);
  }

  // async submitPhone() {
  //   const phone = this.phoneForm.value.phone;
  //   this.loading = true;

  //   try {
  //     // Vérifier si le numéro existe déjà dans Firestore
  //     const usersRef = collection(this.firestore, 'users');
  //     const q = query(usersRef, where('phone', '==', phone));
  //     const querySnapshot = await getDocs(q);

  //     // Si le numéro existe -> aller à la vérification OTP
  //     if (!querySnapshot.empty) {
  //       const confirmationResult = await signInWithPhoneNumber(
  //         this.auth,
  //         phone,
  //         this.recaptchaVerifier
  //       );

  //       window.localStorage.setItem(
  //         'confirmationResult',
  //         JSON.stringify(confirmationResult)
  //       );
  //       window.localStorage.setItem('userPhone', phone);

  //       this.router.navigate(['/verify-code']);
  //     } else {
  //       // Sinon -> aller vers le flux d’inscription
  //       this.router.navigate(['/signup-flow'], {
  //         queryParams: { phone },
  //       });
  //     }
  //   } catch (error: any) {
  //     console.error('Erreur lors de la vérification du numéro :', error);
  //     alert(error.message);
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  async submitPhone() {
    const phone = this.phoneForm.value.phone;
    this.loading = true;

    try {
      await runInInjectionContext(this.injector, async () => {
        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where('phone', '==', phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const confirmationResult = await signInWithPhoneNumber(
            this.auth,
            phone,
            this.recaptchaVerifier
          );

          window.localStorage.setItem(
            'confirmationResult',
            JSON.stringify(confirmationResult)
          );
          window.localStorage.setItem('userPhone', phone);
          this.router.navigate(['/verify-code']);
        } else {
          // this.router.navigate(['/signup'], { queryParams: { phone } });
        }
      });
    } catch (error: any) {
      console.error('Erreur Firebase :', error);
      alert(error.message);
    } finally {
      this.loading = false;
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.phoneForm.get(fieldName);
    if (field?.errors?.['required']) return 'Numéro requis';
    if (field?.errors?.['pattern'])
      return 'Format de numéro invalide (+221...)';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.phoneForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }
}

