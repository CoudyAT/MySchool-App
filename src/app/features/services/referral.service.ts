import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

/**
 * Interface pour le parrainage
 */
export interface Referral {
  id?: string;
  referrerId: string;
  referredUserId?: string;
  referralCode: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  bonusAmount: number;
  bonusType: 'DISCOUNT' | 'FREE_COURSE' | 'POINTS';
  clicks: number;
  conversions: number;
  createdAt?: string;
  completedAt?: string;
  expiresAt?: string;
  metadata?: {
    deepLink: string;
    webLink: string;
    shareText: string;
    source?: string;
  };
}

/**
 * Interface pour les statistiques de parrainage
 */
export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  expiredReferrals: number;
  cancelledReferrals: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingBonus: number;
  referrals: Referral[];
}

/**
 * Interface pour la génération de lien de parrainage
 */
export interface GenerateReferralRequest {
  userId: string;
  bonusAmount?: number;
  bonusType?: 'DISCOUNT' | 'FREE_COURSE' | 'POINTS';
}

/**
 * Interface pour la réponse de génération de lien
 */
export interface GenerateReferralResponse {
  success: boolean;
  data: {
    code: string;
    deepLink: string;
    webLink: string;
    shareText: string;
    bonusAmount: number;
    expiresAt: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  private readonly api = inject(ApiService);

  /**
   * Génère un nouveau lien de parrainage pour un utilisateur
   */
  generateReferralLink(request: GenerateReferralRequest): Observable<GenerateReferralResponse> {
    return this.api.post<GenerateReferralResponse>('/referrals/generate', request);
  }

  /**
   * Récupère tous les parrainages d'un utilisateur
   */
  getUserReferrals(userId: string): Observable<{ success: boolean; data: Referral[]; count: number }> {
    return this.api.get<{ success: boolean; data: Referral[]; count: number }>(
      `/referrals/user/${userId}`
    );
  }

  /**
   * Récupère les statistiques de parrainage d'un utilisateur
   */
  getUserReferralStats(userId: string): Observable<{ success: boolean; data: ReferralStats }> {
    return this.api.get<{ success: boolean; data: ReferralStats }>(
      `/referrals/user/${userId}/stats`
    );
  }

  /**
   * Enregistre un clic sur un lien de parrainage
   */
  trackClick(code: string, source?: string): Observable<{ success: boolean; data: any }> {
    return this.api.post<{ success: boolean; data: any }>('/referrals/track-click', {
      code,
      source,
    });
  }

  /**
   * Valide un code de parrainage lors de l'inscription
   */
  validateReferralCode(
    code: string,
    userId: string
  ): Observable<{ success: boolean; data: any }> {
    return this.api.post<{ success: boolean; data: any }>('/referrals/validate', {
      code,
      userId,
    });
  }

  /**
   * Récupère un parrainage par son code
   */
  getReferralByCode(code: string): Observable<{ success: boolean; data: Referral }> {
    return this.api.get<{ success: boolean; data: Referral }>(`/referrals/code/${code}`);
  }

  /**
   * Récupère un parrainage par ID
   */
  getReferralById(id: string): Observable<{ success: boolean; data: Referral }> {
    return this.api.get<{ success: boolean; data: Referral }>(`/referrals/${id}`);
  }

  /**
   * Supprime un parrainage (Admin)
   */
  deleteReferral(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/referrals/${id}`);
  }

  /**
   * Récupère tous les parrainages (Admin uniquement)
   */
  getAllReferrals(): Observable<{ success: boolean; data: Referral[]; count: number }> {
    return this.api.get<{ success: boolean; data: Referral[]; count: number }>('/referrals');
  }

  /**
   * Annule un parrainage
   */
  cancelReferral(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/referrals/${id}/cancel`, {});
  }

  /**
   * Méthodes utilitaires
   */

  // Génère le texte de partage pour WhatsApp
  generateWhatsAppShareText(code: string, bonusAmount: number): string {
    const bonusInXOF = bonusAmount / 100;
    return `🎓 Rejoins MySchool avec mon code de parrainage ${code} et reçois ${bonusInXOF} FCFA de réduction ! 🎁\n\nClique ici: myschool://referral?code=${code}`;
  }

  // Génère le lien de partage pour SMS
  generateSMSShareText(code: string, bonusAmount: number): string {
    const bonusInXOF = bonusAmount / 100;
    return `Rejoins MySchool avec le code ${code} et reçois ${bonusInXOF} FCFA! https://myschool-app.com/join?ref=${code}`;
  }

  // Partage via WhatsApp (Capacitor)
  async shareViaWhatsApp(code: string, bonusAmount: number): Promise<void> {
    const text = this.generateWhatsAppShareText(code, bonusAmount);
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;

    try {
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Erreur lors du partage WhatsApp:', error);
      throw error;
    }
  }

  // Partage via SMS (Capacitor)
  async shareViaSMS(code: string, bonusAmount: number, phoneNumber?: string): Promise<void> {
    const text = this.generateSMSShareText(code, bonusAmount);
    const smsUrl = phoneNumber
      ? `sms:${phoneNumber}?body=${encodeURIComponent(text)}`
      : `sms:?body=${encodeURIComponent(text)}`;

    try {
      window.location.href = smsUrl;
    } catch (error) {
      console.error('Erreur lors du partage SMS:', error);
      throw error;
    }
  }

  // Copie le code de parrainage dans le presse-papier
  async copyCodeToClipboard(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      throw error;
    }
  }

  // Vérifie si un code de parrainage est valide et non expiré
  async isCodeValid(code: string): Promise<boolean> {
    try {
      const response = await this.getReferralByCode(code).toPromise();
      const referral = response?.data;

      if (!referral) return false;

      // Vérifier le statut
      if (referral.status === 'EXPIRED' || referral.status === 'CANCELLED') {
        return false;
      }

      // Vérifier la date d'expiration
      if (referral.expiresAt) {
        const expiryDate = new Date(referral.expiresAt);
        if (expiryDate < new Date()) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation du code:', error);
      return false;
    }
  }
}
