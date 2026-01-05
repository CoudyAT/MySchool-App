import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/features/auth/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from "@ionic/angular";
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.page.html',
  styleUrls: ['./user-edit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class UserEditPage implements OnInit {
  user!: User;
  userId: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    if (!this.userId) {
      console.error("ID de l'utilisateur manquant");
      return;
    }

    this.userService.getUserById(this.userId).subscribe({
      next: (response: any) => {
        this.user = response.data;
        console.log('Détails du cours chargés:', this.user);
      },
    });
  }

  saveUser() {
    if (!this.userId || !this.user) {
      console.error('Utilisateur ou ID manquant');
      return;
    }

    this.userService.updateUser(this.userId, this.user).subscribe({
      next: (response: any) => {
        console.log('Utilisateur mis à jour avec succès', response);
        this.showToast('Utilisateur modifié avec succès', 'success');
        // Optionnel : message toast ou redirection
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin-login/users']);
  }

  private async showToast(
    message: string,
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: color as any,
    });
    await toast.present();
  }
}
