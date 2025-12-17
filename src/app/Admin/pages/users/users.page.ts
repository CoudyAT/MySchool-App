import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { UserService } from 'src/app/features/auth/services/user.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { send, sparkles, trash, pencilOutline } from 'ionicons/icons';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, FormsModule]
})
export class UsersPage implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  totalUsers: number = 0;
  activeUsers: number = 0;
  inactiveUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  searchText: string = '';
  isLoading: boolean = false;
  selectedRole: string = '';

  isCreateModalOpen = false;
  newUser: any = {
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    role: 'student',
    isPremium: false,
    login: ''
  };
  constructor(private userService: UserService, private router: Router) {
    addIcons({ pencilOutline, trash, send, sparkles });

  }
  onPhoneChange() {
    this.newUser.login = this.newUser.phone;
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  // Fermer le modal
  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.resetForm();
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.newUser = {
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      role: 'student',
      isPremium: false
    };
  }

  // Créer l'utilisateur
  createUser() {
    if (!this.newUser.firstName || !this.newUser.lastName) {
      return;
    }

    // Appelle ton service API ici
    this.userService.createUser(this.newUser).subscribe({
      next: (createdUser) => {
        this.allUsers.push(createdUser);
        this.applyFilters();
        this.closeCreateModal();
        // toast de succès
      },
      error: (err) => {
        console.error('Erreur création', err);
        //afficher erreur
      }
    });
  }
  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;

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
        this.isLoading = false;

      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.isLoading = false;

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

  onRoleChange() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.allUsers;

    // Filtre par recherche
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.phone?.includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    }

    // Filtre par rôle
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role?.libelle === this.selectedRole);
    }

    this.filteredUsers = filtered;
    this.updatePagination();
  }
  onSearchChange() {
    if (!this.searchText) {
      this.filteredUsers = [...this.allUsers];
    } else {
      const lowerSearch = this.searchText.toLowerCase();
      this.filteredUsers = this.allUsers.filter(u =>
        (u.firstName?.toLowerCase().includes(lowerSearch) || false) ||
        (u.lastName?.toLowerCase().includes(lowerSearch) || false) ||
        (u.email?.toLowerCase().includes(lowerSearch) || false) ||
        (u.role?.libelle.toLowerCase().includes(lowerSearch) || false) ||
        (u.phone?.toLowerCase().includes(lowerSearch) || false)
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
    if (!user?.uid) {
      // console.error('ID utilisateur manquant', user);
      return;
    }

    this.router.navigate(['/admin-login/user-details', user.uid]);
  }

  editUser(user: User) {
    this.router.navigate(['/admin-login/user-details', user.uid]);
  }

  deleteUser(user: User) {
    if (!user?.uid) {
      console.error('ID utilisateur manquant', user);
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      this.userService.deleteUser(user.uid).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter(u => u.uid !== user.uid);
          this.onSearchChange();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', err);
        }
      });
    }
  }
}