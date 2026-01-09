import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonBadge,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  bookOutline,
  checkmarkCircleOutline,
  timeOutline,
  cardOutline,
  cashOutline,
  calendarOutline,
  ribbonOutline,
  chevronBackOutline,
  chevronForwardOutline,
  searchOutline,
  checkmarkCircle,
} from 'ionicons/icons';
import { Enrollment, Payment } from 'src/app/models/payment.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';
import { PaymentService } from 'src/app/features/services/paymentService';

@Component({
  selector: 'app-enrollments',
  templateUrl: './enrollments.page.html',
  styleUrls: ['./enrollments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonBadge,
    IonIcon,
    IonButton,
  ],
})
export class EnrollmentsPage implements OnInit {
  enrollments: Enrollment[] = [];
  payments: Payment[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  paginatedEnrollments: Enrollment[] = [];

  constructor(
    private enrollmentService: EnrollmentService,
    private paymentService: PaymentService
  ) {
    // Enregistrer les icônes
    addIcons({
      'school-outline': schoolOutline,
      'book-outline': bookOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'time-outline': timeOutline,
      'card-outline': cardOutline,
      'cash-outline': cashOutline,
      'calendar-outline': calendarOutline,
      'ribbon-outline': ribbonOutline,
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'search-outline': searchOutline,
      'checkmark-circle': checkmarkCircle,
    });
  }

  ngOnInit() {
    this.loadEnrollment();
    this.loadPayment();
  }

  loadEnrollment() {
    this.enrollmentService.getAllEnrollments().subscribe({
      next: (response: any) => {
        this.enrollments = response.data || [];
        console.log('Enrollments:', this.enrollments);
        this.updatePagination();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des enrollments', err);
      },
    });
  }

  loadPayment() {
    this.paymentService.getAllPayments().subscribe({
      next: (response: any) => {
        this.payments = response.data || [];
        console.log('Tous les paiements', this.payments);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des paiements', err);
      },
    });
  }

  // Méthodes de pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.enrollments.length / this.itemsPerPage);
    this.updatePaginatedEnrollments();
  }

  updatePaginatedEnrollments() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEnrollments = this.enrollments.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedEnrollments();
      this.scrollToTop();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEnrollments();
      this.scrollToTop();
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedEnrollments();
      this.scrollToTop();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      // Afficher toutes les pages si peu de pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ellipsis
      if (this.currentPage <= 3) {
        // Début de la pagination
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        // Fin de la pagination
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu de la pagination
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  scrollToTop() {
    const content = document.querySelector('ion-content');
    content?.scrollToTop(300);
  }

  // Méthodes utilitaires
  getCompletedCount(): number {
    return this.enrollments.filter((e) => e.status === 'completed').length;
  }

  getActiveCount(): number {
    return this.enrollments.filter((e) => e.status === 'active').length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      completed: 'Terminé',
      pending: 'En attente',
      failed: 'Échoué',
    };
    return labels[status] || status;
  }
}
