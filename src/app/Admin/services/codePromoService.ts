import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';
import { CodePromo } from 'src/app/models/code-promo.model';

@Injectable({
  providedIn: 'root',
})
export class CodePromoPageService {
  private readonly api = inject(ApiService);


  getPromo(filters?: {
    influenceurId?: string;
    activeOnly?: boolean | null;
  }): Observable<any[]> {
    let params: any = {};

    if (filters?.influenceurId) {
      params.influenceurId = filters.influenceurId;
    }

    if (filters?.activeOnly !== null && filters?.activeOnly !== undefined) {
      params.activeOnly = filters.activeOnly;
    }

    return this.api.get<any>('/codes-promo', { params: filters }).pipe(
      map((res) =>
        (res.data || []).map((code: any) => ({
          ...code,
          expirationDate: code.expirationDate
            ? new Date(code.expirationDate._seconds * 1000)
            : null,
        })),
      ),
    );
  }

  deleteCode(code: string): Observable<any> {
    return this.api.delete(`/codes-promo/${code}`);
  }

  createCode(data: any): Observable<CodePromo> {
    return this.api.post('/codes-promo', data);
  }

  updateCode(code: string, data: CodePromo): Observable<CodePromo> {
    return this.api.put(`/codes-promo/${code}`, data);
  }
}

