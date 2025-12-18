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
  IonSegment,
  IonLabel,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';

@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class MesCoursPage implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];
  private subscription = new Subscription();

  isLoading = true;
  selectedSegment: 'cours' | 'cours-en-ligne' = 'cours';

  constructor(private router: Router, private courseService: CourseService) {}

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadCourses() {
    this.isLoading = true;

    const sub = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filterCoursesBySegment();

        this.categories = [
          ...new Set(
            courses.map((c) => c.category).filter((x) => x && x.trim() !== '')
          ),
        ];

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.isLoading = false;
      },
    });

    this.subscription.add(sub);
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterCoursesBySegment();
  }

  filterCoursesBySegment() {
    if (this.selectedSegment === 'cours') {
      // Filtrer pour afficher uniquement les cours normaux (isOnline = false ou undefined)
      this.filteredCourses = this.courses.filter((c) => !c.isOnline);
    } else {
      // Filtrer pour afficher uniquement les cours en ligne (isOnline = true)
      this.filteredCourses = this.courses.filter((c) => c.isOnline);
    }
  }

  searchCourse(event?: any) {
    const term = event?.detail?.value?.toLowerCase() ?? '';

    // Appliquer le filtre de recherche sur les cours déjà filtrés par segment
    const baseCourses =
      this.selectedSegment === 'cours'
        ? this.courses.filter((c) => !c.isOnline)
        : this.courses.filter((c) => c.isOnline);

    this.filteredCourses = baseCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }

  openCourse(course: Course) {
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
          .filter((x) => x && x.trim() !== '')
      ),
    ];
  }
}
