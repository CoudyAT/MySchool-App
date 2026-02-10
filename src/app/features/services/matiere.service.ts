import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class MatiereService {
  private readonly api = inject(ApiService);

  getMatieres(): Observable<any[]> {
    return this.api.get<any>('/matieres').pipe(map((res) => res.data || []));
  }

  getMatieresByClasse(classe: string): Observable<any[]> {
    return this.api
      .get<any>(`/matieres/classe/${encodeURIComponent(classe)}`)
      .pipe(map((res) => res.data || []));
  }
}