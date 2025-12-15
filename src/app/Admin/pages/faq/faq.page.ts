import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonBadge, IonButtons, IonSearchbar,
  IonModal, IonItemSliding, IonItemOptions, IonItemOption, IonSelect,
  IonSelectOption, IonTextarea, IonInput, IonChip, IonSpinner,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add, trashOutline, createOutline, closeOutline, checkmarkOutline,
  searchOutline, funnelOutline
} from 'ionicons/icons';
import { FaqService } from 'src/app/features/services/faq.service';
import { Faq } from 'src/app/models/faq.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel, IonBadge, IonButtons, IonSearchbar,
    IonModal, IonItemSliding, IonItemOptions, IonItemOption,
    IonSelect, IonSelectOption, IonTextarea, IonInput, IonChip,
    IonRefresher, IonRefresherContent
  ]
})
export class FaqPage implements OnInit {
  faqs: Faq[] = [];
  filteredFaqs: Faq[] = [];
  searchQuery = '';
  selectedCategory = 'all';
  isLoading = false;

  isModalOpen = false;
  isEditMode = false;
  currentFaq: Partial<Faq> = {
    question: '',
    answer: '',
    category: 'general',
    isActive: true
  };

  categories = [
    { value: 'general', label: 'Général' },
    { value: 'payments', label: 'Paiements' },
    { value: 'courses', label: 'Formations' },
    { value: 'enrollment', label: 'Inscription' },
    { value: 'certificates', label: 'Certificats' },
    { value: 'technical', label: 'Technique' },
    { value: 'account', label: 'Compte' },
    { value: 'referral', label: 'Parrainage' }
  ];

  constructor(private faqService: FaqService) {
    addIcons({
      add,
      trashOutline,
      createOutline,
      closeOutline,
      checkmarkOutline,
      searchOutline,
      funnelOutline
    });
  }

  ngOnInit() {
    this.loadFaqs();
  }

  async loadFaqs() {
    this.isLoading = true;
    try {
      this.faqs = await lastValueFrom(this.faqService.getAllFaqs());
      this.applyFilters();
    } catch (error) {
      console.error('Erreur lors du chargement des FAQs:', error);
      alert('Erreur lors du chargement des FAQs');
    } finally {
      this.isLoading = false;
    }
  }



  // Pull to refresh
  async doRefresh(event: any) {
    event.target.complete();
  }

  // Recherche
  onSearch() {
    this.applyFilters();
  }

  // Filtre par catégorie
  onFilterCategory() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.faqs]; // Créer une copie du tableau

    // Filtre par catégorie
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === this.selectedCategory);
    }

    // Filtre par recherche
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(f =>
        (f.question && f.question.toLowerCase().includes(query)) ||
        (f.answer && f.answer.toLowerCase().includes(query))
      );
    }

    this.filteredFaqs = filtered;
  }

  openAddFaqModal() {
    this.isEditMode = false;
    this.currentFaq = {
      question: '',
      answer: '',
      category: 'general',
      isActive: true
    };
    this.isModalOpen = true;
  }

  openEditFaqModal(faq: Faq) {
    this.isEditMode = true;
    this.currentFaq = { ...faq };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentFaq = {
      question: '',
      answer: '',
      category: 'general',
      isActive: true
    };
  }

  async saveFaq() {
    if (!this.currentFaq.question || !this.currentFaq.answer) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      if (this.isEditMode && this.currentFaq.id) {
        await lastValueFrom(
          this.faqService.updateFaq(this.currentFaq.id, this.currentFaq as Faq)
        );
      } else {
        await lastValueFrom(
          this.faqService.createFaq(this.currentFaq as Omit<Faq, 'id'>)
        );
        console.log('FAQ créée avec succès');

      }

      this.closeModal();

      setTimeout(async () => {
        this.faqs = []; // Vider d'abord
        this.filteredFaqs = [];
      }, 500);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la FAQ');
    }
  }

  async deleteFaq(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await lastValueFrom(this.faqService.deleteFaq(id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la FAQ');
      }
    }
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      general: 'primary',
      payments: 'warning',
      courses: 'tertiary',
      enrollment: 'success',
      certificates: 'warning',
      technical: 'danger',
      account: 'medium',
      referral: 'success'
    };
    return colors[cat] || 'medium';
  }

  getCategoryLabel(categoryKey: string): string {
    const category = this.categories.find(c => c.value === categoryKey);
    return category ? category.label : categoryKey;
  }
}