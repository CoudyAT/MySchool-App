import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Faq } from 'src/app/models/faq.model';
import { ApiService } from 'src/app/core/services/api.service';

export interface FaqFilters {
  category?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface FaqListResponse {
  data: Faq[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private readonly api = inject(ApiService);



  getAllFaqs(): Observable<Faq> {
    return this.api
      .get<Faq>('/faqs');
  }

  /**
   * Récupère les FAQs par catégorie (utilise le filtre de getAllFaqs)
   * GET /faqs?category=xxx
   */
  getFaqsByCategory(category: string): Observable<Faq> {
    return this.getAllFaqs();
  }

  /**
   * Récupère une FAQ spécifique par ID
   * GET /faqs/{id}
   */
  getFaqById(id: number): Observable<Faq> {
    return this.api.get<Faq>(`/faqs/${id}`);
  }

  /**
   * Recherche des FAQs (si l'endpoint existe sur le backend)
   * Sinon, utiliser getAllFaqs() et filtrer côté client
   */
  searchFaqs(query: string): Observable<Faq[]> {
    return this.api.get<Faq[]>('/faqs/search');
  }

  /**
   * Crée une nouvelle FAQ (admin)
   * POST /faqs
   */
  createFaq(faq: Faq): Observable<Faq> {
    return this.api.post<Faq>('/faqs', faq);
  }


  /**
   * Met à jour une FAQ existante (admin)
   * PUT /faqs/{id}
   */
  updateFaq(id: number, faq: Partial<Faq>): Observable<Faq> {
    return this.api.put<Faq>(`/faqs/${id}`, faq);
  }

  /**
   * Supprime une FAQ (admin)
   * DELETE /faqs/{id}
   */
  deleteFaq(id: number): Observable<void> {
    return this.api.delete<void>(`/faqs/${id}`);
  }

  /**
   * Marque une FAQ comme utile/pas utile
   * POST /faqs/{id}/helpful
   * Note: Vérifier si cet endpoint existe dans votre backend
   */
  markAsHelpful(id: number, helpful: boolean): Observable<any> {
    return this.api.post(`/faqs/${id}/helpful`, { helpful });
  }

  /**
   * Récupère les statistiques des FAQs
   * GET /faqs/stats
   * Note: Vérifier si cet endpoint existe dans votre backend
   */
  getStats(): Observable<any> {
    return this.api.get('/faqs/stats');
  }

  /**
   * Récupère uniquement les FAQs actives (helper)
   */
  getActiveFaqs(category?: string): Observable<Faq> {
    return this.getAllFaqs();
  }
}