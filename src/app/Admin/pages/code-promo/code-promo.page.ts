import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
} from '@ionic/angular/standalone';
import { CodePromo } from 'src/app/models/code-promo.model';
import { CodePromoPageService } from '../../services/codePromoService';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/features/auth/services/user.service';

@Component({
  selector: 'app-code-promo',
  templateUrl: './code-promo.page.html',
  styleUrls: ['./code-promo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
})
export class CodePromoPage implements OnInit {
  codesPromo: CodePromo[] = [];
  filteredCodesPromo: CodePromo[] = [];
  paginatedCodesPromo: CodePromo[] = [];
  influenceurs: User[] = []; // tableau des utilisateurs influenceurs
  originalCode: string = '';
  isLoading = false;

  // Filtres
  selectedInfluenceurId: string = '';
  activeOnly: boolean | null = null;
  searchText: string = '';
  selectedCode: CodePromo | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 100;

  // Modal
  isModalOpen = false;
  isEditing = false;
  modalCodePromo!: CodePromo;

  constructor(
    private codePromoService: CodePromoPageService,
    private usersService: UserService,
  ) { }

  ngOnInit() {
    this.loadCodesPromo();
    this.loadInfluenceurs();
  }

  // ===============================
  // LOAD DATA
  // ===============================
  loadCodesPromo() {
    this.isLoading = true;

    this.codePromoService
      .getPromo({
        influenceurId: this.selectedInfluenceurId,
        activeOnly: this.activeOnly,
      })
      .subscribe({
        next: (res) => {
          this.codesPromo = res;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  // ===============================
  // SEARCH
  // ===============================
  applyFilters() {
    this.filteredCodesPromo = this.codesPromo.filter((code) =>
      code.code.toLowerCase().includes(this.searchText.toLowerCase()),
    );

    this.updatePagination();
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  // ===============================
  // PAGINATION
  // ===============================
  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredCodesPromo.length / this.itemsPerPage,
    );
    this.goToPage(1);
  }

  goToPage(page: number) {
    this.currentPage = page;

    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedCodesPromo = this.filteredCodesPromo.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // ===============================
  // MODAL
  // ===============================
  openModal(code?: CodePromo) {
    this.isEditing = !!code;
    this.modalCodePromo = code
      ? { ...code }
      : {
        code: '',
        type: 'fixed',
        value: 0,
        expirationDate: '',
        influenceurId: '',
        commissionType: 'fixed',
        commissionValue: 0,
        usageLimit: 0,
        description: '',
        isActive: true,
      };

    // On garde le code original pour la vérification
    this.originalCode = code?.code || '';

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCode() {
    if (this.isEditing) {
      this.codePromoService
        .updateCode(this.originalCode, this.modalCodePromo) // <-- utiliser originalCode
        .subscribe(
          () => {
            this.loadCodesPromo();
            this.closeModal();
          },
          (err) => {
            console.error('Erreur lors de la mise à jour', err);
          },
        );
    } else {
      this.codePromoService.createCode(this.modalCodePromo).subscribe(
        () => {
          this.loadCodesPromo();
          this.closeModal();
        },
        (err) => {
          console.error('Erreur lors de la création', err);
        },
      );
    }
  }

  deleteCodePromo(code?: string) {
    if (!code) return;

    if (confirm('Supprimer ce code promo ?')) {
      this.codePromoService.deleteCode(code).subscribe(() => {
        this.loadCodesPromo();
      });
    }
  }

  loadInfluenceurs() {
    this.usersService
      .getUsersByRole('influenceur') // si "instructor" = influenceur
      .subscribe((users) => {
        console.log('influenceurs', users);

        this.influenceurs = users;
      });
  }
}
