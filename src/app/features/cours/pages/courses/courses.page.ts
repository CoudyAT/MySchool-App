import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone'; // ✅ Import corrigé
import { signOut } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { register } from 'swiper/element/bundle';
register();
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';

import { addIcons } from 'ionicons';
import {
  addOutline,
  logOutOutline,
  arrowForwardOutline,
  ribbonOutline,
  playCircleOutline,
  play,
  shieldCheckmark,
  checkmarkCircle,
  cardOutline,
  shieldCheckmarkOutline,
  starOutline,
  personCircleOutline,
  trendingUpOutline,
  bookOutline,
  bulbOutline,
  calculatorOutline,
  lockOpenOutline,
  optionsOutline,
  searchOutline,
  notificationsOutline,
  chevronForwardOutline,
  closeOutline,
  chevronDownOutline,
  personOutline, schoolOutline, checkmarkCircleOutline, chevronBackOutline, ellipseOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { Enrollment } from 'src/app/models/payment.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Instructor } from 'src/app/models/instructor.model';
import { FcmService } from 'src/app/features/services/fcm.service';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    BottomMenuComponent,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonSpinner,
    DesktopHeaderComponent,
    FooterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CoursesPage implements OnInit, AfterViewInit, OnDestroy {
  currentSlide = 0;
  enrolledCourses: Enrollment[] = [];
  instructors: Instructor[] = [];
  isLoading = true;
  private enrollmentSubscription: Subscription = new Subscription();
  allCourses: Course[] = [];
  isCoursesLoading = true;
  userNiveauScolaire: string | null = null;
  userClasse: string | null = null;

  // Gestion des classes pour ELEMENTAIRE
  isElementaire = false;
  hasClasse = false;
  availableClasses: string[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  selectedClasse: string | null = null;
  isSubscribedToClasse = false;

  // Gestion MOYEN / SECONDAIRE / UNIVERSITAIRE
  isMoyenSecondaireUniv = false;
  availableClassesForLevel: string[] = [];
  showMatiereSelection = false;
  availableMatieres: string[] = [];
  selectedMatieres: string[] = [];
  maxMatieres = 3;
  isMatiereLoading = false;

  // Abonnement actif
  hasActiveSubscription = false;

  // Classes par niveau
  classesByNiveau: Record<string, string[]> = {
    MOYEN: ['6ème', '5ème', '4ème', '3ème (BFEM)'],
    SECONDAIRE: ['Seconde S', 'Seconde L', 'Première S', 'Première L', 'Terminale S', 'Terminale L'],
    UNIVERSITAIRE: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'],
  };

  slideOpts = {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 400,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
  };

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private auth: Auth,
    private enrollmentService: EnrollmentService,
    private modalCtrl: ModalController,
    private instructorService: InstructorService,
    private fcmService: FcmService,
    private courseService: CourseService,
  ) {
    addIcons({searchOutline,personCircleOutline,starOutline,schoolOutline,checkmarkCircleOutline,bookOutline,chevronBackOutline,closeOutline,ellipseOutline,play,addOutline,shieldCheckmark,personOutline,chevronDownOutline,notificationsOutline,chevronForwardOutline,shieldCheckmarkOutline,optionsOutline,lockOpenOutline,trendingUpOutline,bulbOutline,calculatorOutline,logOutOutline,ribbonOutline,checkmarkCircle,cardOutline,arrowForwardOutline,playCircleOutline,});
  }

  ngOnInit() {
    this.loadEnrolledCourses();
    this.loadAllCoursesPreview();
    this.instructorService.getInstructors().subscribe((data) => {
      this.instructors = data;
    });
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['premiumActivated']) {
      this.showPremiumSuccessToast();
      this.loadEnrolledCourses(); // Recharger les cours
    }

    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    const userId = localUser.uid;
    this.fcmService.initFCM(userId);
    this.fcmService.listenMessages();
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  ngOnDestroy() {
    this.enrollmentSubscription.unsubscribe();
  }

  loadEnrolledCourses() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log(
      '👤 Utilisateur connecté:',
      localUser?.firstName,
      localUser?.lastName,
    );
    console.log('🔑 UID:', localUser?.uid);
    console.log('🎓 Niveau scolaire:', localUser?.niveauScolaire);
    console.log('📚 Classe:', localUser?.classe);

    if (!localUser || !localUser.uid) {
      console.error('❌ Aucun utilisateur connecté trouvé');
      this.isLoading = false;
      return;
    }

    // Stocker le niveau scolaire et la classe de l'utilisateur
    this.userNiveauScolaire = localUser?.niveauScolaire || null;
    this.userClasse = localUser?.classe || null;
    this.hasActiveSubscription = localUser?.hasActiveSubscription || false;
    console.log('💾 Niveau stocké:', this.userNiveauScolaire);
    console.log('💾 Classe stockée:', this.userClasse);
    console.log('💾 Abonnement actif:', this.hasActiveSubscription);

    // Détecter si c'est un élève ELEMENTAIRE
    this.isElementaire = this.userNiveauScolaire === 'ELEMENTAIRE';
    this.hasClasse = !!this.userClasse;
    this.selectedClasse = this.userClasse;

    // Détecter MOYEN / SECONDAIRE / UNIVERSITAIRE
    this.isMoyenSecondaireUniv = ['MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'].includes(this.userNiveauScolaire || '');
    if (this.isMoyenSecondaireUniv && this.userNiveauScolaire) {
      this.availableClassesForLevel = this.classesByNiveau[this.userNiveauScolaire] || [];
      if (this.hasClasse) {
        this.selectedClasse = this.userClasse;
      }
    }

    console.log('🎯 Est ELEMENTAIRE:', this.isElementaire);
    console.log('🎯 Est MOYEN/SECONDAIRE/UNIV:', this.isMoyenSecondaireUniv);
    console.log('🎯 A une classe:', this.hasClasse);

    this.enrollmentSubscription = this.enrollmentService
      .getUserEnrollmentsWithCourseDetails() // Utiliser la nouvelle méthode
      .subscribe({
        next: (enrollmentsWithDetails) => {
          console.log(
            '✅ Cours avec détails chargés:',
            enrollmentsWithDetails.length,
          );

          this.enrolledCourses = enrollmentsWithDetails;
          console.log('📚 Cours assignés:', this.enrolledCourses);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement des cours avec détails:', error);
          this.isLoading = false;
        },
      });
  }

  initializeSwiper() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      Object.assign(swiperEl, this.slideOpts);
      swiperEl.initialize();
      console.log('✅ Swiper initialisé avec succès');
    } else {
      console.log('❌ Swiper container non trouvé');
    }
  }

  onSlideChange(event: any) {
    this.currentSlide = event.detail[0].activeIndex;
    console.log('Slide changé:', this.currentSlide);
  }

  onSwiperInit(swiper: any) {
    console.log('✅ Swiper prêt');
  }

  goToCoursesPage() {
    this.router.navigate(['/mes-cours']);
  }

  goToBiblio() {
    this.router.navigate(['/pdf-list']);
  }

  goToTutos() {
    this.router.navigate(['/tutos']);
  }

  goToExos() {
    this.router.navigate(['/exos']);
  }

  openCourse(enrollment: Enrollment) {
    this.router.navigate(['/course-detail/', enrollment.courseId], {
      state: {
        enrollment: enrollment,
      },
    });
  }

  openCour(course: Course) {
    this.router.navigate(['/course-detail', course.id]);
  }

  openHelp() {
    this.router.navigate(['/mes-cours']);
  }

  // Obtenir le texte de progression
  getProgressText(progress: number): string {
    return `${progress}% complété`;
  }

  // Formater la date d'inscription
  getFormattedDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      let date: Date;

      // Gérer le timestamp Firestore
      if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '';
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      const toast = await this.toastCtrl.create({
        message: 'Déconnexion  ✅',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/signup'], { replaceUrl: true });
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      const toast = await this.toastCtrl.create({
        message: 'Erreur lors de la déconnexion ❌',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async openPremiumModal() {
    // Récupérer les données utilisateur
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Cas ÉLÉMENTAIRE → redirection directe vers payment-method (abonnement classe)
    if (localUser?.niveauScolaire === 'ELEMENTAIRE') {
      this.router.navigate(['/payment-method'], {
        state: {
          isPremiumFlow: true,
          method: 'premium',
          plan: {
            type: 'ANNUAL',
            name: `Abonnement ${localUser.classe}`,
            price: 5000,
            currency: 'XOF',
          },
          isClasseSubscription: true,
          classe: localUser.classe,
          niveauScolaire: localUser.niveauScolaire,
          userInfo: {
            classe: localUser.classe,
            niveau: localUser.niveauScolaire,
          },
        },
      });
      return;
    }

    // Autres niveaux → sélection des cours premium
    this.router.navigate(['/premium-course-selection'], {
      state: {
        isPremiumFlow: true,
      },
    });
  }

  private async showPremiumSuccessToast() {
    const toast = await this.toastCtrl.create({
      message: '🎉 Félicitations ! Votre abonnement Premium est activé !',
      duration: 4000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  get subscriptionButtonText(): string {
    if (this.userNiveauScolaire === 'ELEMENTAIRE' && this.userClasse) {
      return `Souscrire à l'abonnement ${this.userClasse}`;
    }
    if (['MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'].includes(this.userNiveauScolaire || '') && this.userClasse) {
      return `Souscrire à l'abonnement ${this.userClasse}`;
    }
    return "Souscrire à l'abonnement";
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goHome() {
    this.router.navigate(['/courses']);
  }

  goToInstructorProfile(id: string) {
    this.router.navigate(['/instructor-profile', id]);
  }

  loadAllCoursesPreview() {
    this.isCoursesLoading = true;

    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('🌐 Total cours reçus de l\'API:', courses.length);

        // Filtrer par type (En ligne ou VIDEO)
        let filteredCourses = courses.filter((c) => c.type === 'En ligne' || c.type === 'VIDEO');
        console.log('📹 Cours "En ligne" + "VIDEO":', filteredCourses.length);

        // Filtrer par niveau scolaire si disponible
        if (this.userNiveauScolaire) {
          filteredCourses = filteredCourses.filter(
            (c) => c.niveauScolaire === this.userNiveauScolaire
          );
          console.log(`🎓 Cours pour niveau "${this.userNiveauScolaire}":`, filteredCourses.length);

          // Si l'utilisateur a une classe spécifique (ex: CM2), filtrer aussi par classe
          if (this.userClasse) {
            const beforeClassFilter = filteredCourses.length;
            filteredCourses = filteredCourses.filter(
              (c) => c.classe === this.userClasse
            );
            console.log(`📚 Filtrage pour classe "${this.userClasse}":`);
            console.log(`   Avant: ${beforeClassFilter} cours`);
            console.log(`   Après: ${filteredCourses.length} cours`);

            // Log des cours filtrés
            if (filteredCourses.length > 0) {
              console.log('✅ Cours filtrés pour', this.userClasse + ':');
              filteredCourses.forEach(c => {
                console.log(`   - ${c.title} (classe: ${c.classe})`);
              });
            } else {
              console.warn('⚠️ Aucun cours trouvé pour la classe', this.userClasse);
            }
          }
        } else {
          console.warn('⚠️ Aucun niveau scolaire défini pour l\'utilisateur');
        }

        this.allCourses = filteredCourses;
        console.log('✅ Total cours affichés:', this.allCourses.length);
        this.isCoursesLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement cours:', err);
        this.isCoursesLoading = false;
      },
    });
  }

  /**
   * Sélectionner une classe (pour ELEMENTAIRE sans classe)
   */
  selectClasse(classe: string) {
    console.log('🎯 Classe sélectionnée:', classe);
    this.selectedClasse = classe;
    this.loadCoursesForClasse(classe);
  }

  /**
   * Charger les cours d'une classe spécifique
   */
  loadCoursesForClasse(classe: string) {
    this.isCoursesLoading = true;
    console.log('🔍 Chargement des cours pour la classe:', classe);

    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        const filteredCourses = courses.filter(
          (c) =>
            (c.type === 'En ligne' || c.type === 'VIDEO') &&
            c.niveauScolaire === (this.userNiveauScolaire || 'ELEMENTAIRE') &&
            c.classe === classe
        );

        console.log(`✅ ${filteredCourses.length} cours trouvés pour ${classe}`);
        this.allCourses = filteredCourses;
        this.isCoursesLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement cours:', err);
        this.isCoursesLoading = false;
      },
    });
  }

  /**
   * S'abonner à une classe (ELEMENTAIRE uniquement)
   */
  async subscribeToClasse() {
    if (!this.userClasse || !this.userNiveauScolaire) return;
    this.router.navigate(['/payment-method'], {
      state: {
        isClasseSubscription: true,
        classe: this.userClasse,
        niveauScolaire: this.userNiveauScolaire,
        plan: {
          type: 'ANNUAL',
          name: `Abonnement ${this.userClasse}`,
          price: 5000,
          currency: 'XOF',
        },
        userInfo: {
          classe: this.userClasse,
          niveau: this.userNiveauScolaire,
        },
      },
    });
  }

  /**
   * Sélectionner une classe pour MOYEN/SECONDAIRE/UNIVERSITAIRE
   */
  selectClasseForLevel(classe: string) {
    console.log('🎯 Classe sélectionnée (niveau):', classe);
    this.selectedClasse = classe;
    this.showMatiereSelection = false;
    this.selectedMatieres = [];
    this.availableMatieres = [];
    this.loadCoursesForClasse(classe);
    this.loadMatieresForClasse(classe);
  }

  /**
   * Charger les matières disponibles pour une classe
   */
  loadMatieresForClasse(classe: string) {
    this.isMatiereLoading = true;
    console.log('🔍 Chargement des matières pour:', classe);

    this.courseService.getMatieresByClasse(classe).subscribe({
      next: (res) => {
        console.log('📦 Réponse brute API matières:', JSON.stringify(res?.data?.[0]));
        if (res?.success && res?.data) {
          this.availableMatieres = res.data.map((m: any) =>
            typeof m === 'string' ? m : (m.matiereName || m.name || m.matiere || m.title || m.nom || m.label || JSON.stringify(m))
          );
          console.log('✅ Matières disponibles:', this.availableMatieres);
        } else {
          // Fallback: extraire les matières des cours
          this.extractMatieresFromCourses(classe);
        }
        this.showMatiereSelection = true;
        this.isMatiereLoading = false;
      },
      error: () => {
        console.warn('⚠️ API matières indisponible, extraction depuis les cours');
        this.extractMatieresFromCourses(classe);
        this.showMatiereSelection = true;
        this.isMatiereLoading = false;
      },
    });
  }

  /**
   * Extraire les matières uniques depuis les cours filtrés
   */
  extractMatieresFromCourses(classe: string) {
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        const classeCourses = courses.filter(
          (c) =>
            (c.type === 'En ligne' || c.type === 'VIDEO') &&
            c.niveauScolaire === this.userNiveauScolaire &&
            c.classe === classe
        );
        const matieres = [...new Set(classeCourses.map((c) => c.category).filter(Boolean))];
        this.availableMatieres = matieres;
        console.log('📋 Matières extraites des cours:', matieres);
      },
    });
  }

  /**
   * Toggle sélection d'une matière (max 3)
   */
  toggleMatiere(matiere: string) {
    const index = this.selectedMatieres.indexOf(matiere);
    if (index > -1) {
      this.selectedMatieres.splice(index, 1);
    } else {
      if (this.selectedMatieres.length >= this.maxMatieres) {
        this.showMaxMatieresToast();
        return;
      }
      this.selectedMatieres.push(matiere);
    }
    console.log('📚 Matières sélectionnées:', this.selectedMatieres);
  }

  /**
   * Vérifie si une matière est sélectionnée
   */
  isMatiereSelected(matiere: string): boolean {
    return this.selectedMatieres.includes(matiere);
  }

  /**
   * Toast max matières
   */
  async showMaxMatieresToast() {
    const toast = await this.toastCtrl.create({
      message: `⚠️ Vous ne pouvez sélectionner que ${this.maxMatieres} matières maximum`,
      duration: 2000,
      color: 'warning',
    });
    await toast.present();
  }

  /**
   * S'abonner avec les matières sélectionnées (MOYEN/SECONDAIRE/UNIVERSITAIRE)
   */
  async subscribeWithMatieres() {
    if (!this.selectedClasse) {
      const toast = await this.toastCtrl.create({
        message: '⚠️ Veuillez sélectionner une classe',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    if (this.selectedMatieres.length !== this.maxMatieres) {
      const toast = await this.toastCtrl.create({
        message: `⚠️ Vous devez sélectionner exactement ${this.maxMatieres} matières`,
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    console.log('📝 Abonnement matières:', {
      classe: this.selectedClasse,
      niveauScolaire: this.userNiveauScolaire,
      matieres: this.selectedMatieres,
    });

    this.router.navigate(['/payment-method'], {
      state: {
        type: 'matiere',
        classe: this.selectedClasse,
        niveauScolaire: this.userNiveauScolaire,
        matieres: this.selectedMatieres,
        totalCourses: this.allCourses.length,
        isMatiereSubscription: true,
      },
    });
  }

  /**
   * Voir les cours d'une classe
   */
  viewClasseCourses(classe: string) {
    console.log('👀 Voir les cours de:', classe);
    this.selectClasse(classe);
  }
}
