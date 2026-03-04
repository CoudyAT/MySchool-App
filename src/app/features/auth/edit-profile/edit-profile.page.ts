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
  IonLabel,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  personOutline,
  cardOutline,
  notificationsOutline,
  shieldCheckmarkOutline,
  languageOutline,
  eyeOutline,
  eyeOffOutline,
  documentTextOutline,
  helpCircleOutline,
  peopleOutline,
  logOutOutline,
  cameraOutline,
  chevronForwardOutline,
  chevronBackOutline,
  lockClosedOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { updateDoc } from 'firebase/firestore';

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

  // États pour la visibilité
  isSaving = false;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      chevronBackOutline,
      cameraOutline,
      lockClosedOutline,
      personOutline,
      cardOutline,
      notificationsOutline,
      shieldCheckmarkOutline,
      languageOutline,
      eyeOutline,
      eyeOffOutline,
      documentTextOutline,
      helpCircleOutline,
      peopleOutline,
      logOutOutline,
      chevronForwardOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  canSave(): boolean {
    return !!this.profileForm.firstName && !!this.profileForm.lastName;
  }

  private async saveUserDocument(userId: string, data: any): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'utilisateur', userId);

      console.log('📤 Chemin Firestore:', userRef.path);
      console.log('📊 Données à sauvegarder:', data);

      await setDoc(
        userRef,
        {
          ...data,
          uid: userId,
          updatedAt: new Date(),
        },
        { merge: true } // ✔️ fonctionne ici
      );

      console.log('✅ Document créé/mis à jour avec setDoc(merge: true)');
    } catch (error: any) {
      console.error('💥 Erreur saveUserDocument:', error);
      throw error;
    }
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

        // Récupérer le mot de passe actuel
        // if (userData?.['password'])
        //   this.profileForm.currentPasswordInDB = userData['password'];

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
        //  password: this.profileForm.currentPasswordInDB,
          photoURL: this.profileForm.photoURL,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('💥 Erreur chargement Firestore:', error);
    }
  }

  goBack() {
    this.router.navigate(['/courses']);
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
    if (!this.canSave()) {
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
      let photoURL = this.profileForm.photoURL;

      // Sauvegarder l'image si nouvelle sélection
      if (this.selectedFile) {
        photoURL = await this.uploadProfileImage(userId, this.selectedFile);
      }

      // Sauvegarder les données du profil
      console.log('📤 Appel de saveProfileData...');
      await this.saveProfileData(
        userId,
        photoURL,
      //  newPassword,
       // passwordChanged
      );

      // Mise à jour dans localStorage
      this.updateLocalStorage(photoURL);

      // Rafraîchir les données locales
      await this.refreshUserData(userId);

      await loading.dismiss();
      this.isSaving = false;

      this.showToast('Profil mis à jour avec succès ✅', 'success');

      // Recharger la page pour les changements
      setTimeout(() => {
        this.router.navigate(['/profile']).then(() => {
          window.location.reload();
        });
      }, 1000);

      console.log('✅ ===== FIN SAUVEGARDE PROFIL =====');
    } catch (error: any) {
      console.error('💥 Erreur sauvegarde profil:', error);
      await loading.dismiss();
      this.isSaving = false;
      this.showToast(
        error.message || 'Erreur lors de la mise à jour du profil ❌',
        'danger'
      );
    }
  }

  private async refreshUserData(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'utilisateur', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Mettre à jour localStorage avec les dernières données
        const updatedUser = {
          ...userData,
          id: userDoc.id,
          uid: userId,
        };

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('🔄 Données rafraîchies depuis Firestore');

      }
    } catch (error) {
      console.error('Erreur rafraîchissement données:', error);
    }
  }

  private async saveProfileData(
    userId: string,
    photoURL: string,
  //  newPassword: string,
  //  passwordChanged: boolean
  ): Promise<void> {
    console.log('📊 ===== DÉBUT saveProfileData =====');
    console.log('👤 User ID:', userId);
    console.log('🖼️ Photo URL:', photoURL ? 'OUI' : 'NON');

    // D'abord, récupérer les données actuelles pour garder les autres champs
    const userRef = doc(this.firestore, 'utilisateur', userId);
    const userDoc = await getDoc(userRef);
    const currentData = userDoc.exists() ? userDoc.data() : {};

    console.log('📄 Données actuelles Firestore:', currentData);

    // Préparer les données de mise à jour
    const updateData: any = {
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      phone: this.profileForm.phone,
      email: this.profileForm.email || '',
      updatedAt: new Date(),
    };

    // Gérer l'image
    if (photoURL !== this.profileForm.photoURL) {
      if (photoURL.startsWith('data:')) {
        updateData.profileImageBase64 = photoURL;
        updateData.profileImageUpdated = new Date();
      } else {
        updateData.photoURL = photoURL;
      }
    }

    // Garder les autres champs importants
    if (currentData['level']) updateData.level = currentData['level'];
    if (currentData['login']) updateData.login = currentData['login'];
    if (currentData['role']) updateData.role = currentData['role'];
    if (currentData['specializationId'] !== undefined)
      updateData.specializationId = currentData['specializationId'];
    if (currentData['status']) updateData.status = currentData['status'];
    if (currentData['createdAt'])
      updateData.createdAt = currentData['createdAt'];

    // Toujours garder l'UID
    updateData.uid = userId;

    console.log('📤 Données finales à sauvegarder:', updateData);
    console.log('✅ ===== FIN saveProfileData =====');

    await this.saveUserDocument(userId, updateData);
  }

  private updateLocalStorage(photoURL: string): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentUser,
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      phone: this.profileForm.phone,
      email: this.profileForm.email,
      photoURL: photoURL,
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
}
