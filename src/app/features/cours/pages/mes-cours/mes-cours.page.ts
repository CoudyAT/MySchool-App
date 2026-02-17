import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
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

  isLoading = true;
  selectedSegment: 'cours' | 'cours-en-ligne' | 'tutoriel' = 'cours';

  currentUser: AppUser | null = null;
  constructor(
    private router: Router,
    private courseService: CourseService,
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

  private loadCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr) as AppUser;
        console.log('Utilisateur chargé depuis localStorage:', this.currentUser.classe, this.currentUser.level);
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

  private applyAllFilters() {
    let temp = [...this.courses];

    // 1. Filtre par type (segment)
    temp = this.filterBySegment(temp);

    // 2. Filtre par niveau / classe de l'utilisateur
    if (this.currentUser) {
      temp = temp.filter(course => {
        // Adaptez selon les vrais noms de champs dans ton modèle Course
        const matchLevel = !course.level || course.level === this.currentUser?.level;
        const matchClasse = !course.classe || course.classe === this.currentUser?.classe;
        // ou : course.niveauScolaire === this.currentUser?.niveauScolaire

        return matchLevel && matchClasse;
      });
    }

    this.filteredCourses = temp;
  }

  private filterBySegment(courses: Course[]): Course[] {
    switch (this.selectedSegment) {
      case 'cours':
        return courses.filter(c => c.type === 'Présentiel');
      case 'cours-en-ligne':
        return courses.filter(c => c.type === 'En ligne');
      case 'tutoriel':
        return courses.filter(c => c.type === 'Tuto');
      default:
        return courses;
    }
  }

  searchCourse(event: any) {
    const term = (event.target.value || '').toLowerCase().trim();

    let base = [...this.courses];
    base = this.filterBySegment(base);

    if (this.currentUser) {
      base = base.filter(course => {
        const matchLevel = !course.level || course.level === this.currentUser?.level;
        const matchClasse = !course.classe || course.classe === this.currentUser?.classe;
        return matchLevel && matchClasse;
      });
    }

    if (term) {
      this.filteredCourses = base.filter(c =>
        c.title.toLowerCase().includes(term) ||
        (c.category || '').toLowerCase().includes(term)
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
