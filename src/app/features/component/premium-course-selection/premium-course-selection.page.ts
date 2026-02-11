import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  bookOutline,
  schoolOutline,
  folderOutline,
  timeOutline,
  layersOutline,
  searchOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-premium-course-selection',
  templateUrl: './premium-course-selection.page.html',
  styleUrls: ['./premium-course-selection.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
  courses: Course[] = [];
  categories: string[] = [];
  filteredCourses: Course[] = [];

  selectedCategory: string | null = null;
  selectedCourses: Course[] = [];

  MAX_SELECTION = 3;
  isLoading = true;

  private sub = new Subscription();

  constructor(
    private courseService: CourseService,
    private router: Router,
  ) {
    addIcons({
      schoolOutline,
      folderOutline,
      bookOutline,
      checkmarkCircle,
      timeOutline,
      layersOutline,
      searchOutline,
      arrowForwardOutline,
    });
  }

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadCourses() {
    const s = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;

        this.categories = [
          ...new Set(
            courses.map((c) => c.category).filter((c) => c && c.trim() !== ''),
          ),
        ];

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });

    this.sub.add(s);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filteredCourses = this.courses.filter((c) => c.category === category);

    this.selectedCourses = [];
  }

  toggleCourse(course: Course) {
    const exists = this.selectedCourses.find((c) => c.id === course.id);

    if (exists) {
      this.selectedCourses = this.selectedCourses.filter(
        (c) => c.id !== course.id,
      );
    } else {
      if (this.selectedCourses.length >= this.MAX_SELECTION) {
        alert('Vous pouvez sélectionner seulement 3 cours');
        return;
      }
      this.selectedCourses.push(course);
    }
  }

  isSelected(course: Course) {
    return this.selectedCourses.some((c) => c.id === course.id);
  }

  continue() {
    console.log('🚀 Redirection vers la page de paiement Premium...');
    // Rediriger vers la page de méthode de paiement avec les infos Premium
    this.router.navigate(['/payment-method'], {
      state: {
        plan: {
          type: 'MONTHLY',
          name: 'Abonnement Premium',
          price: 5000,
          description: 'Accès illimité à tous les cours',
          features: [
            'Tous les cours disponibles',
            'Contenus exclusifs',
            'Téléchargement hors ligne',
            'Certificats Premium',
            'Support prioritaire',
          ],
        },
        isPremiumSubscription: true,
        selectedCategory: this.selectedCategory,
      },
    });
  }

  // continue() {
  //   if (this.selectedCourses.length !== 3) return;

  //   this.router.navigate(['/subscription-plans'], {
  //     state: {
  //       isPremiumSubscription: true,
  //       selectedCourses: this.selectedCourses,
  //     },
  //   });
  // }
}
