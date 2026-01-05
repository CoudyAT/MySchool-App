import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-instructor-details',
  templateUrl: './instructor-details.page.html',
  styleUrls: ['./instructor-details.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InstructorDetailsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
