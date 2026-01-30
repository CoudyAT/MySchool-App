import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';


import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonButtons,
  IonModal,
  IonTitle,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  starOutline,
  star,
  starHalf,
  playCircleOutline,
  peopleOutline,
  bookOutline,
  timeOutline,
  ribbonOutline,
  shareSocialOutline,
  calculatorOutline,
  closeOutline,
} from 'ionicons/icons';

import { InstructorService } from 'src/app/features/services/instructorService';
import { Instructor } from 'src/app/models/instructor.model';
import { Course } from 'src/app/models/course.model';
import { CourseService } from '../../services/courseService';

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
    IonButtons,
    IonModal,
    IonTitle,
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InstructorProfilePage implements OnInit {
  instructor: Instructor | null = null;
  instructorId: string = '';
  isLoading = true;
  instructorCourses: any[] = [];

  showCoursesModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private instructorService: InstructorService,
    private courseService: CourseService,
    private firestore: Firestore,
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
      closeOutline,
    });
  }

  ngOnInit() {
    this.instructorId = this.route.snapshot.paramMap.get('id') || '';
    this.loadInstructorData();
  }

  // loadInstructorData() {
  //   this.isLoading = true;

  //   this.instructorService.getInstructorById(this.instructorId).subscribe({
  //     next: (instructor) => {
  //       this.instructor = instructor;
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Erreur chargement instructeur :', error);
  //       this.isLoading = false;
  //     },
  //   });
  // }

  async loadInstructorData() {
    this.isLoading = true;

    this.instructorService.getInstructorById(this.instructorId).subscribe({
      next: async (instructor) => {
        const courses = await this.loadInstructorCourses(instructor.id);

        this.instructor = {
          ...instructor,
          courses: Array.isArray(courses) ? courses : [],
        };

        console.log('Cours chargés:', this.instructor.courses);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement instructeur :', error);
        this.isLoading = false;
      },
    });
  }

  loadCoursesByInstructor(instructorId: string) {
    this.courseService.getAllCourses().subscribe({
      next: (res: any) => {
        const allCourses = res.data || [];

        // 🔥 Filtre magique
        this.instructorCourses = allCourses.filter(
          (course: any) => course.instructorId === instructorId,
        );

        console.log('Cours du prof:', this.instructorCourses);
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
      },
    });
  }

  async loadInstructorCourses(instructorId: string): Promise<any[]> {
    console.log('🔎 Recherche cours pour instructorId =', instructorId);

    const coursesRef = collection(this.firestore, 'courses');

    const q = query(coursesRef, where('instructorId', '==', instructorId));

    const snapshot = await getDocs(q);

    console.log('📦 Nombre de cours trouvés :', snapshot.size);

    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('✅ Cours récupérés :', courses);

    return courses;
  }

  // 🔙 Retour
  goBack() {
    this.router.navigate(['/courses']);
  }

  // ⭐ Etoiles
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  // 📚 Modal
  openCoursesModal() {
    this.showCoursesModal = true;
  }

  closeCoursesModal() {
    this.showCoursesModal = false;
  }

  // ▶️ Ouvrir cours
  openCourse(course: Course) {
    this.closeCoursesModal();
    this.router.navigate(['/course-detail', course.id]);
  }

  // 🔗 Partage
  shareInstructor() {
    console.log('Partager', this.instructor?.name);
  }
}
