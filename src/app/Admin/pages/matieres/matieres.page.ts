import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Matiere } from 'src/app/models/course.model';
import { MatiereService } from 'src/app/features/services/matiere.service';

@Component({
  selector: 'app-matieres',
  templateUrl: './matieres.page.html',
  styleUrls: ['./matieres.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class MatieresPage implements OnInit {
  // ── Données liste ────────────────────────────────────────
  allMatieres: Matiere[] = [];
  filteredMatieres: Matiere[] = [];
  paginatedMatieres: Matiere[] = [];

  filteredUniqueClasses: string[] = [];
  totalMatieres = 0;
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;

  searchText = '';
  selectedNiveau: string = '';
  selectedClasse: string = '';

  isLoading = false;

  // Classes uniques pour le filtre
  uniqueClasses: string[] = [];

  // ── Modal (création + édition) ───────────────────────────
  isMatiereModalOpen = false;
  isEditing = false;
  editingMatiereId: string | null = null;

  modalMatiere: Partial<Matiere> = {
    nom: '',
    classe: '',
    niveauScolaire: undefined,
    icon: '',
    color: '#3b82f6',
    ordre: undefined,
  };

  constructor(
    private matiereService: MatiereService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.loadMatieres();
  }

  // ─────────────────────────────────────────────────────────
  // Chargement des données
  // ─────────────────────────────────────────────────────────
  loadMatieres() {
    this.isLoading = true;
    this.matiereService.getAllMatieres().subscribe({
      next: (matieres) => {
        this.allMatieres = matieres || [];
        this.filteredMatieres = [...this.allMatieres];
        this.updateUniqueClasses();
        this.updateAvailableClasses();
        this.totalMatieres = this.filteredMatieres.length;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement matières', err);
        this.showToast('Impossible de charger les matières', 'danger');
        this.isLoading = false;
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // Mise à jour des classes uniques pour le filtre
  // ─────────────────────────────────────────────────────────
  private updateUniqueClasses() {
    const classes = this.allMatieres
      .map((m) => m.classe)
      .filter((classe): classe is string => !!classe)
      .filter((classe, index, self) => self.indexOf(classe) === index)
      .sort();

    this.uniqueClasses = classes;
  }

  private updateAvailableClasses() {
    this.filteredUniqueClasses = this.allMatieres
      .filter(m => !this.selectedNiveau || m.niveauScolaire === this.selectedNiveau)
      .map(m => m.classe)
      .filter((c): c is string => !!c);

    this.filteredUniqueClasses = [...new Set(this.filteredUniqueClasses)].sort();

    // Option très utile : si la classe sélectionnée n'est plus valide → on la reset
    if (this.selectedClasse && !this.filteredUniqueClasses.includes(this.selectedClasse)) {
      this.selectedClasse = '';
    }
  }

  // ─────────────────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────────────────
  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredMatieres.length / this.itemsPerPage,
    );
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedMatieres = this.filteredMatieres.slice(
      start,
      start + this.itemsPerPage,
    );
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
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
      return pages;
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

  // ─────────────────────────────────────────────────────────
  // Recherche et filtres
  // ─────────────────────────────────────────────────────────
  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.updateAvailableClasses();
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.allMatieres];

    // Recherche par texte
    if (this.searchText.trim()) {
      const term = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (matiere) =>
          matiere.nom?.toLowerCase().includes(term) ||
          matiere.classe?.toLowerCase().includes(term),
      );
    }

    // Filtre par niveau
    if (this.selectedNiveau) {
      filtered = filtered.filter(
        (matiere) => matiere.niveauScolaire === this.selectedNiveau,
      );
    }

    // Filtre par classe
    if (this.selectedClasse) {
      filtered = filtered.filter(
        (matiere) => matiere.classe === this.selectedClasse,
      );
    }

    this.filteredMatieres = filtered;
    this.currentPage = 1;
    this.totalMatieres = this.filteredMatieres.length;
    this.updatePagination();
  }

  clearSearch() {
    this.searchText = '';
    this.selectedNiveau = '';
    this.selectedClasse = '';
    this.updateAvailableClasses();
    this.onSearchChange();
  }

  get availableClasses(): string[] {
    const filtered = this.allMatieres.filter(m =>
      !this.selectedNiveau || m.niveauScolaire === this.selectedNiveau
    );

    const classes = filtered
      .map(m => m.classe)
      .filter((c): c is string => !!c);

    return [...new Set(classes)].sort();
  }
  // ─────────────────────────────────────────────────────────
  // Ouverture / fermeture modal
  // ─────────────────────────────────────────────────────────
  openMatiereModal(matiere?: Matiere) {
    if (matiere) {
      // Édition
      this.isEditing = true;
      this.editingMatiereId = matiere.id;

      this.modalMatiere = {
        id: matiere.id,
        nom: matiere.nom || '',
        classe: matiere.classe || '',
        niveauScolaire: matiere.niveauScolaire,
        icon: matiere.icon || '',
        color: matiere.color || '#3b82f6',
        ordre: matiere.ordre,
      };
    } else {
      // Création
      this.isEditing = false;
      this.editingMatiereId = null;
      this.resetMatiereForm();
    }

    this.isMatiereModalOpen = true;
  }

  closeMatiereModal() {
    this.isMatiereModalOpen = false;
    this.resetMatiereForm();
  }

  resetMatiereForm() {
    this.modalMatiere = {
      nom: '',
      classe: '',
      niveauScolaire: undefined,
      icon: '',
      color: '#3b82f6',
      ordre: undefined,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Helpers pour l'affichage
  // ─────────────────────────────────────────────────────────
  getNiveauLabel(niveau: string): string {
    const labels: { [key: string]: string } = {
      PRIMAIRE: 'Primaire',
      MOYEN: 'Moyen',
      SECONDAIRE: 'Secondaire',
      SUPERIEUR: 'Supérieur',
    };
    return labels[niveau] || niveau;
  }

  getNiveauColor(niveau: string): string {
    const colors: { [key: string]: string } = {
      PRIMAIRE: 'badge-primary',
      MOYEN: 'badge-warning',
      SECONDAIRE: 'badge-success',
      SUPERIEUR: 'badge-danger',
    };
    return colors[niveau] || 'badge-secondary';
  }

  getIconName(icon: string): string {
    // Nettoie le nom d'icône (supprime les préfixes/suffixes si nécessaire)
    return icon?.replace(/^(ios|md|logo)-/i, '') || 'help-circle';
  }

  // ─────────────────────────────────────────────────────────
  // Sauvegarde (create + update)
  // ─────────────────────────────────────────────────────────
  async saveMatiere() {
    if (
      !this.modalMatiere.nom?.trim() ||
      !this.modalMatiere.classe?.trim() ||
      !this.modalMatiere.niveauScolaire
    ) {
      this.showToast(
        'Le nom, la classe et le niveau sont obligatoires',
        'warning',
      );
      return;
    }

    try {
      const dataToSave = { ...this.modalMatiere };

      // =========================
      // UPDATE
      // =========================
      if (this.isEditing && this.editingMatiereId) {
        const updated = await this.matiereService
          .updateMatiere(this.editingMatiereId, dataToSave)
          .toPromise();

        if (updated) {
          const idx = this.allMatieres.findIndex(
            (m) => m.id === this.editingMatiereId,
          );
          if (idx !== -1) {
            this.allMatieres[idx] = {
              ...this.allMatieres[idx],
              ...updated,
            };
          }
        }

        this.applyFilters();
        this.closeMatiereModal();
        this.showToast('Matière modifiée avec succès', 'success');
      }

      // =========================
      // CREATE
      // =========================
      else {
        const created = await this.matiereService
          .createMatiere(dataToSave as Partial<Matiere>)
          .toPromise();

        if (created) {
          this.allMatieres = [...this.allMatieres, created];
          this.updateUniqueClasses();
        }

        this.applyFilters();
        this.closeMatiereModal();
        this.showToast('Matière créée avec succès', 'success');
      }
    } catch (err) {
      console.error('Erreur sauvegarde matière:', err);
      this.showToast("Erreur lors de l'enregistrement", 'danger');
    }
  }

  // ─────────────────────────────────────────────────────────
  // Suppression
  // ─────────────────────────────────────────────────────────
  async deleteMatiere(matiereId: string) {
    if (!confirm('Voulez-vous vraiment supprimer cette matière ?')) return;

    try {
      await this.matiereService.deleteMatiere(matiereId).toPromise();

      // Supprime de la liste locale
      this.allMatieres = this.allMatieres.filter((m) => m.id !== matiereId);
      this.applyFilters();

      this.showToast('Matière supprimée avec succès', 'success');
    } catch (err) {
      console.error('Erreur suppression matière', err);
      this.showToast('Erreur lors de la suppression', 'danger');
    }
  }

  // ─────────────────────────────────────────────────────────
  // Toast helper
  // ─────────────────────────────────────────────────────────
  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary',
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
