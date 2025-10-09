import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonIcon, IonButton } 
 from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cardOutline, chevronBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.page.html',
  styleUrls: ['./payment-method.page.scss'],
  imports: [
    IonIcon,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton
] 
})
export class PaymentMethodPage implements OnInit {
  selectedPlan: any;

  paymentMethods = [
    {
      id: 'wave',
      name: 'Wave',
      logo: 'assets/wave-logo.png',
      bgColor: '#00D9FF',
      textColor: '#fff',
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      logo: 'assets/orange-money-logo.png',
      bgColor: '#fff',
      textColor: '#000',
      border: true,
    },
    {
      id: 'yas-mixx',
      name: 'Yas Mixx',
      logo: 'assets/yas-mixx-logo.png',
      bgColor: '#FFD500',
      textColor: '#000',
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      logo: 'card-outline',
      bgColor: '#2a2a2a',
      textColor: '#fff',
      isIcon: true,
    },
  ];

  constructor(private router: Router, private location: Location) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'card-outline': cardOutline,
    });

    // Récupérer le plan sélectionné depuis la navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.selectedPlan = navigation.extras.state['plan'];
    }
  }

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  selectPaymentMethod(method: any) {
    console.log('Méthode de paiement sélectionnée:', method);
    console.log('Plan:', this.selectedPlan);

    // Rediriger vers la page de paiement appropriée
    // this.router.navigate(['/payment-process'], {
    //   state: { method, plan: this.selectedPlan }
    // });
  }
}
