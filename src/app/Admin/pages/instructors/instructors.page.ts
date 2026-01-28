import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Instructor } from 'src/app/models/instructor.model';
import { InstructorService } from 'src/app/features/services/instructorService';

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.page.html',
  styleUrls: ['./instructors.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class InstructorsPage implements OnInit {

  // ── Données liste ────────────────────────────────────────
  allInstructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  paginatedInstructors: Instructor[] = [];

  totalInstructors = 0;
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;

  searchText = '';
  isLoading = false;

  // ── Modal (création + édition) ───────────────────────────
  isInstructorModalOpen = false;
  isEditing = false;
  editingInstructorId: string | null = null;

  currentExpertise = '';

  modalInstructor: Partial<Instructor> = {
    name: '',
    title: '',
    bio: '',
    image: '',
    expertiseIds: [],
    coursesIds: [],
    rating: undefined,
    backgroundColor: '#ff9933'
  };

  constructor(
    private instructorService: InstructorService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadInstructors();
  }

  // ─────────────────────────────────────────────────────────
  // Chargement des données
  // ─────────────────────────────────────────────────────────
  loadInstructors() {
    this.isLoading = true;
    this.instructorService.getInstructors().subscribe({
      next: (instructors) => {
        this.allInstructors = instructors || [];
        this.filteredInstructors = [...this.allInstructors];
        this.totalInstructors = this.filteredInstructors.length;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement instructeurs', err);
        this.showToast('Impossible de charger les instructeurs', 'danger');
        this.isLoading = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────────────────
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredInstructors.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedInstructors = this.filteredInstructors.slice(start, start + this.itemsPerPage);
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
  // Recherche
  // ─────────────────────────────────────────────────────────
  onSearchChange() {
    const term = this.searchText.trim().toLowerCase();

    if (!term) {
      this.filteredInstructors = [...this.allInstructors];
    } else {
      this.filteredInstructors = this.allInstructors.filter(inst =>
        inst.name?.toLowerCase().includes(term) ||
        inst.title?.toLowerCase().includes(term) ||
        inst.bio?.toLowerCase().includes(term) ||
        inst.expertiseIds?.some(exp => exp.toLowerCase().includes(term))
      );
    }

    this.currentPage = 1;
    this.totalInstructors = this.filteredInstructors.length;
    this.updatePagination();
  }

  clearSearch() {
    this.searchText = '';
    this.onSearchChange();
  }

  // ─────────────────────────────────────────────────────────
  // Ouverture / fermeture modal
  // ─────────────────────────────────────────────────────────
  openInstructorModal(instructor?: Instructor) {
    if (instructor) {
      // Édition
      this.isEditing = true;
      this.editingInstructorId = instructor.id || null;

      this.modalInstructor = {
        name: instructor.name || '',
        title: instructor.title || '',
        bio: instructor.bio || '',
        image: instructor.image || '',
        expertiseIds: [...(instructor.expertiseIds || [])],
        coursesIds: [...(instructor.coursesIds || [])],
        rating: instructor.rating ?? null,
        backgroundColor: instructor.backgroundColor || '#ff9933'
      };
    } else {
      // Création
      this.isEditing = false;
      this.editingInstructorId = null;
      this.resetInstructorForm();
    }

    this.currentExpertise = '';
    this.isInstructorModalOpen = true;
  }

  closeInstructorModal() {
    this.isInstructorModalOpen = false;
    this.resetInstructorForm();
  }

  resetInstructorForm() {
    this.modalInstructor = {
      name: '',
      title: '',
      bio: '',
      image: '',
      expertiseIds: [],
      coursesIds: [],
      rating: undefined,
      backgroundColor: '#ff9933'
    };
    this.currentExpertise = '';
  }

  // ─────────────────────────────────────────────────────────
  // Gestion expertises dans le modal
  // ─────────────────────────────────────────────────────────
  addExpertise(event?: KeyboardEvent) {
    if (event) event.preventDefault();

    const exp = this.currentExpertise.trim();
    if (!exp) return;

    if (!this.modalInstructor.expertiseIds?.includes(exp)) {
      this.modalInstructor.expertiseIds = [
        ...(this.modalInstructor.expertiseIds || []),
        exp
      ];
    }

    this.currentExpertise = '';
  }

  removeExpertise(index: number) {
    if (!this.modalInstructor.expertiseIds) return;
    this.modalInstructor.expertiseIds.splice(index, 1);
  }

  // ─────────────────────────────────────────────────────────
  // Sauvegarde (create + update)
  // ─────────────────────────────────────────────────────────
  saveInstructor() {
    if (!this.modalInstructor.name?.trim() || !this.modalInstructor.title?.trim()) {
      this.showToast('Le nom et le titre sont obligatoires', 'warning');
      return;
    }

    if (this.isEditing && this.editingInstructorId) {
      // Mise à jour
      const dataToSave = { ...this.modalInstructor };
      this.instructorService.updateInstructor(this.editingInstructorId, dataToSave).subscribe({
        next: (updated) => {
          const idx = this.allInstructors.findIndex(i => i.id === this.editingInstructorId);
          if (idx !== -1) {
            this.allInstructors[idx] = { ...this.allInstructors[idx], ...updated };
            this.onSearchChange();
          }
          this.closeInstructorModal();
          this.showToast('Instructeur modifié avec succès', 'success');
        },
        error: (err) => {
          console.error('Erreur mise à jour instructeur', err);
          this.showToast('Erreur lors de la modification', 'danger');
        }
      });
    } else {
      // Création
      const { id, ...dataToSave } = this.modalInstructor;
      this.instructorService.createInstructor(dataToSave as Instructor).subscribe({
        next: (created) => {
          this.allInstructors = [...this.allInstructors, created];
          this.onSearchChange();
          this.closeInstructorModal();
          this.showToast('Instructeur créé avec succès', 'success');
        },
        error: (err) => {
          console.error('Erreur création instructeur', err);
          this.showToast('Erreur lors de la création', 'danger');
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // Désactivation / suppression logique
  // ─────────────────────────────────────────────────────────
  async deactivateInstructor(instructorId: string) {
    if (!confirm('Voulez-vous vraiment désactiver cet instructeur ?')) return;

    try {
      const current = await this.instructorService.getInstructorById(instructorId).toPromise();
      if (!current) throw new Error('Instructeur non trouvé');

      const updated = { ...current, active: false };

      await this.instructorService.updateInstructor(instructorId, updated).toPromise();

      const idx = this.allInstructors.findIndex(i => i.id === instructorId);
      if (idx !== -1) {
        this.allInstructors[idx] = { ...this.allInstructors[idx], ...updated };
        this.onSearchChange();
      }

      this.showToast('Instructeur désactivé avec succès', 'success');
    } catch (err) {
      console.error('Erreur désactivation', err);
      this.showToast('Erreur lors de la désactivation', 'danger');
    }
  }

  // ─────────────────────────────────────────────────────────
  // Toast helper
  // ─────────────────────────────────────────────────────────
  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'top'
    });
    await toast.present();
  }
}