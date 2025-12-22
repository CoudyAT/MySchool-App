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
  IonButton, IonSpinner
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  lockOpenOutline,
  optionsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [IonSpinner,
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

  constructor(private router: Router, private courseService: CourseService) {
    addIcons({ optionsOutline, lockOpenOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // loadCourses() {
  //   this.isLoading = true;

  //   const sub = this.courseService.getAllCourses().subscribe({
  //     next: (courses) => {
  //       // Clean and normalize the data
  //       this.courses = this.normalizeCourses(courses);
  //       console.log('Liste des cours nettoyés:', this.courses);

  //       this.filteredCourses = [...this.courses];

  //       // Filter out empty categories
  //       this.categories = [
  //         ...new Set(
  //           this.courses
  //             .map((c) => c.category)
  //             .filter((category) => category && category.trim() !== '')
  //         ),
  //       ];

  //       console.log('Catégories disponibles:', this.categories);
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('Erreur API:', err);
  //       this.isLoading = false;
  //     },
  //   });

  //   this.subscription.add(sub);
  // }

  loadCourses() {
    this.isLoading = true;

    const sub = this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        const publishedCourses = courses.filter(course => course.isPublished === true);

        this.courses = publishedCourses;
        this.filteredCourses = [...publishedCourses];

        this.categories = [
          ...new Set(
            publishedCourses
              .map(c => c.category)
              .filter(cat => cat && cat.trim() !== '')
          )
        ];

        console.log('Cours publiés chargés :', publishedCourses.length);
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
  getCoursesByCategory(category: string): Course[] {
    return this.filteredCourses.filter(course =>
      course.category?.trim() === category.trim()
    );
  }
  private normalizeCourses(courses: any[]): any[] {
    return courses.map((course) => {
      // Fix encoding issues (if needed, depending on your actual data source)
      const normalizedCourse = { ...course };

      // Normalize level values to consistent format
      if (normalizedCourse.level) {
        const level = normalizedCourse.level.toUpperCase();
        if (level.includes('DEBUTANT') || level.includes('BEGINNER')) {
          normalizedCourse.level = 'DEBUTANT';
        } else if (
          level.includes('INTERMEDIAIRE') ||
          level.includes('INTERMEDIATE')
        ) {
          normalizedCourse.level = 'INTERMEDIAIRE';
        } else if (level.includes('AVANCE') || level.includes('ADVANCED')) {
          normalizedCourse.level = 'AVANCE';
        }
      }

      // Convert duration to a number if it's a string with "h"
      if (
        typeof normalizedCourse.duration === 'string' &&
        normalizedCourse.duration.includes('h')
      ) {
        const hours = parseFloat(
          normalizedCourse.duration.replace('h', '').trim()
        );
        normalizedCourse.duration = hours * 60; // Convert to minutes if needed
      }

      return normalizedCourse;
    });
  }

  searchCourse(event: any) {
    const term = event.target.value?.toLowerCase().trim() ?? '';

    if (term === '') {
      this.filteredCourses = [...this.courses];
    } else {
      this.filteredCourses = this.courses.filter(course =>
        course.title?.toLowerCase().includes(term) ||
        course.category?.toLowerCase().includes(term)
      );
    }

    // Recalcule les catégories visibles basées sur les cours filtrés
    this.updateCategoriesFromFiltered();
  }

  private updateCategoriesFromFiltered() {
    this.categories = [
      ...new Set(
        this.filteredCourses
          .map(c => c.category)
          .filter(cat => cat && cat.trim() !== '')
      )
    ];
  }

  openCourse(course: Course) {
    this.router.navigate(['/course-detail', course.id]);
  }

  openFilters() {
    console.log('Ouvrir filtres');
  }
}
