import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { ToastController } from '@ionic/angular';
import {
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  lockOpenOutline,
  optionsOutline,
  hourglassOutline,
  bookOutline,
  searchOutline,
  personCircleOutline,
  starOutline,
  schoolOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  closeOutline,
} from 'ionicons/icons';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

interface AppUser {
  firstName?: string;
  lastName?: string;
  level?: string;
  classe?: string;
  niveauScolaire?: string;
  role?: { libelle: string };
}

@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonHeader,
    IonSpinner,
    IonSegmentButton,
    IonLabel,
    IonSegment,
    CommonModule,
    IonButton,
    IonIcon,
    IonCardContent,
    IonCard,
    IonSearchbar,
    IonContent,
    BottomMenuComponent,
    DesktopHeaderComponent,
  ],
})
export class MesCoursPage implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];
  private subscription = new Subscription();

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
  isCoursesLoading = true;
  userNiveauScolaire: string | null = null;
  userClasse: string | null = null;

  isLoading = true;
  selectedSegment: 'cours' | 'cours-en-ligne' | 'tutoriel' = 'cours';

  currentUser: AppUser | null = null;
  constructor(
    private router: Router,
    private courseService: CourseService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      personCircleOutline,
      optionsOutline,
      schoolOutline,
      checkmarkCircleOutline,
      bookOutline,
      chevronBackOutline,
      closeOutline,
      hourglassOutline,
      lockOpenOutline,
      checkmarkCircle,
      searchOutline,
      starOutline,
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.initializeUserLevel();
    this.loadCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  selectClasse(classe: string) {
    this.selectedClasse = classe;
  }

  selectClasseForLevel(classe: string) {
    this.selectedClasse = classe;
    this.loadMatieresForClasse(classe);
  }

  loadMatieresForClasse(classe: string) {
    this.isMatiereLoading = true;
    console.log('🔍 Chargement des matières pour:', classe);

    this.courseService.getMatieresByClasse(classe).subscribe({
      next: (res) => {
        console.log(
          '📦 Réponse brute API matières:',
          JSON.stringify(res?.data?.[0]),
        );
        if (res?.success && res?.data) {
          this.availableMatieres = res.data.map((m: any) =>
            typeof m === 'string'
              ? m
              : m.matiereName ||
                m.name ||
                m.matiere ||
                m.title ||
                m.nom ||
                m.label ||
                JSON.stringify(m),
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
        console.warn(
          '⚠️ API matières indisponible, extraction depuis les cours',
        );
        this.extractMatieresFromCourses(classe);
        this.showMatiereSelection = true;
        this.isMatiereLoading = false;
      },
    });
  }

  extractMatieresFromCourses(classe: string) {
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        const classeCourses = courses.filter(
          (c) =>
            (c.type === 'En ligne' || c.type === 'VIDEO') &&
            c.niveauScolaire === this.userNiveauScolaire &&
            c.classe === classe,
        );
        const matieres = [
          ...new Set(classeCourses.map((c) => c.category).filter(Boolean)),
        ];
        this.availableMatieres = matieres;
        console.log('📋 Matières extraites des cours:', matieres);
      },
    });
  }

  isMatiereSelected(m: string): boolean {
    return this.selectedMatieres.includes(m);
  }

  toggleMatiere(m: string) {
    if (this.isMatiereSelected(m)) {
      this.selectedMatieres = this.selectedMatieres.filter((x) => x !== m);
    } else {
      if (this.selectedMatieres.length < this.maxMatieres) {
        this.selectedMatieres.push(m);
      }
    }
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
        totalCourses: this.courses.length,
        isMatiereSubscription: true,
      },
    });
  }

  private loadCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr) as AppUser;
        console.log(
          'Utilisateur chargé depuis localStorage:',
          this.currentUser.classe,
          this.currentUser.level,
        );
      } else {
        console.warn('Aucun utilisateur trouvé dans localStorage');
        // Option : rediriger vers login ?
        // this.router.navigate(['/login']);
      }
    } catch (err) {
      console.error('Erreur lors de la lecture de currentUser', err);
      this.currentUser = null;
    }
  }

  private initializeUserLevel() {
    if (!this.currentUser) return;

    // ✅ IMPORTANT : alimenter les variables utilisées dans le HTML
    console.log('vvvvv', this.currentUser);

    this.userClasse = this.currentUser.classe || null;
    this.userNiveauScolaire = this.currentUser.niveauScolaire || null;

    this.hasClasse = !!this.userClasse;
    this.selectedClasse = this.userClasse;

    const niveau = this.userNiveauScolaire;

    this.isElementaire = niveau === 'ELEMENTAIRE';
    this.isMoyenSecondaireUniv = [
      'MOYEN',
      'SECONDAIRE',
      'UNIVERSITAIRE',
    ].includes(niveau || '');

    if (this.isMoyenSecondaireUniv && niveau) {
      if (niveau === 'MOYEN') {
        this.availableClassesForLevel = ['6ème', '5ème', '4ème', '3ème'];
      }
      if (niveau === 'SECONDAIRE') {
        this.availableClassesForLevel = ['2nde', '1ère', 'Terminale'];
      }
      if (niveau === 'UNIVERSITAIRE') {
        this.availableClassesForLevel = [
          'Licence 1',
          'Licence 2',
          'Licence 3',
          'Master 1',
          'Master 2',
        ];
      }
    }
  }

  private applyAllFilters() {
    let temp = [...this.courses];

    // 1. Filtre par type (segment)
    temp = this.filterBySegment(temp);

    // 2. Filtre par niveau / classe de l'utilisateur
    if (this.currentUser) {
      temp = temp.filter((course) => {
        // Adaptez selon les vrais noms de champs dans ton modèle Course
        const matchLevel =
          !course.niveauScolaire ||
          course.niveauScolaire === this.userNiveauScolaire;

        const matchClasse = !course.classe || course.classe === this.userClasse;

        // ou : course.niveauScolaire === this.currentUser?.niveauScolaire

        return matchLevel && matchClasse;
      });
    }

    this.filteredCourses = temp;
  }

  private filterBySegment(courses: Course[]): Course[] {
    switch (this.selectedSegment) {
      case 'cours':
        return courses.filter((c) => c.type === 'Présentiel');
      case 'cours-en-ligne':
        return courses.filter((c) => c.type === 'En ligne');
      case 'tutoriel':
        return courses.filter((c) => c.type === 'Tuto');
      default:
        return courses;
    }
  }

  searchCourse(event: any) {
    const term = (event.target.value || '').toLowerCase().trim();

    let base = [...this.courses];
    base = this.filterBySegment(base);

    if (this.currentUser) {
      base = base.filter((course) => {
        const matchLevel =
          !course.level || course.level === this.currentUser?.level;
        const matchClasse =
          !course.classe || course.classe === this.currentUser?.classe;
        return matchLevel && matchClasse;
      });
    }

    if (term) {
      this.filteredCourses = base.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          (c.category || '').toLowerCase().includes(term),
      );
    } else {
      this.filteredCourses = base;
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goHome() {
    this.router.navigate(['/courses']);
  }

  loadCourses() {
    this.isLoading = true;

    const sub = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.applyAllFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
        this.isLoading = false;
      },
    });

    this.subscription.add(sub);
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterCoursesBySegment();
  }

  // filterCoursesBySegment() {
  //   if (this.selectedSegment === 'cours') {
  //     // Filtrer pour afficher les cours qui ne sont PAS "En ligne"
  //     this.filteredCourses = this.courses.filter((c) => c.type !== 'En ligne');
  //   } else {
  //     // Filtrer pour afficher uniquement les cours "En ligne"
  //     this.filteredCourses = this.courses.filter((c) => c.type === 'En ligne');
  //   }
  // }

  filterCoursesBySegment() {
    switch (this.selectedSegment) {
      case 'cours':
        // Filtrer pour afficher les cours qui ne sont PAS "En ligne" ni "Tuto"
        this.filteredCourses = this.courses.filter(
          (c) => c.type === 'Présentiel',
        );
        break;

      case 'cours-en-ligne':
        // Filtrer pour afficher uniquement les cours "En ligne"
        this.filteredCourses = this.courses.filter(
          (c) => c.type === 'En ligne',
        );
        break;

      case 'tutoriel':
        // Filtrer pour afficher uniquement les cours de type "Tuto"
        this.filteredCourses = this.courses.filter((c) => c.type === 'Tuto');
        break;

      default:
        this.filteredCourses = this.courses;
    }

    console.log(
      `Segment actif: ${this.selectedSegment}, Cours affichés: ${this.filteredCourses.length}`,
    );
  }

  // searchCourse(event: any) {
  //   const term = event.target.value?.toLowerCase().trim() ?? '';

  //   // Appliquer le filtre de recherche sur les cours déjà filtrés par segment
  //   let baseCourses: Course[] = [];

  //   switch (this.selectedSegment) {
  //     case 'cours':
  //       baseCourses = this.courses.filter(
  //         (c) => c.type !== 'En ligne' && c.type !== 'Tuto',
  //       );
  //       break;
  //     case 'cours-en-ligne':
  //       baseCourses = this.courses.filter((c) => c.type === 'En ligne');
  //       break;
  //     case 'tutoriel':
  //       baseCourses = this.courses.filter((c) => c.type === 'Tuto');
  //       break;
  //     default:
  //       baseCourses = this.courses;
  //   }

  //   this.filteredCourses = baseCourses.filter(
  //     (c) =>
  //       c.title.toLowerCase().includes(term) ||
  //       c.category.toLowerCase().includes(term),
  //   );
  // }

  openCourse(course: Course) {
    console.log('Ouvrir le cours:', course.id);
    this.router.navigate(['/course-detail', course.id]);
  }

  openFilters() {
    console.log('Ouvrir filtres');
  }

  // Méthode utilitaire pour regrouper les cours par catégorie
  getCoursesByCategory(category: string): Course[] {
    return this.filteredCourses.filter((c) => c.category === category);
  }

  // Obtenir les catégories des cours filtrés
  getFilteredCategories(): string[] {
    return [
      ...new Set(
        this.filteredCourses
          .map((c) => c.category)
          .filter((x) => x && x.trim() !== ''),
      ),
    ];
  }
}
