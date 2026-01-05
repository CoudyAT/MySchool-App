import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-edit-cours',
  templateUrl: './edit-cours.page.html',
  styleUrls: ['./edit-cours.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class EditCoursPage implements OnInit {
  course!: Course;
  courseId: string = '';
  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    if (!this.courseId) {
      console.error('ID du cours manquant');
      return;
    }

    this.courseService.getCourse(this.courseId).subscribe({
      next: (response: Course) => {
        this.course = response;
        console.log('Détails du cours chargés:', this.course);
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin-login/list-cours']);
  }

  saveCourse() {
    if (!this.courseId || !this.course) {
      console.error('Cours ou ID manquant');
      return;
    }

    this.courseService.updateCourse(this.courseId, this.course).subscribe({
      next: (response: any) => {
        console.log('Cours mis à jour avec succès', response);
        this.showToast('Cours mis à jour avec succès', 'success');
        // Optionnel : message toast ou redirection
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour', err);
      },
    });
  }

  private async showToast(
    message: string,
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: color as any,
    });
    await toast.present();
  }
}
