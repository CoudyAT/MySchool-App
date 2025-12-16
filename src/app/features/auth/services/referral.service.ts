import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  private readonly api = inject(ApiService);

  constructor(private http: HttpClient, private auth: Auth) {}

  async generateReferralLink() {
    const user = this.auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');
      console.log('Génération du lien de parrainage pour l\'utilisateur:', user);

    return firstValueFrom(
      this.api.post<any>(`/referrals/generate`, {
        userId: user.uid,
      })
    );
  }

}
