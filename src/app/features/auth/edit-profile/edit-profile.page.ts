import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { ToastController, LoadingController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonButtons,
  IonTitle,
  IonSpinner,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  personOutline,
  cardOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  languageOutline,
  eyeOutline,
  documentTextOutline,
  helpCircleOutline,
  peopleOutline,
  logOutOutline,
  cameraOutline,
  chevronForwardOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonButtons,
    IonTitle,
    IonSpinner,
    CommonModule,
    FormsModule,
  ],
})
export class EditProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photoURL: '',
  };

  isSaving = false;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      personOutline,
      cardOutline,
      notificationsOutline,
      shieldCheckmarkOutline,
      languageOutline,
      eyeOutline,
      documentTextOutline,
      helpCircleOutline,
      peopleOutline,
      logOutOutline,
      cameraOutline,
      chevronForwardOutline,
      chevronBackOutline,
    });
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  private async saveUserDocument(userId: string, data: any): Promise<void> {
    const userRef = doc(this.firestore, 'utilisateur', userId);

    // Utiliser setDoc avec merge: true pour créer ou mettre à jour sans écraser
    await setDoc(
      userRef,
      {
        ...data,
        uid: userId, // Toujours inclure l'UID
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log('✅ Document sauvegardé:', data);
  }

  private async uploadProfileImage(
    userId: string,
    file: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const base64Image = e.target.result;

          // Sauvegarder l'image dans le document existant
          await this.saveUserDocument(userId, {
            profileImageBase64: base64Image,
            profileImageUpdated: new Date(),
          });

          resolve(base64Image);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async loadUserData() {
    try {
      const localUser = JSON.parse(
        localStorage.getItem('currentUser') || 'null'
      );
      if (localUser && localUser.uid) {
        console.log('🔄 Chargement des données pour:', localUser.uid);

        // D'abord charger depuis localStorage
        this.profileForm = {
          firstName: localUser.firstName || '',
          lastName: localUser.lastName || '',
          email: localUser.email || '',
          phone: localUser.phone || '',
          photoURL: localUser.photoURL || '',
        };

        // Ensuite charger depuis Firestore
        await this.loadFromFirestore(localUser.uid);
      }
    } catch (error) {
      console.error('💥 Erreur chargement données:', error);
    }
  }

  private async loadFromFirestore(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'utilisateur', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📄 Données Firestore:', userData);

        // Fusionner avec les données existantes (Firestore prioritaire)
        if (userData?.['firstName'])
          this.profileForm.firstName = userData['firstName'];
        if (userData?.['lastName'])
          this.profileForm.lastName = userData['lastName'];
        if (userData?.['phone']) this.profileForm.phone = userData['phone'];
        if (userData?.['email']) this.profileForm.email = userData['email'];

        // Gérer l'image
        if (userData?.['profileImageBase64']) {
          this.profileForm.photoURL = userData['profileImageBase64'];
        } else if (userData?.['photoURL']) {
          this.profileForm.photoURL = userData['photoURL'];
        }
      } else {
        console.log('📭 Aucun document trouvé, création initiale...');
        // Créer le document avec les données actuelles
        await this.saveUserDocument(userId, {
          firstName: this.profileForm.firstName,
          lastName: this.profileForm.lastName,
          email: this.profileForm.email,
          phone: this.profileForm.phone,
          photoURL: this.profileForm.photoURL,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('💥 Erreur chargement Firestore:', error);
    }
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  selectImage() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showToast('Veuillez sélectionner une image valide', 'warning');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showToast("L'image ne doit pas dépasser 5MB", 'warning');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.photoURL = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    if (!this.profileForm.firstName || !this.profileForm.lastName) {
      this.showToast(
        'Veuillez remplir tous les champs obligatoires',
        'warning'
      );
      return;
    }

    this.isSaving = true;
    const loading = await this.loadingCtrl.create({
      message: 'Enregistrement en cours...',
    });
    await loading.present();

    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = userData.uid;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('💾 Sauvegarde profil pour:', userId);

      let photoURL = this.profileForm.photoURL;

      // Sauvegarder l'image si nouvelle sélection
      if (this.selectedFile) {
        photoURL = await this.uploadProfileImage(userId, this.selectedFile);
      }

      // Sauvegarder les données du profil
      await this.saveProfileData(userId, photoURL);

      // Mise à jour dans localStorage
      this.updateLocalStorage(photoURL);

      await loading.dismiss();
      this.isSaving = false;

      this.showToast('Profil mis à jour avec succès ✅', 'success');

      // ✅ Navigation simple - ionViewWillEnter s'occupera du rechargement
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('💥 Erreur sauvegarde profil:', error);
      await loading.dismiss();
      this.isSaving = false;
      this.showToast('Erreur lors de la mise à jour du profil ❌', 'danger');
    }
  }



  private async saveProfileData(
    userId: string,
    photoURL: string
  ): Promise<void> {
    const profileData: any = {
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      phone: this.profileForm.phone,
      email: this.profileForm.email,
    };

    // Gérer l'image
    if (photoURL !== this.profileForm.photoURL) {
      if (photoURL.startsWith('data:')) {
        profileData.profileImageBase64 = photoURL;
        profileData.profileImageUpdated = new Date();
      } else {
        profileData.photoURL = photoURL;
      }
    }

    await this.saveUserDocument(userId, profileData);
  }

  private updateLocalStorage(photoURL: string): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentUser,
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      phone: this.profileForm.phone,
      photoURL: photoURL,
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    console.log('💾 localStorage mis à jour');
  }

  private async showToast(
    message: string,
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: color as any,
    });
    await toast.present();
  }

  // Méthode de debug
  async debugFirestore() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = userData.uid;

    if (userId) {
      const userRef = doc(this.firestore, 'utilisateur', userId);
      const userDoc = await getDoc(userRef);

      console.log('🔍 DEBUG Firestore:');
      console.log('Document existe:', userDoc.exists());
      console.log('Données:', userDoc.data());
      console.log('Données locales:', this.profileForm);
    }
  }
}
