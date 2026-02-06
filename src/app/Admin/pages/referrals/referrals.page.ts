import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ToastController, AlertController } from '@ionic/angular';

import { Referral, ReferralService, ReferralStats } from 'src/app/features/services/referral.service';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.page.html',
  styleUrls: ['./referrals.page.scss'],
  standalone: true,
  imports: [

    CommonModule,
    FormsModule
  ]
})
export class ReferralsPage implements OnInit {

  isLoading = false;

  referrals: Referral[] = [];
  filteredReferrals: Referral[] = [];
  paginatedReferrals: Referral[] = [];

  referralStats: ReferralStats | null = null;
  searchText = '';
  selectedStatus = '';

  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;

  constructor(
    private referralService: ReferralService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadAllReferrals();
  }

  // ────────────────────────────────────────────────
  // Chargement des données
  // ────────────────────────────────────────────────

  loadAllReferrals() {
    this.isLoading = true;

    this.referralService.getAllReferrals().subscribe({
      next: (response) => {
        this.referrals = response.data || [];
        this.filteredReferrals = [...this.referrals];
        this.calculateStats();
        this.applyFilters();           // applique filtres + pagination
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement parrainages', err);
        // this.presentToast('Erreur lors du chargement des parrainages', 'danger');
        this.isLoading = false;
      }
    });
  }

  private calculateStats() {
    this.referralStats = {
      totalReferrals: this.referrals.length,
      completedReferrals: this.referrals.filter(r => r.status === 'COMPLETED').length,
      activeReferrals: this.referrals.filter(r => r.status === 'PENDING').length,
      expiredReferrals: this.referrals.filter(r => r.status === 'EXPIRED').length,
      cancelledReferrals: this.referrals.filter(r => r.status === 'CANCELLED').length,
      totalClicks: this.referrals.reduce((sum, r) => sum + (r.clicks || 0), 0),
      totalConversions: this.referrals.reduce((sum, r) => sum + (r.conversions || 0), 0),
      conversionRate: this.referrals.length > 0
        ? (this.referrals.filter(r => r.status === 'COMPLETED').length / this.referrals.length) * 100
        : 0,
      totalEarnings: this.referrals
        .filter(r => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + (r.bonusAmount || 0), 0),
      pendingBonus: this.referrals
        .filter(r => r.status === 'PENDING')
        .reduce((sum, r) => sum + (r.bonusAmount || 0), 0),
      referrals: this.referrals
    };
  }

  // ────────────────────────────────────────────────
  // Filtrage & recherche
  // ────────────────────────────────────────────────

  applyFilters() {
    let list = [...this.referrals];

    // Recherche texte
    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase().trim();
      list = list.filter(r =>
        (r.referralCode || '').toLowerCase().includes(term) ||
        (r.referrerId || '').toLowerCase().includes(term) ||
        (r.referredUserId || '').toLowerCase().includes(term) ||
        // Si tu as les noms plus tard :
        // (r.referrerName || '').toLowerCase().includes(term) ||
        // (r.referredName || '').toLowerCase().includes(term)
        false
      );
    }

    // Filtre statut
    if (this.selectedStatus) {
      list = list.filter(r => r.status === this.selectedStatus);
    }

    this.filteredReferrals = list;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  // ────────────────────────────────────────────────
  // Pagination
  // ────────────────────────────────────────────────

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredReferrals.length / this.itemsPerPage);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedReferrals = this.filteredReferrals.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === -1) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Toujours montrer première page
    pages.push(1);

    // Ellipsis si besoin
    if (this.currentPage > 3) {
      pages.push(-1);
    }

    // Pages autour de la page courante
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ellipsis si besoin
    if (this.currentPage < this.totalPages - 2) {
      pages.push(-1);
    }

    // Toujours montrer dernière page
    pages.push(this.totalPages);

    return pages;
  }

  // ────────────────────────────────────────────────
  // Actions sur les lignes
  // ────────────────────────────────────────────────

  async copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      // this.presentToast('Code copié !', 'success');
      console.log('Code copié :', code);
    } catch (err) {
      console.error('Erreur copie', err);
      // this.presentToast('Impossible de copier le code', 'danger');
    }
  }

  cancelReferral(referralId?: string) {
    if (!referralId) return;

    if (!confirm('Voulez-vous vraiment annuler ce parrainage ?')) return;

    this.referralService.cancelReferral(referralId).subscribe({
      next: () => {
        // Mise à jour locale
        const ref = this.referrals.find(r => r.id === referralId);
        if (ref) {
          ref.status = 'CANCELLED';
        }
        this.applyFilters();
        this.calculateStats();
        // this.presentToast('Parrainage annulé', 'success');
      },
      error: (err) => {
        console.error('Erreur annulation', err);
        // this.presentToast('Erreur lors de l’annulation', 'danger');
      }
    });
  }

  // ────────────────────────────────────────────────
  // Optionnel : Toast (décommente si tu utilises Ionic Toast)
  // ────────────────────────────────────────────────

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }

}