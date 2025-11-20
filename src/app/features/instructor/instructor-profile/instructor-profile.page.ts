import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  starOutline,
  star,
  playCircleOutline,
  peopleOutline,
  bookOutline,
  timeOutline,
  ribbonOutline,
  shareSocialOutline,
  starHalf,
  calculatorOutline,
} from 'ionicons/icons';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Instructor } from 'src/app/models/instructor.model';
import { Course } from 'src/app/models/course.model';

@Component({
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.page.html',
  styleUrls: ['./instructor-profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBackButton,
    IonButtons,
    CommonModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InstructorProfilePage implements OnInit {
  instructor: Instructor | null = null;
  instructorId: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private instructorService: InstructorService
  ) {
    addIcons({
      arrowBackOutline,
      shareSocialOutline,
      star,
      starHalf,
      peopleOutline,
      bookOutline,
      ribbonOutline,
      playCircleOutline,
      calculatorOutline,
      timeOutline,
      starOutline,
    });
  }

  ngOnInit() {
    this.instructorId = this.route.snapshot.paramMap.get('id') || '';
    this.loadInstructorData();
  }

  loadInstructorData() {
    this.isLoading = true;

    this.instructorService.getInstructorById(this.instructorId).subscribe({
      next: (instructor) => {
        this.instructor = instructor;
        console.log('instructor', this.instructor);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'instructeur:", error);
        this.isLoading = false;      },
    });
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  openCourse(course: Course) {
    this.router.navigate(['/course-detail', course.id]);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  shareInstructor() {
    // Implémentez le partage si nécessaire
    console.log('Partager le profil de', this.instructor?.name);
  }
}
