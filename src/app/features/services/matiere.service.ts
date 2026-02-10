import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Matiere } from 'src/app/models/course.model';

@Injectable({
    providedIn: 'root',
})
export class MatiereService {
    private readonly api = inject(ApiService);

    getMatieresActives(): Observable<Matiere[]> {
        return this.api
            .get<any>('/matieres')
            .pipe(map((res) => res?.data ?? []));
    }

    getAllMatieres(): Observable<Matiere[]> {
        return this.api
            .get<any>('/matieres')
            .pipe(map((res) => res?.data ?? []));
    }

    getMatieresByNiveau(niveau: string): Observable<Matiere[]> {
        return this.api
            .get<Matiere[]>(`/matieres/niveau/${niveau}`);
    }

    getMatieresByClasse(classe: string): Observable<Matiere[]> {
        return this.api
            .get<Matiere[]>(`/matieres/classe/${classe}`);
    }

    getMatiereById(id: string): Observable<Matiere> {
        return this.api
            .get<Matiere>(`/matieres/${id}`)
            .pipe(map((res) => res));
    }

    createMatiere(matiere: Partial<Matiere>): Observable<Matiere> {
        return this.api.post<Matiere>('/matieres', matiere);
    }

    updateMatiere(id: string, matiere: Partial<Matiere>): Observable<Matiere> {
        return this.api.put<Matiere>(`/matieres/${id}`, matiere);
    }

    deleteMatiere(id: string): Observable<void> {
        return this.api.delete<void>(`/matieres/${id}`);
    }

}