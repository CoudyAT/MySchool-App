import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payments-history',
  templateUrl: './payments-history.page.html',
  styleUrls: ['./payments-history.page.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class PaymentsHistoryPage implements OnInit {
  payments: any[] = [];
  isLoading = true;
  userId: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.userId = localUser?.uid || localUser?.id || '';
    if (this.userId) {
      this.http.get<any[]>(`/api/payments/user/${this.userId}`).subscribe({
        next: (data) => {
          this.payments = data || [];
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
}
