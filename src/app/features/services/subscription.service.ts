import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly api = inject(ApiService);
  
  constructor(private http: HttpClient) {}

  getPlans(): Observable<any> {
    return this.api.get<any>('/subscriptions/plans');
  }
    
}
