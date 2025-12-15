import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UserService } from 'src/app/features/auth/services/user.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsersPage implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  totalUsers: number = 0;
  activeUsers: number = 0;
  inactiveUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  searchText: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.allUsers = response.data;
        this.filteredUsers = [...this.allUsers];
        this.totalUsers = this.filteredUsers.length;
        this.activeUsers = this.filteredUsers.filter(u => u.status === 'active').length;
        this.inactiveUsers = this.totalUsers - this.activeUsers;
        this.updatePagination();

        this.filteredUsers.forEach(u => {
          // console.log(`Utilisateur: ${u.firstName} ${u.lastName}`);
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, start + this.itemsPerPage);
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
      this.filteredUsers = [...this.allUsers];
    } else {
      const lowerSearch = this.searchText.toLowerCase();
      this.filteredUsers = this.allUsers.filter(u =>
        (u.firstName?.toLowerCase().includes(lowerSearch) || false) ||
        (u.lastName?.toLowerCase().includes(lowerSearch) || false)
        // Ajoutez d'autres champs si nécessaires, ex: u.email
      );
    }
    this.currentPage = 1;
    this.totalUsers = this.filteredUsers.length;
    this.activeUsers = this.filteredUsers.filter(u => u.status === 'active').length;
    this.inactiveUsers = this.totalUsers - this.activeUsers;
    this.updatePagination();
  }

  clearSearch() {
    this.searchText = '';
    this.onSearchChange();
  }

  goToDetail(user: User) {
    // Naviguez vers une page de détail (adaptez le chemin et les params si nécessaire)
    this.router.navigate(['/user-detail', user.id]);
  }

  editUser(user: User) {
    this.router.navigate(['/edit-user', user.id]);
  }

  deleteUser(user: User) {
    // if (confirm(`Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ?`)) {
    //   this.userService.deleteUser(user.id).subscribe({
    //     next: () => {
    //       this.loadUsers(); // Recharge la liste après suppression
    //     },
    //     error: (err) => {
    //       console.error('Erreur lors de la suppression', err);
    //     }
    //   });
    // }
  }
}