import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonAccordion,
  IonAccordionGroup,
} from '@ionic/angular/standalone';
import { SubscriptionService } from '../services/subscription.service';
import { CourseService } from '../services/courseService';
import { Router } from '@angular/router';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';
import { ClasseInfo, MatiereInfo } from 'src/app/models/classe.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.page.html',
  styleUrls: ['./abonnement.page.scss'],
  standalone: true,
  imports: [
    IonAccordionGroup,
    IonAccordion,
    IonBadge,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonButton,
    IonIcon,
    IonLabel,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    DesktopHeaderComponent,
  ],
})
export class AbonnementPage implements OnInit {
  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];
  currentUser: User | null = null;
  searchText: string = '';
  selectedStatus: string = '';
  isLoading: boolean = true;

  // Nouvelles propriétés pour les classes
  availableClasses: ClasseInfo[] = [];
  selectedClasse: ClasseInfo | null = null;
  showClasseSelection: boolean = true;
  showMatieres: boolean = false;

  // Propriétés pour les matières (SECONDAIRE, MOYEN, UNIVERSITAIRE)
  availableMatieres: MatiereInfo[] = [];
  showMatieresOnly: boolean = false;
  isElementaireLevel: boolean = false;
  hasSpecificClasse: boolean = false; // L'utilisateur a déjà une classe définie

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly courseService: CourseService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadAvailableClasses();
    this.loadSubscriptions();
  }

  /**
   * Charger l'utilisateur courant depuis le localStorage
   */
  loadUser() {
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      this.currentUser = JSON.parse(localUser);
      console.log('📊 === UTILISATEUR CONNECTÉ ===');
      console.log('👤 Nom:', this.currentUser?.firstName, this.currentUser?.lastName);
      console.log('🎓 Niveau scolaire:', this.currentUser?.niveauScolaire);
      console.log('📚 Classe:', this.currentUser?.classe || 'Non définie');
      console.log('📋 Email:', this.currentUser?.email);
      console.log('🔑 UID:', this.currentUser?.uid);
      console.log('📊 Objet complet:', this.currentUser);
      console.log('📊 ===========================');
    } else {
      console.warn('⚠️ Aucun utilisateur trouvé dans localStorage');
    }
  }

  /**
   * Charger les classes disponibles selon le niveau scolaire de l'utilisateur
   */
  loadAvailableClasses() {
    console.log('\n🔍 === DÉBUT loadAvailableClasses ===');

    if (!this.currentUser?.niveauScolaire) {
      console.warn('⚠️ Niveau scolaire non défini pour l\'utilisateur');
      this.isLoading = false;
      return;
    }

    // Déterminer si c'est le niveau élémentaire
    this.isElementaireLevel = this.currentUser.niveauScolaire === 'ELEMENTAIRE';
    this.hasSpecificClasse = !!this.currentUser.classe;

    console.log('✅ isElementaireLevel:', this.isElementaireLevel);
    console.log('✅ hasSpecificClasse:', this.hasSpecificClasse);
    console.log('✅ Classe de l\'utilisateur:', this.currentUser.classe);

    // CAS 1 : Utilisateur ELEMENTAIRE avec classe spécifique (ex: CM2)
    // On affiche directement les matières de SA classe
    if (this.isElementaireLevel && this.hasSpecificClasse) {
      console.log('🎯 CAS 1 : ELEMENTAIRE avec classe spécifique');
      console.log('📚 Chargement des matières pour la classe:', this.currentUser.classe);
      this.loadMatieresForSpecificClasse(this.currentUser.classe!);
      return;
    }

    // CAS 2 : Utilisateur ELEMENTAIRE SANS classe spécifique
    // On affiche toutes les classes disponibles pour qu'il puisse choisir
    if (this.isElementaireLevel && !this.hasSpecificClasse) {
      this.courseService
        .getCoursesByNiveauScolaire(this.currentUser.niveauScolaire)
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.availableClasses = this.groupCoursesByClasse(res.data);
              this.showClasseSelection = true;
              this.showMatieresOnly = false;
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des classes:', err);
            this.isLoading = false;
          },
        });
      return;
    }

    // CAS 3 : SECONDAIRE, MOYEN, UNIVERSITAIRE
    // On affiche directement les matières (pour choisir 3 matières)
    this.courseService
      .getMatieresByNiveau(this.currentUser.niveauScolaire)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.availableMatieres = this.formatMatieresFromAPI(res.data);
            this.showMatieresOnly = true;
            this.showClasseSelection = false;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des matières:', err);
          this.isLoading = false;
        },
      });
  }

  /**
   * Charger les matières pour une classe spécifique (ex: CM2)
   */
  loadMatieresForSpecificClasse(classe: string) {
    console.log('\n🔍 === DÉBUT loadMatieresForSpecificClasse ===');
    console.log('📚 Classe recherchée:', classe);
    console.log('🎓 Niveau scolaire:', this.currentUser!.niveauScolaire);

    // Récupérer tous les cours du niveau ELEMENTAIRE et filtrer par classe
    console.log('📡 Appel API: getCoursesByNiveauScolaire(' + this.currentUser!.niveauScolaire + ')');

    this.courseService
      .getCoursesByNiveauScolaire(this.currentUser!.niveauScolaire!)
      .subscribe({
        next: (res) => {
          console.log('✅ Réponse API reçue');
          console.log('📦 res.success:', res.success);
          console.log('📦 Nombre total de cours reçus:', res.data?.length || 0);

          if (res.success && res.data) {
            console.log('\n🔍 Analyse de TOUS les cours reçus:');
            res.data.forEach((course: any, index: number) => {
              console.log(`  Cours ${index + 1}:`, {
                title: course.title,
                classe: course.classe,
                niveauScolaire: course.niveauScolaire,
                matiereId: course.matiereId,
                category: course.category
              });
            });

            // Filtrer les cours pour ne garder que ceux de la classe spécifique
            console.log('\n🔍 Filtrage pour la classe:', classe);
            const coursesForClasse = res.data.filter(
              (course: any) => course.classe === classe
            );

            console.log('✅ Nombre de cours après filtrage:', coursesForClasse.length);

            if (coursesForClasse.length > 0) {
              console.log('📚 Cours filtrés:');
              coursesForClasse.forEach((course: any, index: number) => {
                console.log(`  ✓ Cours ${index + 1}:`, course.title, '(', course.category, ')');
              });
            } else {
              console.warn('⚠️ AUCUN cours trouvé pour la classe', classe);
            }

            // Grouper par matière
            console.log('\n🔄 Groupement par matière...');
            this.availableMatieres = this.groupCoursesByMatiere(coursesForClasse);
            console.log('✅ Nombre de matières après groupement:', this.availableMatieres.length);
            console.log('📚 Matières:', this.availableMatieres);

            this.showMatieresOnly = true;
            this.showClasseSelection = false;
          } else {
            console.warn('⚠️ Réponse API invalide ou vide');
          }
          this.isLoading = false;
          console.log('🔍 === FIN loadMatieresForSpecificClasse ===\n');
        },
        error: (err) => {
          console.error('❌ Erreur lors du chargement des matières pour la classe:', err);
          console.error('❌ Détails de l\'erreur:', err.message, err.status);
          this.isLoading = false;
        },
      });
  }

  /**
   * Formatter les matières depuis l'API
   */
  formatMatieresFromAPI(matieres: any[]): MatiereInfo[] {
    return matieres.map((matiere) => ({
      matiereId: matiere.id || matiere.matiereId,
      matiereName: matiere.nom || matiere.name || matiere.matiereName,
      courses: matiere.courses || [],
      totalDuration:
        matiere.courses?.reduce(
          (sum: number, course: any) => sum + (course.duration || 0),
          0
        ) || 0,
    }));
  }

  /**
   * Grouper les cours par classe et matière
   */
  groupCoursesByClasse(courses: any[]): ClasseInfo[] {
    const classesMap = new Map<string, ClasseInfo>();

    courses.forEach((course) => {
      const classe = course.classe;
      if (!classe) return;

      if (!classesMap.has(classe)) {
        classesMap.set(classe, {
          classe: classe,
          niveauScolaire: course.niveauScolaire,
          matieres: [],
          totalCourses: 0,
        });
      }

      const classeInfo = classesMap.get(classe)!;
      classeInfo.totalCourses++;

      // Grouper par matière
      const matiereId = course.matiereId || 'unknown';
      let matiereInfo = classeInfo.matieres.find(
        (m) => m.matiereId === matiereId
      );

      if (!matiereInfo) {
        matiereInfo = {
          matiereId: matiereId,
          matiereName: course.category || 'Non spécifié',
          courses: [],
          totalDuration: 0,
        };
        classeInfo.matieres.push(matiereInfo);
      }

      matiereInfo.courses.push(course);
      matiereInfo.totalDuration += course.duration || 0;
    });

    return Array.from(classesMap.values()).sort((a, b) =>
      a.classe.localeCompare(b.classe)
    );
  }

  /**
   * Sélectionner une classe pour voir ses matières
   */
  selectClasse(classe: ClasseInfo) {
    this.selectedClasse = classe;
    this.showClasseSelection = false;
    this.showMatieres = true;
  }

  /**
   * Retour à la sélection des classes
   */
  backToClasseSelection() {
    this.selectedClasse = null;
    this.showClasseSelection = true;
    this.showMatieres = false;
  }

  /**
   * S'abonner à une classe
   */
  subscribeToClasse(classe: ClasseInfo) {
    // Naviguer vers la page de sélection de méthode de paiement avec les informations de la classe
    this.router.navigate(['/payment-method'], {
      state: {
        isClasseSubscription: true,
        classe: classe.classe,
        niveauScolaire: classe.niveauScolaire,
        totalCourses: classe.totalCourses,
      },
    });
  }

  /**
   * Voir le détail d'un cours
   */
  viewCourseDetail(course: any) {
    this.router.navigate(['/cours', course.id]);
  }

  /**
   * Grouper les cours par matière uniquement (pour SECONDAIRE, MOYEN, UNIVERSITAIRE)
   */
  groupCoursesByMatiere(courses: any[]): MatiereInfo[] {
    const matieresMap = new Map<string, MatiereInfo>();

    courses.forEach((course) => {
      const matiereId = course.matiereId || 'unknown';

      if (!matieresMap.has(matiereId)) {
        matieresMap.set(matiereId, {
          matiereId: matiereId,
          matiereName: course.category || 'Non spécifié',
          courses: [],
          totalDuration: 0,
        });
      }

      const matiereInfo = matieresMap.get(matiereId)!;
      matiereInfo.courses.push(course);
      matiereInfo.totalDuration += course.duration || 0;
    });

    return Array.from(matieresMap.values()).sort((a, b) =>
      a.matiereName.localeCompare(b.matiereName)
    );
  }

  /**
   * Naviguer vers la page de sélection de matières pour l'abonnement
   * (Pour SECONDAIRE, MOYEN, UNIVERSITAIRE - sélection de 3 matières)
   */
  goToMatiereSelection() {
    this.router.navigate(['/payments'], {
      queryParams: {
        type: 'matieres',
        niveauScolaire: this.currentUser?.niveauScolaire,
        totalMatieres: this.availableMatieres.length,
      },
    });
  }

  /**
   * S'abonner à la classe de l'utilisateur (ELEMENTAIRE avec classe définie)
   */
  subscribeToUserClasse() {
    if (!this.currentUser?.classe) return;

    this.router.navigate(['/payment-method'], {
      state: {
        isClasseSubscription: true,
        classe: this.currentUser.classe,
        niveauScolaire: this.currentUser.niveauScolaire,
        totalCourses: this.availableMatieres.length,
      },
    });
  }

  /**
   * Charger les abonnements de l'utilisateur
   */
  loadSubscriptions() {
    if (!this.currentUser?.id) {
      this.isLoading = false;
      return;
    }

    // Convertir l'ID en number si c'est une string
    const userId = typeof this.currentUser.id === 'string'
      ? Number.parseInt(this.currentUser.id, 10)
      : this.currentUser.id;

    this.subscriptionService
      .getUserSubscriptions(userId)
      .subscribe({
        next: (res) => {
          this.subscriptions = res.data.map((sub: any) => ({
            ...sub,
            startDate: this.convertTimestampToDate(sub.startDate),
            endDate: this.convertTimestampToDate(sub.endDate),
            createdAt: this.convertTimestampToDate(sub.createdAt),
            // Déterminer le statut basé sur la date
            status: this.getSubscriptionStatus(
              this.convertTimestampToDate(sub.startDate),
              this.convertTimestampToDate(sub.endDate)
            ),
          }));

          // Initialiser la liste filtrée
          this.filteredSubscriptions = [...this.subscriptions];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des abonnements:', err);
          this.isLoading = false;
        },
      });
  }

  /**
   * Convertir un timestamp Firestore en Date JavaScript
   */
  convertTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    // Si c'est un objet Firestore avec _seconds
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }

    // Si c'est déjà une date ou un timestamp milliseconde
    return new Date(timestamp);
  }

  /**
   * Déterminer le statut d'un abonnement
   */
  getSubscriptionStatus(startDate: Date, endDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Si la date de fin est passée
    if (today > end) {
      return 'EXPIRED';
    }

    // Si la date de début est dans le futur
    if (today < start) {
      return 'PENDING';
    }

    // Sinon, c'est actif
    return 'ACTIVE';
  }

  /**
   * Calculer les jours restants
   */
  getRemainingDays(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Filtrer les abonnements selon la recherche et le statut
   */
  filterSubscriptions() {
    this.filteredSubscriptions = this.subscriptions.filter((sub) => {
      // Filtre par recherche (nom du plan, description, etc.)
      const matchesSearch =
        (sub.plan?.toLowerCase().includes(this.searchText.toLowerCase()) ||
          sub.description
            ?.toLowerCase()
            .includes(this.searchText.toLowerCase())) ??
        true;

      // Filtre par statut
      const matchesStatus = this.selectedStatus
        ? sub.status === this.selectedStatus
        : true;

      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Voir les détails d'un abonnement
   */
  viewDetails(subscription: any) {
    console.log('Voir détails:', subscription);
    // À implémenter : afficher un modal ou rediriger vers une page de détails
    // this.modalController.create({
    //   component: SubscriptionDetailComponent,
    //   componentProps: { subscription }
    // }).then(modal => modal.present());
  }

  /**
   * Gérer l'abonnement (renouveler, annuler, etc.)
   */
  manageSubscription(subscription: any) {
    console.log('Gérer abonnement:', subscription);
    // À implémenter : afficher un modal de gestion
    // Options possibles :
    // - Renouveler l'abonnement
    // - Annuler l'abonnement
    // - Voir les détails de paiement
    // - Changer le plan
  }

  /**
   * Supprimer/annuler un abonnement
   */
  cancelSubscription(subscription: any) {
    if (confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
      console.log('Annuler abonnement:', subscription);
      // À implémenter : appel API pour annuler
      // this.subscriptionService.cancelSubscription(subscription.id).subscribe({
      //   next: () => {
      //     this.loadSubscriptions();
      //   },
      //   error: (err) => {
      //     console.error('Erreur:', err);
      //   }
      // });
    }
  }

  /**
   * Aller à la page des cours
   */
  goToCourses() {
    this.router.navigate(['/courses']);
  }
}
