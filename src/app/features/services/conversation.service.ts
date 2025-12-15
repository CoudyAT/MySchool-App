import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Conversation } from 'src/app/models/conversation.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private readonly api = inject(ApiService);

  // Poser une question au chatbot
  postQuestion(userId: string, question: string): Observable<any> {
    return this.api.post<any>(
      '/chat/ask',
      { userId, question }
    );
  }
  // Obtenir l'historique de conversation
  getConversations(userId: string): Observable<Conversation[]> {
    return this.api.get<Conversation[]>(`/chat/history/${userId}`);
  }
  // Effacer l'historique de conversation
  // Donner une feedback sur une réponse

}

