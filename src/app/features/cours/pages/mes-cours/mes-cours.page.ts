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
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';

@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
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

  constructor(private router: Router, private courseService: CourseService) {}

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
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = [...courses];

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

  searchCourse(event?: any) {
    const term = event?.detail?.value?.toLowerCase() ?? '';

    this.filteredCourses = this.courses.filter(
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
}
