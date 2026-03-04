import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
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
  calendarOutline,
} from 'ionicons/icons';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-video-page',
  templateUrl: './video-page.page.html',
  styleUrls: ['./video-page.page.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonHeader,
    IonSpinner,
    IonSegmentButton,
    IonLabel,
    IonSegment,
    CommonModule,
    RouterModule,
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
export class VideoPagePage implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];
  private subscription = new Subscription();

  isLoading = true;
  selectedSegment: 'cours' | 'cours-en-ligne' = 'cours';

  constructor(
    private router: Router,
    private courseService: CourseService,
  ) {
    addIcons({
      personCircleOutline,
      optionsOutline,
      hourglassOutline,
      bookOutline,
      lockOpenOutline,
      calendarOutline,
      searchOutline,
      starOutline,
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

  goHome() {
    this.router.navigate(['/courses']);
  }

  loadCourses() {
    this.isLoading = true;

    const sub = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        // ✅ Filtrer uniquement les cours de type "video"
        this.courses = courses.filter((c) => c.type === 'Video');
        console.log('Cours vidéo trouvés :', this.courses.length);

        this.filteredCourses = [...this.courses];

        // Extraire les catégories
        this.categories = Array.from(
          new Set(
            this.courses
              .map((c) => c.category)
              .filter((cat) => cat && cat.trim() !== ''),
          ),
        );

        console.log('Cours vidéo chargés :', this.courses.length);
        console.log('Catégories chargées :', this.categories);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
        this.isLoading = false;
      },
    });

    this.subscription.add(sub);
  }

  // Plus besoin de segment, donc ces fonctions peuvent être supprimées
  // onSegmentChange(event) { ... }
  // filterCoursesBySegment() { ... }

  getSimpleDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      const seconds = timestamp._seconds || timestamp.seconds || 0;
      const date = new Date(seconds * 1000);

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return '';
    }
  }
  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterCoursesBySegment();
  }

  filterCoursesBySegment() {
    if (this.selectedSegment === 'cours') {
      // Filtrer pour afficher les cours qui ne sont PAS "En ligne"
      this.filteredCourses = this.courses.filter((c) => c.type !== 'En ligne');
    } else {
      // Filtrer pour afficher uniquement les cours "En ligne"
      this.filteredCourses = this.courses.filter((c) => c.type === 'En ligne');
    }
  }

  searchCourse(event: any) {
    const term = event.target.value?.toLowerCase().trim() ?? '';

    // Appliquer le filtre de recherche sur les cours déjà filtrés par segment
    const baseCourses =
      this.selectedSegment === 'cours'
        ? this.courses.filter((c) => !c.isOnline)
        : this.courses.filter((c) => c.isOnline);

    this.filteredCourses = baseCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term),
    );
  }

  // openCourse(course: Course) {
  //   console.log('Ouvrir le cours:', course.id);
  //   this.router.navigate(['/video-detail', course.id]);
  // }

  openCourse(course: Course) {
    this.router.navigate(['/video-player', course.id]);
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
