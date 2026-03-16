import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PaymentService } from '../services/paymentService';
import {
  IonContent,
  IonButton,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonIcon,
  IonTitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-payments-history',
  templateUrl: './payments-history.page.html',
  styleUrls: ['./payments-history.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonIcon,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonButton,
    IonContent,
    CommonModule,
    IonContent,
  ],
})
export class PaymentsHistoryPage implements OnInit {
  payments: any[] = [];
  isLoading = true;
  userId: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private paymentService: PaymentService,
  ) {}

  ngOnInit() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.userId = localUser?.id;
    if (this.userId) {
      this.paymentService.getUserPayments(this.userId).subscribe({
        next: (response) => {
          this.payments = response.data || [];
          console.log('ff', this.payments);

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  convertTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    // Si c'est un objet Firestore avec _seconds
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }

    // Si c'est déjà une date ou un timestamp milliseconde
    return new Date(timestamp);
  }
}
