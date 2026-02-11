import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { FiltreNiveauService } from 'src/app/features/services/filtre-niveau.service';
import { User } from 'src/app/models/user.model';
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
} from 'ionicons/icons';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonHeader,
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

  isLoading = true;
  selectedSegment: 'cours' | 'cours-en-ligne' | 'tutoriel' = 'cours';

  constructor(
    private router: Router,
    private courseService: CourseService,
    private filtreNiveauService: FiltreNiveauService,
  ) {
    addIcons({
      searchOutline,
      personCircleOutline,
      starOutline,
      optionsOutline,
      hourglassOutline,
      bookOutline,
      lockOpenOutline,
      checkmarkCircle,
    });
  }

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  loadCourses() {
    this.isLoading = true;

    // Récupérer le profil utilisateur
    const localUser: User = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Si l'utilisateur est connecté avec un niveau et une classe, filtrer côté serveur
    if (localUser?.niveauScolaire && localUser?.classe) {
      console.log('🎓 Chargement des cours pour:', localUser.niveauScolaire, localUser.classe);

      // Appeler l'API spécifique par classe (plus précis)
      const sub = this.courseService.getCoursesByClasse(localUser.classe).subscribe({
        next: (courses) => {
          this.courses = courses;
          console.log('✅ Cours récupérés par classe:', this.courses.length);
          this.processCourses();
        },
        error: (err) => {
          console.error('Erreur chargement cours par classe:', err);
          // Fallback: essayer par niveau scolaire
          this.loadCoursesByNiveau(localUser.niveauScolaire!);
        },
      });
      this.subscription.add(sub);
    } else if (localUser?.niveauScolaire) {
      // Si uniquement le niveau est disponible
      console.log('🎓 Chargement des cours pour niveau:', localUser.niveauScolaire);
      this.loadCoursesByNiveau(localUser.niveauScolaire);
    } else {
      // Sinon, charger tous les cours
      this.loadAllCourses();
    }
  }

  /**
   * Charger les cours par niveau scolaire
   */
  private loadCoursesByNiveau(niveau: string) {
    const sub = this.courseService.getCoursesByNiveau(niveau).subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log('✅ Cours récupérés par niveau:', this.courses.length);
        this.processCourses();
      },
      error: (err) => {
        console.error('Erreur chargement cours par niveau:', err);
        this.loadAllCourses();
      },
    });
    this.subscription.add(sub);
  }

  /**
   * Charger tous les cours (fallback)
   */
  private loadAllCourses() {
    const sub = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log('✅ Tous les cours récupérés:', this.courses.length);
        this.processCourses();
      },
      error: (err) => {
        console.error('Erreur chargement tous les cours:', err);
        this.isLoading = false;
      },
    });
    this.subscription.add(sub);
  }

  /**
   * Traiter les cours après chargement
   */
  private processCourses() {
    this.filterCoursesBySegment();

    // Extract unique non-empty category strings from the loaded courses
    this.categories = Array.from(
      new Set<string>(
        this.courses
          .map((c) => c.category)
          .filter(
            (cat): cat is string =>
              typeof cat === 'string' && cat.trim() !== '',
          ),
      ),
    );

    console.log('Cours chargés :', this.courses.length);
    console.log('Catégories chargées :', this.categories);

    this.isLoading = false;
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

  searchCourse(event: any) {
    const term = event.target.value?.toLowerCase().trim() ?? '';

    // Appliquer le filtre de recherche sur les cours déjà filtrés par segment
    let baseCourses: Course[] = [];

    switch (this.selectedSegment) {
      case 'cours':
        baseCourses = this.courses.filter(
          (c) => c.type !== 'En ligne' && c.type !== 'Tuto',
        );
        break;
      case 'cours-en-ligne':
        baseCourses = this.courses.filter((c) => c.type === 'En ligne');
        break;
      case 'tutoriel':
        baseCourses = this.courses.filter((c) => c.type === 'Tuto');
        break;
      default:
        baseCourses = this.courses;
    }

    this.filteredCourses = baseCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term),
    );
  }

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
