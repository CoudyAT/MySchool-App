import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Referral, ReferralService, ReferralStats } from 'src/app/features/services/referral.service';
import { UserService } from 'src/app/features/auth/services/user.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.page.html',
  styleUrls: ['./referrals.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ReferralsPage implements OnInit {

  isLoading = false;

  allReferrals: Referral[] = [];
  filteredReferrals: Referral[] = [];
  paginatedReferrals: Referral[] = [];

  stats: Partial<ReferralStats> = {};
  totalReferrals = 0;
  conversionRate = '0.0';

  searchText = '';
  statusFilter = '';

  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;

  constructor(
    private referralService: ReferralService,
    private toastCtrl: ToastController,
    private userService: UserService
  ) { }

  async ngOnInit() {
    await this.loadAllReferrals();
  }

  async loadAllReferrals() {
    this.isLoading = true;
    try {
      const res = await this.referralService.getAllReferrals().toPromise();
      if (res?.success) {
        this.allReferrals = res.data || [];
        this.filteredReferrals = [...this.allReferrals];

        this.calculateGlobalStats();
        this.applyFilters();
        this.updatePagination();
      }
    } catch (err) {
      console.error('Erreur chargement parrainages admin', err);
      this.showToast('Impossible de charger les parrainages', 'danger');
    } finally {
      this.isLoading = false;
    }
  }



  calculateGlobalStats() {
    if (!this.allReferrals.length) return;

    const completed = this.allReferrals.filter(r => r.status === 'COMPLETED').length;
    const total = this.allReferrals.length;
    const totalBonus = this.allReferrals.reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
    const paidBonus = this.allReferrals
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.bonusAmount || 0), 0);

    this.stats = {
      totalReferrals: total,
      completedReferrals: completed,
      totalEarnings: paidBonus,
      pendingBonus: totalBonus - paidBonus,
      conversionRate: total > 0 ? (completed / total) * 100 : 0
    };

    this.totalReferrals = total;
    this.conversionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
  }

  applyFilters() {
    let list = [...this.allReferrals];

    // Recherche texte
    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase().trim();
      list = list.filter(r =>
        r.referralCode?.toLowerCase().includes(term) ||
        r.referrerId?.toLowerCase().includes(term) ||
        r.referredUserId?.toLowerCase().includes(term)
      );
    }

    // Filtre statut
    if (this.statusFilter) {
      list = list.filter(r => r.status === this.statusFilter);
    }

    this.filteredReferrals = list;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredReferrals.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedReferrals = this.filteredReferrals.slice(start, start + this.itemsPerPage);
  }

  previousPage() { if (this.currentPage > 1) { this.currentPage--; this.updatePagination(); } }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePagination(); } }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === -1) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (this.currentPage > 3) pages.push(-1);
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (this.currentPage < this.totalPages - 2) pages.push(-1);
    pages.push(this.totalPages);
    return pages;
  }

  async cancelReferral(id?: string) {
    if (!id || !confirm('Annuler ce parrainage ?')) return;
    try {
      const res = await this.referralService.cancelReferral(id).toPromise();
      if (res?.success) {
        const idx = this.allReferrals.findIndex(r => r.id === id);
        if (idx !== -1) {
          this.allReferrals[idx].status = 'CANCELLED';
          this.applyFilters();
        }
        this.showToast('Parrainage annulé', 'success');
      }
    } catch (err) {
      this.showToast('Erreur lors de l’annulation', 'danger');
    }
  }

  viewDetails(ref: Referral) {
    this.showToast(`Détails du code ${ref.referralCode} (à implémenter)`, 'primary');
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'top'
    });
    await toast.present();
  }
}