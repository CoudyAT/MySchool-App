import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Instructor } from 'src/app/models/instructor.model';
import { InstructorService } from 'src/app/features/services/instructorService';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.page.html',
  styleUrls: ['./instructors.page.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, FormsModule]
})
export class InstructorsPage implements OnInit {
  allInstructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  paginatedInstructors: Instructor[] = [];
  totalInstructors: number = 0;
  activeInstructors: number = 0;
  inactiveInstructors: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  searchText: string = '';
  isLoading: boolean = false;
  constructor(private instructorService: InstructorService) { }

  ngOnInit() {
    this.loadInstructors();
  }

  loadInstructors() {
    this.isLoading = true;
    this.instructorService.getInstructors().subscribe({
      next: (response) => {
        this.allInstructors = response;
        this.filteredInstructors = [...this.allInstructors];
        this.totalInstructors = this.filteredInstructors.length;
        this.updatePagination();
        this.isLoading = false;
      }
      ,
      error: (err) => {
        console.error('Erreur lors du chargement des instructeurs', err);
        this.isLoading = false;
      }
    });
  }

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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (this.currentPage > 3) pages.push(-1);
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (this.currentPage < this.totalPages - 2) pages.push(-1);
      pages.push(this.totalPages);
    }
    return pages;
  }

  onSearchChange() {
    if (!this.searchText) {
      this.filteredInstructors = [...this.allInstructors];
    } else {
      const lowerSearch = this.searchText.toLowerCase();
      this.filteredInstructors = this.allInstructors.filter(u =>
        (u.name?.toLowerCase().includes(lowerSearch))
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

}
