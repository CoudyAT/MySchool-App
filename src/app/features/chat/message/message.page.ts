import {
  AfterViewChecked,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonSpinner,
  IonAvatar,
  IonFooter,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  send,
  sparkles,
  personOutline,
  chevronBackOutline,
  alertCircle,
  time,
  checkmarkCircle,
  refresh,
  ellipsisHorizontal,
  attach,
  image,
  notificationsOutline,
  calendar,
  attachOutline,
} from 'ionicons/icons';

import { Message } from 'src/app/models/message.model';
import { ConversationService } from '../../services/conversation.service';
import { Auth } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonSpinner,
    IonAvatar,
    IonFooter,
    IonTextarea,
  ],
})
export class MessagePage implements OnInit {
  @ViewChild(IonContent) private content!: IonContent;
  isDesktop: boolean = false;

  messages: Message[] = [
    {
      role: 'assistant',
      content:
        "Bonjour ! Je suis ton assistant IA. Comment puis-je t'aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ];

  newMessage: string = '';
  sending: boolean = false;
  currentUser: any = null;
  userId: string = '';
  private auth = inject(Auth);

  constructor(
    private conversationService: ConversationService,
    private platform: Platform
  ) {
    addIcons({
      chevronBackOutline,
      personOutline,
      notificationsOutline,
      time,
      alertCircle,
      calendar,
      sparkles,
      attachOutline,
      send,
      checkmarkCircle,
      refresh,
      ellipsisHorizontal,
      attach,
      image,
    });
  }

  async ngOnInit() {
    this.isDesktop = this.platform.width() >= 768;
    // Détecter si on est sur desktop
    this.isDesktop = this.platform.width() >= 768;

    // Écouter les changements de taille
    this.platform.resize.subscribe(() => {
      this.isDesktop = this.platform.width() >= 768;
    });
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUser = user;
      console.log('Utilisateur chargé depuis localStorage:', this.currentUser);
      
      this.userId = user.id; //
      console.log('User ID depuis localStorage:', this.userId);
      this.loadConversationHistory();
      return;
    }

    // Si pas dans localStorage, fallback sur Firebase Auth
    const authUser = this.auth.currentUser;
    if (authUser) {
      this.userId = authUser.uid;
      this.loadConversationHistory();
    } else {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          this.userId = user.uid;
          this.loadConversationHistory();
        } else {
          this.handleNoUser();
        }
      });
    }
  }

  private async loadConversationHistory() {
    if (!this.userId) return;

    this.conversationService.getConversations(this.userId).subscribe({
      next: (response: any) => {
        //console.log('Historique complet:', response);

        if (response && response.success && response.data) {
          const conversation = response.data;

          if (conversation.messages && conversation.messages.length > 0) {
            this.messages = conversation.messages.map((m: any) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp?._seconds
                ? new Date(m.timestamp._seconds * 1000)
                : new Date(),
            }));

            //console.log('Messages chargés:', this.messages.length);
          }
        } else if (Array.isArray(response) && response.length > 0) {
          const conv = response[0];
          this.messages = conv.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement de l'historique", err);
      },
    });
  }

  /**
   * Gère le cas où aucun utilisateur n'est trouvé
   */
  private handleNoUser() {
    this.messages.push({
      role: 'assistant',
      content: 'Veuillez vous connecter pour utiliser le chatbot.',
      timestamp: new Date(),
    });
  }

  /**
   * Envoi du message au chatbot
   */
  async sendMessage() {
    const question = this.newMessage.trim();

    if (!question || this.sending) return;

    if (!this.userId) {
      console.error("Impossible d'envoyer le message: userId non défini");
      this.messages.push({
        role: 'assistant',
        content:
          'Erreur: utilisateur non identifié. Veuillez vous reconnecter.',
        timestamp: new Date(),
      });
      return;
    }

    // 1. Ajouter le message de l'utilisateur
    this.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date(),
    });

    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };
    this.messages.push(loadingMessage);

    this.newMessage = '';
    this.sending = true;

    setTimeout(() => this.scrollToBottom(), 100);

    this.conversationService.postQuestion(this.userId, question).subscribe({
      next: (response) => {
        // Supprimer le message loading
        const loadingIndex = this.messages.findIndex((m) => m.loading);
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1);
        }

        let botAnswer = "Désolé, je n'ai pas compris la réponse.";

        if (response && response.success && response.data) {
          botAnswer = response.data.answer;
        } else if (Array.isArray(response) && response.length > 0) {
          const conv = response[0];
          this.messages = conv.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
          this.sending = false;
          setTimeout(() => this.scrollToBottom(), 100);
          return;
        }

        // Ajouter la réponse du bot
        this.messages.push({
          role: 'assistant',
          content: botAnswer,
          timestamp: new Date(),
        });
      },
      error: (err) => {
        console.error('Erreur chatbot', err);

        // Supprimer le loading et ajouter un message d'erreur
        const loadingIndex = this.messages.findIndex((m) => m.loading);
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1);
        }

        this.messages.push({
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Réessaie plus tard.',
          timestamp: new Date(),
        });
      },
      complete: () => {
        this.sending = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
    });
  }

  private scrollToBottom(): void {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }
  /**
   * Retour à la page précédente
   */
  goBack() {
    window.history.back();
  }
}
