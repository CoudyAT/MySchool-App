import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import {  Matiere } from 'src/app/models/course.model';

@Injectable({
    providedIn: 'root',
})
export class MatiereService {
    private readonly api = inject(ApiService);

    getMatiereActives(): Observable<Matiere[]> {
        return this.api
            .get<any>('/matieres')
            .pipe(map((res) => res?.data ?? []));
    }

    getAllMatiere(): Observable<Matiere[]> {
        return this.api
            .get<any>('/matieres')
            .pipe(map((res) => res?.data ?? []));
    }

    getMatiereByNiveau(niveau: string): Observable<Matiere[]> {
        return this.api
            .get<any>(`/matieres/niveau/${niveau}`)
            .pipe(map((res) => res?.data ?? []));
    }

    getMatiereByClasse(classe: string): Observable<Matiere[]> {
        return this.api
            .get<any>(`/matieres/classe/${encodeURIComponent(classe)}`)
            .pipe(map((res) => res?.data ?? []));
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
