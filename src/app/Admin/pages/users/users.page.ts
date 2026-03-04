import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, ToastController } from '@ionic/angular/standalone';
import { UserService } from 'src/app/features/auth/services/user.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import { Auth, RecaptchaVerifier } from '@angular/fire/auth';

import { addIcons } from 'ionicons';
import { send, sparkles, trash, pencilOutline } from 'ionicons/icons';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, FormsModule]
})
export class UsersPage implements OnInit, AfterViewInit {
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

  phoneDisplay: string = '';
  phoneError: string = '';
  isPhoneValid: boolean = false;

  recaptchaVerifier!: RecaptchaVerifier;

  isCreateModalOpen = false;
  newUser: any = {
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    level: 'beginner',
    classe: '3ème (BFEM)',
    niveauScolaire: 'MOYEN',
    role: { libelle: 'student' },
    status: 'active',
    profileImage: '',
    specializationId: '',
    hasActiveSubscription: false
  };

  constructor(private userService: UserService, private router: Router, private toastController: ToastController, private auth: Auth) {
    addIcons({ pencilOutline, trash, send, sparkles });


  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.recaptchaVerifier = new RecaptchaVerifier(
        this.auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => console.log('reCAPTCHA resolved'),
          'expired-callback': () => console.log('reCAPTCHA expired'),
        }
      );
    }, 500);
  }
  onPhoneInputAdmin(event: any) {
    let value = (event.target.value || '').trim();

    const onlyDigits = value.replace(/[^\d+]/g, '');

    let normalized = onlyDigits;

    if (!normalized.startsWith('+221')) {
      if (normalized.startsWith('+')) {
        normalized = '+221' + normalized.replace('+', '').replace(/^221/, '');
      } else {
        normalized = '+221' + normalized.replace(/^221/, '');
      }
    }

    const digitsAfterPrefix = normalized.replace('+221', '');
    if (digitsAfterPrefix.length > 9) {
      normalized = '+221' + digitsAfterPrefix.substring(0, 9);
    }

    this.newUser.phone = normalized;

    this.phoneDisplay = this.formatPhoneDisplay(normalized);

    // Validation
    this.validatePhone();
  }

  private validatePhone() {
    const clean = (this.newUser.phone || '').replace(/\D/g, '');
    const isValid = clean.length === 12 && clean.startsWith('221');

    this.isPhoneValid = isValid;
    this.phoneError = isValid ? '' :
      (clean.length < 12 ? 'Numéro incomplet (9 chiffres attendus)' : 'Format invalide');

    if (isValid) {
      this.newUser.login = clean;
    }
  }

  // Même format que dans le login
  private formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 12 || !cleaned.startsWith('221')) {
      return phone || '+221 ';
    }
    const national = cleaned.substring(3);
    return `+221 ${national.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
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
    };
    this.phoneDisplay = '+221 ';
    this.phoneError = '';
    this.isPhoneValid = false;
  }

  createUser() {

    const phoneClean = this.newUser.phone.trim().replace(/\s+/g, '');
    const fakeEmail = `${phoneClean.replace('+', '')}@myschool.app`;

    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.phone || !this.newUser.password) {
      this.presentToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    this.validatePhone();

    if (!this.isPhoneValid) {
      this.presentToast('Numéro de téléphone invalide (ex: +221771234567)', 'danger');
      return;
    }

    const userToCreate: User = {
      firstName: this.newUser.firstName.trim(),
      lastName: this.newUser.lastName.trim(),
      login: this.newUser.phone.trim().replace(/\s+/g, ''),
      password: this.newUser.password.trim(),
      phone: this.newUser.phone.trim().replace(/\s+/g, ''),
      email: fakeEmail,
      level: 'beginner',
      niveauScolaire: 'MOYEN' as const,
      classe: '3ème (BFEM)',
      role: { libelle: this.newUser.role.libelle },
      status: 'active',
      specializationId: 'none',
      hasActiveSubscription: false,

    };



    this.userService.createUser(userToCreate).subscribe({
      next: (createdUser) => {
        this.allUsers.push(createdUser);
        this.applyFilters();
        this.closeCreateModal();
        this.presentToast('Utilisateur créé avec succès !', 'success', 2500);
      },
      error: (err) => {
        console.error('Erreur création utilisateur', err);

        let errorMessage = 'Une erreur est survenue lors de la création de l\'utilisateur';

        if (err?.error?.message === 'Email invalide') {
          errorMessage = 'Ce numéro est déjà utilisé';
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.status === 409) {
          errorMessage = 'Ce numéro est déjà utilisé';
        }

        this.presentToast(errorMessage, 'danger', 5000);
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
        (u.role?.libelle?.toLowerCase().includes(lowerSearch) || false) ||
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
    this.router.navigate(['/admin-login/user-edit', user.uid]);
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

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary', duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top',
      cssClass: 'ion-text-center',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}