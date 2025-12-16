import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from "@ionic/angular";
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-cours',
  templateUrl: './detail-cours.page.html',
  styleUrls: ['./detail-cours.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
})
export class DetailCoursPage implements OnInit {
  constructor(private courseService: CourseService, private route: ActivatedRoute) { }
  course!: Course;
  courseId: string = '';



  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;

    if (!this.courseId) {
      console.error('ID du cours manquant');
      return;
    }
    this.courseService.getCourse(this.courseId).subscribe({
      next: (response: Course) => {
        this.course = response.data;
        console.log('Détails du cours chargés:', this.course);
      }
    });
  }
}
