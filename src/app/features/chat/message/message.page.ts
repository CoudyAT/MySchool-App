import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonItem, IonSpinner, IonAvatar, IonFooter, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, sparkles, personOutline, chevronBackOutline } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonItem, IonSpinner, IonAvatar, IonFooter, IonTextarea],
})
export class MessagePage implements AfterViewChecked {

  @ViewChild(IonContent) private content!: IonContent;

  messages: Message[] = [
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis ton assistant IA. Comment puis-je t’aider aujourd’hui ?',
      timestamp: new Date()
    }
  ];

  newMessage = '';
  sending = false;

  constructor(private http: HttpClient) {
    addIcons({ chevronBackOutline, personOutline, send, sparkles });
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  sendMessage() {
    if (!this.newMessage.trim() || this.sending) return;

    const userMsg: Message = {
      role: 'user',
      content: this.newMessage.trim(),
      timestamp: new Date()
    };

    this.messages.push(userMsg);
    this.newMessage = '';

    // Message "en cours" de l'IA
    const loadingMsg: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };
    this.messages.push(loadingMsg);

    this.sending = true;


  }

  private scrollToBottom() {
    setTimeout(() => this.content.scrollToBottom(300), 100);
  }

  goBack() {
    window.history.back();
  }
}
