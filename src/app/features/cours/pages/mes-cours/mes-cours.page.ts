import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; 
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { BottomMenuComponent } from "src/app/shared/components/bottom-menu/bottom-menu.component";


@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    // IonHeader,
    // IonTitle,
    // IonToolbar,
    CommonModule,
    FormsModule,
    IonSearchbar,
    IonButton,
    IonCard,
    IonIcon,
    IonCardContent,
    BottomMenuComponent
],
})
export class MesCoursPage implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];

  private subscription: Subscription = new Subscription();
  isLoading = true;

  constructor(private router: Router, private courseService: CourseService) {}

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadCourses() {
    this.isLoading = true;

    const coursesSub = this.courseService.getCourses().subscribe({
      next: (firestoreCourses) => {
        // Transformer les données Firestore en format compatible
        this.courses = firestoreCourses;
        this.filteredCourses = [...this.courses];

        // Extraire les catégories uniques
        this.categories = [
          ...new Set(this.courses.map((course) => course.category)),
        ];

        this.isLoading = false;
        console.log('📚 Cours chargés:', this.courses.length);
      },
      error: (error) => {
        console.error('❌ Erreur chargement cours:', error);
        this.isLoading = false;
      },
    });

    this.subscription.add(coursesSub);
  }


  // Filtrer les cours par catégorie
  getCoursesByCategory(category: string): Course[] {
    return this.courses.filter((course) => course.category === category);
  }

  searchCourse(event?: any) {
    const searchTerm = event?.detail?.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.filteredCourses = [...this.courses];
      return;
    }

    this.filteredCourses = this.courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm)
    );
  }

  openFilters() {
    console.log('Ouvrir les filtres');
  }

  openCourse(course: Course) {
    console.log('Ouvrir le cours:', course);
    this.router.navigate(['/course-detail', course.id]);
  }
}