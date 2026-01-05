import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Enrollment, Payment } from 'src/app/models/payment.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';
import { PaymentService } from 'src/app/features/services/paymentService';

@Component({
  selector: 'app-enrollments',
  templateUrl: './enrollments.page.html',
  styleUrls: ['./enrollments.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EnrollmentsPage implements OnInit {

  enrollments!: Enrollment;
  payments!: Payment;

  constructor(private enrollmentService: EnrollmentService, private paymentService: PaymentService) { }

  ngOnInit() {
    this.loadEnrollment();
    this.loadPayment();
  }

  loadEnrollment() {
    this.enrollmentService.getAllEnrollments().subscribe({
      next: (response: any) => {
        this.enrollments = response.data || [];
        console.log(this.enrollments);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des enrllments', err);
      }
    });

  }

  loadPayment() {
    this.paymentService.getAllPayments().subscribe({
      next: (response: any) => {
        this.payments = response.data || [];
        console.log("Tous les paiements", this.payments);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des paiements', err);
      }
    });
  }
}
