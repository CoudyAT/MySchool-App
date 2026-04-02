import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCoursComponent } from 'src/app/Admin/component/add-cours/add-cours.component';
import { Router } from '@angular/router';
import { CourseService } from 'src/app/features/services/courseService';
import { Course } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';
import { InstructorService } from 'src/app/features/services/instructorService';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-list-cours',
  templateUrl: './list-cours.page.html',
  styleUrls: ['./list-cours.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, AddCoursComponent],
})


export class ListCoursPage implements OnInit {
  @ViewChild(AddCoursComponent) addCoursComponent!: AddCoursComponent;
  searchText: string = '';
  selectedType: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 18;
  showAddCourseModal = false;
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  paginatedCourses: Course[] = [];
  totalPages: number = 0;
  totalCourses: number = 0;
  activeCourses: number = 0;
  finishedCourses: number = 0;
  instructors: Instructor[] = [];
  categories: string[] = [];
  isLoading: boolean = false;
  types: string[] = ['Video', 'En ligne', 'Presentiel', 'Tuto'];

  selectedNiveau: string = '';
  selectedClasse: string = '';

  // Liste des classes disponibles (dynamique selon le niveau sélectionné)
  availableClasses: string[] = [];

  constructor(private router: Router, private courseService: CourseService, private alertCtrl: AlertController, private toastCtrl: ToastController) { }



  goToDetail(course: Course) {
    this.router.navigate(['/admin-login/cours', course.id]);
  }


  ngOnInit(): void {
    this.loadCourses();
  }

  onCourseFormSubmit(courseData: any) {
    console.log('Données reçues du formulaire add-cours:', courseData);
    this.closeAddCourseModal();
  }

  submitForm() {
  }

  loadCourses() {
    this.isLoading = true;

    this.courseService.getAllCourses().subscribe({
      next: (response) => {
        this.allCourses = response;
        console.log('Courses loaded:', this.allCourses);

        this.totalCourses = this.allCourses.length;
        this.activeCourses = this.allCourses.filter(c => c.isPublished).length;
        this.finishedCourses = this.allCourses.filter(c => c.enrolled).length;
        this.applyFilters();
        this.isLoading = false;

      },
      error: (err) => {
        console.error('Erreur lors du chargement des cours', err);
        this.isLoading = false;

      },
    });
  }

  private updateAvailableClasses() {
    let filtered = this.allCourses;

    // Si un niveau est sélectionné on filtre d'abord
    if (this.selectedNiveau) {
      filtered = filtered.filter(c => c.niveauScolaire === this.selectedNiveau);
    }

    // On extrait les classes uniques
    const classes = filtered
      .map(c => c.classe)
      .filter((c): c is string => !!c && c.trim() !== '');

    this.availableClasses = [...new Set(classes)].sort();

    // Reset classe si elle n'est plus valide après changement de niveau
    if (this.selectedClasse && !this.availableClasses.includes(this.selectedClasse)) {
      this.selectedClasse = '';
    }
  }

  applyFilters(): void {
    let filtered = [...this.allCourses];

    // Recherche texte
    const search = this.searchText.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(search) ||
        course.type?.toLowerCase().includes(search) ||
        course.category?.toLowerCase().includes(search) ||
        (course.instructorName || '').toLowerCase().includes(search) ||
        (course.classe || '').toLowerCase().includes(search) ||
        (course.niveauScolaire || '').toLowerCase().includes(search)
      );
    }

    // Filtre type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === this.selectedType);
    }

    // Filtre niveau
    if (this.selectedNiveau) {
      filtered = filtered.filter(c => c.niveauScolaire === this.selectedNiveau);
    }

    // Filtre classe
    if (this.selectedClasse) {
      filtered = filtered.filter(c => c.classe === this.selectedClasse);
    }

    this.filteredCourses = filtered;
    this.totalCourses = this.allCourses.length;           // total global
    this.totalPages = Math.ceil(this.filteredCourses.length / this.itemsPerPage);
    this.currentPage = 1;

    this.updateAvailableClasses();
    this.updatePagination();
  }

  onNiveauChange() {
    this.updateAvailableClasses();
    this.applyFilters();
  }

  onClasseChange() {
    this.applyFilters();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCourses = this.filteredCourses.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchText = '';
    this.onSearchChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++)
          pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++)
          pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  getInstructorInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  openAddCourseModal() {
    this.showAddCourseModal = true;
  }

  closeAddCourseModal() {
    this.showAddCourseModal = false;
  }

  async confirmDeleteCourse(course: Course) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer le cours ${course.title} ? Cette action est irréversible.`,
      cssClass: 'delete-alert',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.deleteCourse(course.id);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteCourse(courseId: string) {
    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        // Mise à jour locale
        this.allCourses = this.allCourses.filter(c => c.id !== courseId);
        this.applyFilters();  // rafraîchit la liste filtrée + pagination

        this.showToast('Cours supprimé avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur suppression cours', err);
        this.showToast('Erreur lors de la suppression', 'danger');
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}