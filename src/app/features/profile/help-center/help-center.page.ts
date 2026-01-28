import { Component, OnInit } from '@angular/core';
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
  IonLabel,
  IonItem,
  IonInput,
  IonAccordion,
  IonAccordionGroup,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  informationCircleOutline,
  helpCircleOutline,
  searchOutline,
  helpOutline,
  chevronDownOutline,
  thumbsUpOutline,
  thumbsDownOutline,
  chatbubbleOutline,
  mailOutline,
  timeOutline,
  callOutline,
  personCircleOutline,
  schoolOutline,
  cardOutline,
  settingsOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { Faq, CategoryGroup } from 'src/app/models/faq.model';
import { FaqService } from '../../services/faq.service';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-help-center',
  standalone: true,
  templateUrl: './help-center.page.html',
  styleUrls: ['./help-center.page.scss'],
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
    IonInput,
    IonItem,
    IonLabel,
    IonAccordionGroup,
    IonAccordion,
    IonSpinner,
    DesktopHeaderComponent,
  ],
})
export class HelpCenterPage implements OnInit {
  searchQuery = '';
  allFaqs: Faq[] = [];
  filteredFaqs: Faq[] = [];
  categories: CategoryGroup[] = [];
  loading = false;

  // Ordre et titres des catégories
  private categoryOrder = [
    'general',
    'enrollment',
    'courses',
    'certificates',
    'payments',
    'technical',
    'account',
  ];

  private categoryTitles: { [key: string]: string } = {
    general: 'Général',
    enrollment: 'Inscription & Accès',
    courses: 'Formations & Cours',
    certificates: 'Certificats',
    payments: 'Paiements & Facturation',
    technical: 'Problèmes techniques',
    account: 'Mon compte',
  };

  // Icônes pour chaque catégorie
  private categoryIcons: { [key: string]: string } = {
    general: 'help-outline',
    enrollment: 'person-circle-outline',
    courses: 'school-outline',
    certificates: 'award-outline',
    payments: 'card-outline',
    technical: 'settings-outline',
    account: 'person-outline',
  };

  constructor(private router: Router, private faqService: FaqService) {
    addIcons({
      chevronBackOutline,
      helpCircleOutline,
      searchOutline,
      helpOutline,
      chevronDownOutline,
      thumbsUpOutline,
      thumbsDownOutline,
      chatbubbleOutline,
      mailOutline,
      timeOutline,
      callOutline,
      informationCircleOutline,
      personCircleOutline,
      schoolOutline,
      cardOutline,
      settingsOutline,
    });
  }

  ngOnInit() {
    this.loadFaqs();
  }

  /**
   * Charger toutes les FAQs depuis le service
   */
  private loadFaqs() {
    this.loading = true;

    this.faqService.getAllFaqs().subscribe({
      next: (response: any) => {
        // Récupérer les FAQs actives
        const faqs: Faq[] = response.data || [];
        this.allFaqs = faqs.filter((f) => f.isActive !== false);
        this.filteredFaqs = [...this.allFaqs];

        // Grouper par catégorie
        this.groupByCategory();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des FAQs:', err);
        this.loading = false;
        // Afficher un message d'erreur si nécessaire
      },
    });
  }

  /**
   * Grouper les FAQs par catégorie
   */
  private groupByCategory() {
    this.categories = this.categoryOrder
      .map((key) => ({
        title: this.categoryTitles[key],
        key,
        faqs: this.filteredFaqs.filter((f) => f.category === key),
      }))
      .filter((cat) => cat.faqs.length > 0); // N'affiche que les catégories avec des FAQs
  }

  /**
   * Rechercher dans les FAQs
   */
  onSearch() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      // Si la recherche est vide, afficher toutes les FAQs
      this.filteredFaqs = [...this.allFaqs];
    } else {
      // Filtrer par question ET réponse
      this.filteredFaqs = this.allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    // Regrouper les résultats filtrés
    this.groupByCategory();
  }

  /**
   * Obtenir l'icône d'une catégorie
   */
  getCategoryIcon(categoryTitle: string): string {
    // Chercher par titre
    for (const key in this.categoryTitles) {
      if (this.categoryTitles[key] === categoryTitle) {
        return this.categoryIcons[key] || 'help-outline';
      }
    }
    return 'help-outline';
  }

  /**
   * Marquer une FAQ comme utile ou non
   */
  markHelpful(faqId: string, isHelpful: boolean) {
    console.log(
      `FAQ ${faqId} marquée comme ${isHelpful ? 'utile' : 'non utile'}`
    );

    // À implémenter : envoyer le feedback au backend
    // this.faqService.sendFeedback(faqId, isHelpful).subscribe({
    //   next: () => {
    //     // Afficher un toast de confirmation
    //     console.log('Merci pour votre retour !');
    //   },
    //   error: (err) => {
    //     console.error('Erreur lors de l\'envoi du feedback:', err);
    //   }
    // });
  }

  /**
   * Contacter le support
   */
  contactSupport() {
    // Ouvrir le client email par défaut
    window.location.href =
      "mailto:support@myschool.sn?subject=Support%20MySchool&body=Bonjour%2C%0A%0AJ'ai%20besoin%20d'aide%20avec%3A%0A%0AMerci";

    // Alternative : rediriger vers une page de contact
    // this.router.navigate(['/support-form']);

    // Alternative : ouvrir un modal
    // this.modalController.create({
    //   component: SupportFormComponent
    // }).then(modal => modal.present());
  }

  /**
   * Revenir à la page précédente
   */
  goBack() {
    this.router.navigate(['/profile']);
  }
}
