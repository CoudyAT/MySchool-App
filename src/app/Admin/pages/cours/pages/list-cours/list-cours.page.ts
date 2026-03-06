import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCoursComponent } from 'src/app/Admin/component/add-cours/add-cours.component';
import { Router } from '@angular/router';
import { CourseService } from 'src/app/features/services/courseService';
import { Course } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';
import { InstructorService } from 'src/app/features/services/instructorService';

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
  itemsPerPage: number = 9;
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


  constructor(private router: Router, private courseService: CourseService,) { }



  goToDetail(course: Course) {
    this.router.navigate(['/admin-login/cours', course.id]);
  }


  ngOnInit(): void {
    this.loadCourses();
    this.applyFilters();
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

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredCourses = this.allCourses.filter((course) => {
      return (
        course.title.toLowerCase().includes(search) ||
        course.type.toLowerCase().includes(search) ||
        course.category.toLowerCase().includes(search) ||
        (course.instructorName || '').toLowerCase().includes(search)
      ) && (
          this.selectedType === 'all' ||
          course.type === this.selectedType
        );
    });
    this.totalPages = Math.ceil(
      this.filteredCourses.length / this.itemsPerPage
    );
    this.updatePagination();
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
}