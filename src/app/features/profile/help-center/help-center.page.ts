import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
  IonLabel, IonItem, IonInput, IonAccordion, IonAccordionGroup, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, informationCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

interface Faq {
  question: string;
  answer: string;
  category: string;
}

interface CategoryGroup {
  title: string;
  key: string;
  faqs: Faq[];
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  templateUrl: './help-center.page.html',
  styleUrls: ['./help-center.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonInput, IonItem,
    IonLabel, IonAccordionGroup, IonAccordion, IonSpinner
  ]
})
export class HelpCenterPage implements OnInit {

  searchQuery = '';
  allFaqs: Faq[] = [];
  filteredFaqs: Faq[] = [];
  categories: CategoryGroup[] = [];
  loading = false; // Plus de vrai loading, mais on garde le flag pour le template

  // Ordre et titres des catégories
  private categoryOrder = ['general', 'enrollment', 'courses', 'certificates', 'payments', 'technical', 'account'];
  private categoryTitles: { [key: string]: string } = {
    general: 'Général',
    enrollment: 'Inscription & Accès',
    courses: 'Formations & Cours',
    certificates: 'Certificats',
    payments: 'Paiements & Facturation',
    technical: 'Problèmes techniques',
    account: 'Mon compte'
  };

  constructor(private router: Router) {
    addIcons({ chevronBackOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.loadStaticFaqs();
  }

  private loadStaticFaqs() {
    this.allFaqs = [
      {
        question: "Qu’est-ce que MySchool Sénégal ?",
        answer: "MySchool Sénégal est une plateforme d’apprentissage en ligne dédiée au développement des compétences professionnelles. Nous proposons des formations, masterclasses et projets tutorés accessibles à tous au Sénégal et en Afrique.",
        category: "general"
      },
      {
        question: "À qui s’adressent vos formations ?",
        answer: "À tous ! Étudiants, professionnels, entrepreneurs, demandeurs d’emploi… Aucune condition de diplôme n’est requise.",
        category: "general"
      },
      {
        question: "Comment s’inscrire sur la plateforme ?",
        answer: "Cliquez sur « S’inscrire » en haut à droite, renseignez votre email et un mot de passe, puis validez via le lien reçu par mail. C’est gratuit !",
        category: "enrollment"
      },
      {
        question: "La plateforme est-elle accessible sur mobile ?",
        answer: "Oui, parfaitement ! Vous pouvez suivre vos cours sur smartphone, tablette ou ordinateur.",
        category: "technical"
      },
      {
        question: "J’ai oublié mon mot de passe, que faire ?",
        answer: "Sur la page de connexion, cliquez sur « Mot de passe oublié ? », entrez votre email et suivez le lien de réinitialisation.",
        category: "account"
      },
      {
        question: "Quels types de formations proposez-vous ?",
        answer: "Masterclasses, formations certifiantes, ateliers pratiques, projets tutorés dans les domaines du numérique, entrepreneuriat, management, marketing, etc.",
        category: "courses"
      },
      {
        question: "Comment accéder à mes cours après inscription ?",
        answer: "Connectez-vous → Menu → « Mes cours ». Tous vos cours actifs apparaissent avec un bouton « Commencer ».",
        category: "courses"
      },
      {
        question: "Quelle est la durée moyenne d’une formation ?",
        answer: "Entre 5 et 30 heures selon le format. Vous avancez à votre rythme, sans contrainte de date.",
        category: "courses"
      },
      {
        question: "Y a-t-il des quizzes et exercices ?",
        answer: "Oui ! Chaque module contient des quizzes, exercices pratiques et parfois un projet final pour valider vos compétences.",
        category: "courses"
      },
      {
        question: "Les certificats sont-ils reconnus ?",
        answer: "Oui, nos certificats sont reconnus par de nombreuses entreprises au Sénégal et à l’international. Ils sont signés et vérifiables en ligne.",
        category: "certificates"
      },
      {
        question: "Comment obtenir mon certificat ?",
        answer: "Terminez tous les modules + validez l’évaluation finale (note ≥ 70%). Le certificat est généré automatiquement et téléchargeable.",
        category: "certificates"
      },
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer: "Orange Money, Wave, Free Money, carte bancaire (Visa/Mastercard), virement bancaire.",
        category: "payments"
      },
      {
        question: "Puis-je payer en plusieurs fois ?",
        answer: "Oui, pour les formations > 50 000 FCFA, nous proposons un paiement en 2 ou 3 fois sans frais.",
        category: "payments"
      },
      {
        question: "Y a-t-il des promotions ou codes promo ?",
        answer: "Oui régulièrement ! Inscrivez-vous à la newsletter et suivez-nous sur les réseaux pour ne rien rater.",
        category: "payments"
      },
      {
        question: "Je n’arrive pas à lire une vidéo, que faire ?",
        answer: "Vérifiez votre connexion → Essayez un autre navigateur → Videz le cache → Contactez-nous si le problème persiste.",
        category: "technical"
      },
      {
        question: "Comment contacter le support ?",
        answer: "Par email à support@myschool.sn ou directement via le bouton « Contacter le support » en bas de cette page. Réponse sous 24-48h.",
        category: "technical"
      }
    ];

    this.filteredFaqs = [...this.allFaqs];
    this.groupByCategory();
  }

  private groupByCategory() {
    this.categories = this.categoryOrder
      .map(key => ({
        title: this.categoryTitles[key],
        key,
        faqs: this.filteredFaqs.filter(f => f.category === key)
      }))
      .filter(cat => cat.faqs.length > 0); // N’affiche que les catégories non vides
  }

  onSearch() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredFaqs = [...this.allFaqs];
    } else {
      this.filteredFaqs = this.allFaqs.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }
    this.groupByCategory();
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  contactSupport() {
    window.location.href = 'mailto:support@myschool.sn';
  }
}