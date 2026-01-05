import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  personOutline,
  businessOutline,
  checkmarkCircle,
} from 'ionicons/icons';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';

import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.page.html',
  styleUrls: ['./subscription-plans.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonTitle,
    IonButtons,
    IonIcon,
    IonHeader,
    IonButton,
    IonToolbar,
    CommonModule,
  ],
})
export class SubscriptionPlansPage implements OnInit {
  plans: any[] = [];
  loading = false;

  courseId = '';
  courseTitle = '';
  courseImage = '';
  course: any = {};

  constructor(
    private router: Router,
    private location: Location,
    private subscriptionService: SubscriptionService
  ) {
    addIcons({
      chevronBackOutline,
      personOutline,
      checkmarkCircle,
      businessOutline: businessOutline,
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.course = navigation.extras.state['course'] || {};
      this.courseId = navigation.extras.state['courseId'];
      this.courseTitle = navigation.extras.state['courseTitle'];
      this.courseImage = navigation.extras.state['courseImage'];
    }
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.loading = true;

    this.subscriptionService.getPlans().subscribe({
      next: (res) => {
        if (res.success) {
          this.plans = res.data
            .filter((plan: any) => plan.price === 5000)
            .map((plan: any) => ({
              ...plan,
              plan: 'Annuelle', // 🔥 remplace MONTHLY
              duration: 'an', // optionnel
            }));
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement plans', err);
        this.loading = false;
      },
    });
  }

  goBack() {
    this.location.back();
  }

  selectPlan(plan: any) {
    this.router.navigate(['/payment-method'], {
      state: {
        course: this.course,
        plan,
        courseId: this.courseId,
        courseTitle: this.courseTitle,
        courseImage: this.courseImage,
      },
    });
  }
}
