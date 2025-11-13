import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import {
  chevronBackOutline,
  languageOutline,
  playCircle,
  star,
  starHalf,
  downloadOutline,
} from 'ionicons/icons';
import { Router, ActivatedRoute } from '@angular/router'; // Ajoutez ActivatedRoute
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-course-video',
  templateUrl: './course-video.page.html',
  styleUrls: ['./course-video.page.scss'],
  imports: [
    IonCardContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
  ],
})
export class CourseVideoPage implements OnInit {
  course: any = {}; // Initialiser comme objet vide
  enrollment: any;
  progress: number = 0;

  constructor(
    private router: Router,
    private location: Location,
    private route: ActivatedRoute // Injectez ActivatedRoute
  ) {
    addIcons({
      chevronBackOutline,
      languageOutline,
      downloadOutline,
      star,
      starHalf,
    });
  }

  ngOnInit() {
    // Récupérer les données passées depuis cours-detail
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.course = navigation.extras.state['course'] || {};
      this.enrollment = navigation.extras.state['enrollment'];
      this.progress = navigation.extras.state['progress'] || 0;

      console.log('📋 Données du cours reçues:', this.course);
      console.log('📊 Progression:', this.progress + '%');
      console.log('📝 Enrollment:', this.enrollment);
    }

    // Récupérer l'ID du cours depuis l'URL
    const courseId = this.route.snapshot.paramMap.get('id');
    console.log('🎬 CourseVideoPage - ID du cours:', courseId);

    // Si pas de données reçues, charger depuis le service
    if (!this.course.title) {
      this.loadCourseData(courseId);
    }
  }

  // Méthode de fallback si pas de données reçues
  private loadCourseData(courseId: string | null) {
    if (!courseId) return;

    // Ici vous pouvez appeler un service pour charger les données du cours
    console.log('🔄 Chargement des données du cours depuis le service...');
    // this.courseService.getCourse(courseId).subscribe(course => {
    //   this.course = course;
    // });
  }

  goBack() {
    //this.location.back(); 
    this.router.navigate(['/course-detail', this.course.id]);
  }

  startCourse() {
    console.log('🎬 Démarrage du cours:', this.course.title);
    // Logique pour démarrer la vidéo
  }

  // Méthode utilitaire pour obtenir la durée formatée
  getFormattedDuration(): string {
    if (this.course.duration) {
      return this.course.duration;
    }
    return this.course.sessions ? `${this.course.sessions} min` : '25 min';
  }

  // Méthode utilitaire pour obtenir le nombre de chapitres
  getChaptersCount(): number {
    return this.course.chapters?.length || this.course.exercises || 15;
  }

  getFormattedDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      let date: Date;

      // Gérer le timestamp Firestore
      if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '';
    }
  }

  // Méthode pour générer les étoiles
  // getStars(rating: number, maxRating: number = 5): string[] {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 >= 0.5;

  //   for (let i = 1; i <= maxRating; i++) {
  //     if (i <= fullStars) {
  //       stars.push('full');
  //     } else if (i === fullStars + 1 && hasHalfStar) {
  //       stars.push('half');
  //     } else {
  //       stars.push('empty');
  //     }
  //   }
  //   return stars;
  // }
}
