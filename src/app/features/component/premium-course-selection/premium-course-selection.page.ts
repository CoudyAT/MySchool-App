import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { checkmarkCircle, arrowForwardOutline, lockClosedOutline } from 'ionicons/icons';

import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';
import { MatiereService } from 'src/app/features/services/matiere.service';
import { UserService } from '../../auth/services/user.service';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';

@Component({
  selector: 'app-premium-course-selection',
  templateUrl: './premium-course-selection.page.html',
  styleUrls: ['./premium-course-selection.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    DesktopHeaderComponent,
  ],
})
export class PremiumCourseSelectionPage implements OnInit, OnDestroy {
  matieres: any[] = [];
  selectedMatieres: any[] = [];
  alreadySubscribedMatieres: string[] = [];
  currentUser: any = null;
  userClasse!: any;
  userNiveau!: string;
  readonly MAX_SELECTION = 3;
  isLoading = true;
  private sub = new Subscription();

  constructor(
    private matiereService: MatiereService,
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private router: Router,
    private firestore: Firestore,
  ) {
    addIcons({checkmarkCircle,lockClosedOutline,arrowForwardOutline,});
  }

  ngOnInit() {
    this.loadUserData();
    this.loadUserAndMatieres();
    this.loadAlreadySubscribedMatieres();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

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

  loadUserAndMatieres() {
    const s = this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userClasse = this.currentUser.classe || user.classe;
        console.log('dddd', this.userClasse);
        this.userNiveau =
          this.currentUser.niveauScolaire || user.niveauScolaire;
        this.loadMatieres();
      },
      error: () => (this.isLoading = false),
    });

    this.sub.add(s);
  }

  loadMatieres() {
    console.log('dddd', this.userClasse);
    const s = this.matiereService
      .getMatiereByClasse(this.userClasse)
      .subscribe({
        next: (data) => {
          this.matieres = data;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });

    this.sub.add(s);
  }

  loadAlreadySubscribedMatieres() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!localUser || !localUser.uid) return;
    this.enrollmentService.getUserSubscriptions(localUser.uid).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // On filtre les abonnements du même niveau/classe
          const matieres = res.data
            .filter((sub: any) => sub.niveauScolaire === this.userNiveau && sub.classe === this.userClasse)
            .flatMap((sub: any) => sub.matieres || []);
          this.alreadySubscribedMatieres = matieres;
        }
      },
      error: () => {},
    });
  }

  isMatiereDisabled(matiere: any): boolean {
    return this.alreadySubscribedMatieres.includes(matiere.nom || matiere.name);
  }

  toggleMatiere(matiere: any) {
    if (this.isMatiereDisabled(matiere)) return;
    const exists = this.selectedMatieres.some((m) => m.id === matiere.id);

    if (exists) {
      this.selectedMatieres = this.selectedMatieres.filter(
        (m) => m.id !== matiere.id,
      );
    } else {
      if (this.selectedMatieres.length >= this.MAX_SELECTION) {
        alert('Vous pouvez sélectionner au maximum 3 matières');
        return;
      }
      this.selectedMatieres.push(matiere);
    }
  }

  isSelected(matiere: any): boolean {
    return this.selectedMatieres.some((m) => m.id === matiere.id);
  }

  continue() {
    if (this.selectedMatieres.length !== this.MAX_SELECTION) {
      alert('Veuillez sélectionner exactement 3 matières');
      return;
    }

    this.router.navigate(['/payment-method'], {
      state: {
        isMatiereSubscription: true,

        // 🔥 DONNÉES UTILISATEUR
        classe: this.userClasse,
        niveauScolaire: this.userNiveau,

        // 🔥 MATIÈRES SÉLECTIONNÉES
        matieres: this.selectedMatieres.map((m) => m.nom || m.name),

        // 🔥 PLAN
        plan: {
          type: 'ANNUAL',
          name: `Abonnement ${this.userClasse}`,
          price: 5000,
          currency: 'XOF',
        },
      },
    });
  }
}
