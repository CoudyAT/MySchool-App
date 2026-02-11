import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DashboardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // Récupérer les derniers utilisateurs inscrits
  getRecentUsers() {
    // Logique pour récupérer les utilisateurs
  }
  // Récupérer les feedbacks récents
  getRecentFeedbacks() {
    // Logique pour récupérer les feedbacks
  }

  // insights pour les achats via l'application orange money
  getOrangeMoneyInsights() {
    // Logique pour récupérer les insights
  }

  // insights pour les achats via l'application wave
  getWaveInsights() {
    // Logique pour récupérer les insights
  }

  // insight 


}
