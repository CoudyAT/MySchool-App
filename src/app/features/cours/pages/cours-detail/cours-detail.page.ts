// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule, Location } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { Subscription } from 'rxjs';
// import {
//   IonContent,
//   IonHeader,
//   IonTitle,
//   IonToolbar,
//   IonButton,
//   IonCard,
//   IonCardContent,
//   IonIcon,
//   IonSearchbar,
//   IonButtons,
//   IonSpinner,
// } from '@ionic/angular/standalone';
// import {
//   arrowBackOutline,
//   checkmarkCircle,
//   chevronBackOutline,
//   flagOutline,
//   helpCircleOutline,
//   languageOutline,
//   star,
//   starHalf,
//   starOutline,
//   timeOutline,
//   trophyOutline,
// } from 'ionicons/icons';
// import { addIcons } from 'ionicons';
// import { CourseService } from 'src/app/features/services/courseService';
// import { Course } from 'src/app/models/course.model';

// @Component({
//   selector: 'app-cours-detail',
//   templateUrl: './cours-detail.page.html',
//   styleUrls: ['./cours-detail.page.scss'],
//   standalone: true,
//   imports: [
//     IonContent,
//     IonHeader,
//     CommonModule,
//     FormsModule,
//     IonButton,
//     IonIcon,
//     IonTitle,
//     IonToolbar,
//     IonButtons,
//     RouterModule,
//     IonCard,
//     IonCardContent,
//   ],
// })
// export class CoursDetailPage implements OnInit, OnDestroy {
//   course: Course | null = null;
//   isLoading = true;
//   private courseSubscription: Subscription = new Subscription();

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private location: Location,
//     private courseService: CourseService
//   ) {
//     // Enregistrer toutes les icônes nécessaires
//     addIcons({
//       chevronBackOutline,
//       languageOutline,
//       star,
//       starHalf,
//       starOutline: starOutline,
//       checkmarkCircle: checkmarkCircle,
//       flagOutline: flagOutline,
//       timeOutline: timeOutline,
//       helpCircleOutline: helpCircleOutline,
//       trophyOutline: trophyOutline,
//       arrowBackOutline: arrowBackOutline,
//     });
//   }

//   ngOnInit() {
//     this.loadCourseDetails();
//   }

//   ngOnDestroy() {
//     this.courseSubscription.unsubscribe();
//   }

//   loadCourseDetails() {
//     const courseId = this.route.snapshot.paramMap.get('id');

//     if (courseId) {
//       console.log('Loading course details for ID:', courseId);

//       this.courseSubscription = this.courseService
//         .getCourse(courseId)
//         .subscribe({
//           next: (courseData) => {
//             if (courseData) {
//               this.course = {
//                 ...courseData,
//                 // Assurer que les propriétés optionnelles ont des valeurs par défaut
//                 levels: courseData.levels || this.getDefaultLevels(),
//                 rating: courseData.rating || 0,
//                 maxRating: courseData.maxRating || 5,
//                 image: courseData.image || 'assets/images/default-course.jpg',
//               };
//               console.log('Course loaded:', this.course);
//             } else {
//               console.error('Course not found');
//               // Rediriger vers la page des cours ou afficher un message d'erreur
//               this.router.navigate(['/mes-cours']);
//             }
//             this.isLoading = false;
//           },
//           error: (error) => {
//             console.error('Error loading course:', error);
//             this.isLoading = false;
//             // Gérer l'erreur (afficher un message, rediriger, etc.)
//           },
//         });
//     } else {
//       console.error('No course ID provided');
//       this.router.navigate(['/mes-cours']);
//     }
//   }

//   // Méthode pour générer les niveaux par défaut si non fournis
//   private getDefaultLevels() {
//     return [
//       { icon: 'flag-outline', completed: false },
//       { icon: 'time-outline', completed: false },
//       { icon: 'help-circle-outline', completed: false },
//       { icon: 'help-circle-outline', completed: false },
//       { icon: 'trophy-outline', completed: false },
//     ];
//   }

//   // Générer les étoiles pour l'affichage
//   getStars(rating: number, maxRating: number = 5) {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 1; i <= maxRating; i++) {
//       if (i <= fullStars) {
//         stars.push('full');
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         stars.push('half');
//       } else {
//         stars.push('empty');
//       }
//     }
//     return stars;
//   }

//   goBack() {
//     this.location.back();
//   }

//   enrollNow() {
//     if (this.course) {
//       console.log("S'inscrire au cours:", this.course.title);
//       console.log('🔍 CoursDetailPage - Données avant navigation:', {
//         courseId: this.course.id,
//         courseTitle: this.course.title,
//         courseImage: this.course.image,
//       });

//       // ⭐ CORRECTION: PASSEZ LES DONNÉES DU COURS DANS LE STATE
//       this.router.navigate(['/subscription-plans'], {
//         state: {
//           courseId: this.course.id,
//           courseTitle: this.course.title,
//           courseImage: this.course.image || 'assets/images/default-course.jpg',
//         },
//       });
//     }
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  IonButtons,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  arrowBackOutline,
  checkmarkCircle,
  chevronBackOutline,
  flagOutline,
  helpCircleOutline,
  languageOutline,
  star,
  starHalf,
  starOutline,
  timeOutline,
  trophyOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CourseService } from 'src/app/features/services/courseService';
import { Course } from 'src/app/models/course.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService'; // Ajouter cet import

@Component({
  selector: 'app-cours-detail',
  templateUrl: './cours-detail.page.html',
  styleUrls: ['./cours-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonButtons,
    RouterModule,
    IonCard,
    IonCardContent,
  ],
})
export class CoursDetailPage implements OnInit, OnDestroy {
  course: Course | null = null;
  isLoading = true;
  isUserEnrolled = false;
  enrollmentProgress = 0;
  currentEnrollment: any = null;

  private courseSubscription: Subscription = new Subscription();
  private enrollmentSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService // Ajouter le service
  ) {
    addIcons({
      chevronBackOutline,
      languageOutline,
      star,
      starHalf,
      starOutline: starOutline,
      checkmarkCircle: checkmarkCircle,
      flagOutline: flagOutline,
      timeOutline: timeOutline,
      helpCircleOutline: helpCircleOutline,
      trophyOutline: trophyOutline,
      arrowBackOutline: arrowBackOutline,
    });
  }

  ngOnInit() {
    this.loadCourseDetails();
  }

  ngOnDestroy() {
    this.courseSubscription.unsubscribe();
    this.enrollmentSubscription.unsubscribe();
  }

  loadCourseDetails() {
    const courseId = this.route.snapshot.paramMap.get('id');

    if (courseId) {
      console.log('Loading course details for ID:', courseId);

      this.courseSubscription = this.courseService
        .getCourse(courseId)
        .subscribe({
          next: (courseData) => {
            if (courseData) {
              this.course = {
                ...courseData,
                levels: courseData.levels || this.getDefaultLevels(),
                rating: courseData.rating || 0,
                maxRating: courseData.maxRating || 5,
                image: courseData.image || 'assets/images/default-course.jpg',
              };
              console.log('Course loaded:', this.course);

              // Vérifier si l'utilisateur est déjà inscrit à ce cours
              this.checkUserEnrollment(courseId);
            } else {
              console.error('Course not found');
              this.router.navigate(['/mes-cours']);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading course:', error);
            this.isLoading = false;
          },
        });
    } else {
      console.error('No course ID provided');
      this.router.navigate(['/mes-cours']);
    }
  }

  checkUserEnrollment(courseId: string) {
    this.enrollmentSubscription = this.enrollmentService
      .getUserEnrollments()
      .subscribe({
        next: (enrollments: any[]) => {
          console.log('Enrollments trouvés:', enrollments);

          // Vérifier si l'utilisateur est inscrit à ce cours
          const enrollment = enrollments.find(
            (enroll) => enroll.courseId === courseId
          );

          if (enrollment) {
            this.isUserEnrolled = true;
            this.currentEnrollment = enrollment;
            this.enrollmentProgress = enrollment.progress || 0;
            console.log(
              'Utilisateur déjà inscrit, progression:',
              this.enrollmentProgress + '%'
            );
          } else {
            this.isUserEnrolled = false;
            console.log('Utilisateur non inscrit à ce cours');
          }
        },
        error: (error) => {
          console.error('Erreur vérification inscription:', error);
          this.isUserEnrolled = false;
        },
      });
  }

  // Méthode pour générer les niveaux par défaut si non fournis
  private getDefaultLevels() {
    return [
      { icon: 'flag-outline', completed: false },
      { icon: 'time-outline', completed: false },
      { icon: 'help-circle-outline', completed: false },
      { icon: 'help-circle-outline', completed: false },
      { icon: 'trophy-outline', completed: false },
    ];
  }

  // Générer les étoiles pour l'affichage
  getStars(rating: number, maxRating: number = 5) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= maxRating; i++) {
      if (i <= fullStars) {
        stars.push('full');
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  goBack() {
    this.location.back();
  }

  enrollNow() {
    if (this.course) {
      console.log("S'inscrire au cours:", this.course.title);
      console.log('🔍 CoursDetailPage - Données avant navigation:', {
        courseId: this.course.id,
        courseTitle: this.course.title,
        courseImage: this.course.image,
      });

      this.router.navigate(['/subscription-plans'], {
        state: {
          courseId: this.course.id,
          courseTitle: this.course.title,
          courseImage: this.course.image || 'assets/images/default-course.jpg',
        },
      });
    }
  }

  continueCourse() {
    if (this.course && this.currentEnrollment) {
      console.log('Continuer le cours:', this.course.title);
      console.log('Progression actuelle:', this.enrollmentProgress + '%');

      // Rediriger vers la page du cours/player
      this.router.navigate(['/course-player', this.course.id], {
        state: {
          enrollment: this.currentEnrollment,
          course: this.course,
        },
      });
    }
  }
}
