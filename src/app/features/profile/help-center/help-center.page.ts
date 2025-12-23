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
import { Faq, CategoryGroup } from 'src/app/models/faq.model';
import { FaqService } from '../../services/faq.service';

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
  loading = false;

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

  constructor(private router: Router, private faqService: FaqService) {
    addIcons({ chevronBackOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.loadFaqs();
  }

  private loadFaqs() {
    this.loading = true;

    this.faqService.getAllFaqs().subscribe({
      next: (response: any) => {
        const faqs: Faq[] = response.data || [];
        this.allFaqs = faqs.filter(f => f.isActive !== false);
        this.filteredFaqs = [...this.allFaqs];
        this.groupByCategory();

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement FAQ', err);
        this.loading = false;
      }
    });


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