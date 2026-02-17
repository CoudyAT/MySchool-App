import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { SubscriptionApiResponse } from 'src/app/models/subscription.model';


@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly api = inject(ApiService);

  constructor(private http: HttpClient) { }

  getPlans(): Observable<any> {
    return this.api.get<any>('/subscriptions/plans');
  }

  getUserSubscriptions(userId: number): Observable<SubscriptionApiResponse> {
    return this.api.get<SubscriptionApiResponse>(
      `/subscriptions/user/${userId}`
    );
  }

  getSubscriptionActive(userId: number): Observable<SubscriptionApiResponse> {
    return this.api.get<SubscriptionApiResponse>(
      `/subscriptions/active/${userId}`
    );
  }
}
