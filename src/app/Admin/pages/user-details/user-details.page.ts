import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/features/auth/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from "@ionic/angular";

import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.page.html',
  styleUrls: ['./user-details.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class UserDetailsPage implements OnInit {
  user!: User;
  userId: string = '';
  isLoading: boolean = false;
  isEditMode = false;


  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.isLoading = true;

    this.userId = this.route.snapshot.paramMap.get('id')!;

    if (!this.userId) {
      console.error('ID de l\'utilisateur manquant');
      return;
    }
    this.userService.getUserById(this.userId).subscribe({
      next: (response: any) => {
        this.user = response.data;
        console.log('Détails de l\'utilisateur chargés:', this.user);
        this.isLoading = false;
      }
    });
  }

  enableEdit() {
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
  }
  saveChanges() {
    this.isLoading = true;

    this.userService.updateUser(this.userId, this.user).subscribe({
      next: () => {
        this.isLoading = false;
        this.isEditMode = false;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  edit(user: User) {
    this.router.navigate(['/admin-login/user-edit', user.uid]);

  }
}
