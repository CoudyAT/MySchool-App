import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkCircleOutline,
  starOutline,
  trophyOutline,
  shieldCheckmarkOutline,
  downloadOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router'; // Ajoutez Router

@Component({
  selector: 'app-premium-modal',
  templateUrl: './preminum-modal.component.html',
  styleUrls: ['./preminum-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
  ],
})
export class PreminumModalComponent implements OnInit {
  premiumFeatures = [
    {
      icon: 'checkmark-circle-outline',
      title: 'Accès illimité',
      description: "A trois cours d'une categorie",
    },
    {
      icon: 'download-outline',
      title: 'Téléchargement',
      description: 'Téléchargez vos cours pour apprendre hors ligne',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Certificats Premium',
      description: 'Obtenez des certificats reconnus pour vos formations',
    },
    {
      icon: 'trophy-outline',
      title: 'Assistance AI',
      description: 'Assistance dédiée et réponses rapides à vos questions',
    },
  ];
  currentUser: any = null;

  constructor(
    private modalCtrl: ModalController,
    private firestore: Firestore,
    private router: Router, // Injectez Router
  ) {
    addIcons({
      closeOutline,
      checkmarkCircleOutline,
      starOutline,
      trophyOutline,
      shieldCheckmarkOutline,
      downloadOutline,
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  // subscribeToPremium() {
  //   console.log('🚀 Redirection vers la page de paiement Premium...');

  //   // Fermer le modal d'abord
  //   this.modalCtrl.dismiss();

  //   // Rediriger vers la page de méthode de paiement avec les infos Premium
  //   this.router.navigate(['/payment-method'], {
  //     state: {
  //       plan: {
  //         type: 'MONTHLY',
  //         name: 'Abonnement Premium',
  //         price: 5000,
  //         description: 'Accès illimité à tous les cours',
  //         features: [
  //           'Tous les cours disponibles',
  //           'Contenus exclusifs',
  //           'Téléchargement hors ligne',
  //           'Certificats Premium',
  //           'Support prioritaire',
  //         ],
  //       },
  //       isPremiumSubscription: true, // Flag pour identifier que c'est un abonnement Premium
  //     },
  //   });
  // }

  async loadUserData() {
    try {
      const localUser = JSON.parse(
        localStorage.getItem('currentUser') || 'null',
      );
      if (localUser && localUser.uid) {
        // Charger d'abord depuis localStorage
        this.currentUser = localUser;

        // Ensuite charger depuis Firestore pour avoir les données à jour
        await this.loadFromFirestore(localUser.uid);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  private async loadFromFirestore(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'utilisateur', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // console.log('📄 Données Firestore chargées:', userData);

        // Fusionner avec les données existantes
        if (userData?.['firstName'])
          this.currentUser.firstName = userData['firstName'];
        if (userData?.['lastName'])
          this.currentUser.lastName = userData['lastName'];
        if (userData?.['phone']) this.currentUser.phone = userData['phone'];
        if (userData?.['email']) this.currentUser.email = userData['email'];

        // Gérer l'image - priorité à profileImageBase64
        if (userData?.['profileImageBase64']) {
          this.currentUser.photoURL = userData['profileImageBase64'];
        } else if (userData?.['photoURL']) {
          this.currentUser.photoURL = userData['photoURL'];
        }

        // Mettre à jour localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
    } catch (error) {
      console.error('Erreur lors du chargement Firestore:', error);
    }
  }

  // subscribeToPremium() {
  //   // Fermer le modal
  //   this.modalCtrl.dismiss();

  //   // Rediriger vers page sélection cours premium
  //   this.router.navigate(['/premium-course-selection'], {
  //     state: {
  //       isPremiumFlow: true,
  //     },
  //   });
  // }

  subscribeToPremium() {
    // Fermer le modal
    this.modalCtrl.dismiss();
    console.log('eee', this.currentUser?.niveauScolaire);

    // Cas ÉLÉMENTAIRE → redirection directe vers payment-method (abonnement classe)
    if (this.currentUser?.niveauScolaire === 'ELEMENTAIRE') {
      this.router.navigate(['/payment-method'], {
        state: {
          isPremiumFlow: true,
          method: 'premium',
          plan: {
            type: 'ANNUAL',
            name: `Abonnement ${this.currentUser.classe}`,
            price: 5000,
            currency: 'XOF',
          },
          isClasseSubscription: true,
          classe: this.currentUser.classe,
          niveauScolaire: this.currentUser.niveauScolaire,
        },
      });
      return;
    }

    // Autres niveaux → sélection des matières
    this.router.navigate(['/premium-course-selection'], {
      state: {
        isPremiumFlow: true,
      },
    });
  }
}
