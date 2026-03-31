import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { ToastController, IonicModule } from '@ionic/angular';
import { IonContent, IonSearchbar, IonSelect, IonCard, IonCardContent, IonIcon, IonButton, IonSpinner, IonSegment, IonLabel, IonSegmentButton, IonHeader, IonToolbar, IonItem, IonSelectOption } from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  lockOpenOutline,
  optionsOutline,
  hourglassOutline,
  bookOutline,
  searchOutline,
  personCircleOutline,
  starOutline,
  schoolOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  closeOutline,
  play,
} from 'ionicons/icons';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';
import { collection, getDocs } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

interface AppUser {
  firstName?: string;
  lastName?: string;
  level?: string;
  classe?: string;
  niveauScolaire?: string;
  role?: { libelle: string };
}

@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonToolbar,
    IonHeader,
    IonSpinner,
    IonSegmentButton,
    IonLabel,
    IonSegment,
    CommonModule,
    IonButton,
    IonIcon,
    IonCardContent,
    IonCard,
    IonSearchbar,
    IonContent,
    IonSelect,
    BottomMenuComponent,
    DesktopHeaderComponent,
    IonSelectOption,
  ],
})
export class MesCoursPage implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];
  private subscription = new Subscription();
  allCourses: Course[] = [];
  displayedCourses: Course[] = [];

  itemsPerLoad = 100;           // Nombre de cours à charger à chaque fois
  currentLoadedCount = 0;

  // Gestion des classes pour ELEMENTAIRE
  isElementaire = false;
  hasClasse = false;
  availableClasses: string[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  selectedClasse: string | null = null;
  isSubscribedToClasse = false;

  matieresMap: any = {};
  matieresDisponibles: string[] = [];
  selectedMatiereId: string = '';
  searchTerm: string = '';
  filteredMatieresList: { id: string; name: string }[] = [];

  // Gestion MOYEN / SECONDAIRE / UNIVERSITAIRE
  isMoyenSecondaireUniv = false;
  availableClassesForLevel: string[] = [];
  showMatiereSelection = false;
  availableMatieres: string[] = [];
  selectedMatieres: string[] = [];
  maxMatieres = 3;
  isMatiereLoading = false;
  isCoursesLoading = true;
  userNiveauScolaire: string | null = null;
  userClasse: string | null = null;

  isLoading = true;

  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  pagedCourses: Course[] = [];

  currentUser: AppUser | null = null;
  constructor(
    private router: Router,
    private courseService: CourseService,
    private toastCtrl: ToastController,
    private firestore: Firestore,
  ) {
    addIcons({
      personCircleOutline,
      schoolOutline,
      checkmarkCircleOutline,
      bookOutline,
      chevronBackOutline,
      closeOutline,
      play,
      optionsOutline,
      hourglassOutline,
      lockOpenOutline,
      checkmarkCircle,
      searchOutline,
      starOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadCurrentUser();
    this.initializeUserLevel();
    await this.loadMatieres();
    this.loadAllCoursesPreview();
    // setTimeout(() => this.debugMatieres(), 2000);
    // this.loadCourses();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get hasMoreCourses(): boolean {
    return this.currentLoadedCount < this.filteredCourses.length;
  }

  get remainingCourses(): number {
    return this.filteredCourses.length - this.currentLoadedCount;
  }

  selectClasse(classe: string) {
    this.selectedClasse = classe;
  }

  selectClasseForLevel(classe: string) {
    this.selectedClasse = classe;
    this.loadMatieresForClasse(classe);
  }

  // loadMatieresForClasse(classe: string) {
  //   this.isMatiereLoading = true;
  //   console.log('🔍 Chargement des matières pour:', classe);

  //   this.courseService.getMatieresByClasse(classe).subscribe({
  //     next: (res) => {
  //       console.log(
  //         '📦 Réponse brute API matières:',
  //         JSON.stringify(res?.data?.[0]),
  //       );
  //       if (res?.success && res?.data) {
  //         this.availableMatieres = res.data.map((m: any) =>
  //           typeof m === 'string'
  //             ? m
  //             : m.matiereName ||
  //               m.name ||
  //               m.matiere ||
  //               m.title ||
  //               m.nom ||
  //               m.label ||
  //               JSON.stringify(m),
  //         );
  //         console.log('✅ Matières disponibles:', this.availableMatieres);
  //       } else {
  //         // Fallback: extraire les matières des cours
  //         this.extractMatieresFromCourses(classe);
  //       }
  //       this.showMatiereSelection = true;
  //       this.isMatiereLoading = false;
  //     },
  //     error: () => {
  //       console.warn(
  //         '⚠️ API matières indisponible, extraction depuis les cours',
  //       );
  //       this.extractMatieresFromCourses(classe);
  //       this.showMatiereSelection = true;
  //       this.isMatiereLoading = false;
  //     },
  //   });
  // }

  loadMatieresForClasse(classe?: string) {
    this.isMatiereLoading = true;

    const niveauToUse = this.getEffectiveLevel();

    console.log('📘 Niveau utilisé:', niveauToUse);
    console.log('📚 Classe reçue:', classe);

    // ✅ 1. Essayer API matières (rapide)
    this.courseService.getMatieresByClasse(classe!).subscribe({
      next: (res) => {
        if (res?.success && res?.data?.length) {
          this.availableMatieres = res.data
            .map((m: any) =>
              typeof m === 'string'
                ? m
                : m.matiereName ||
                  m.name ||
                  m.matiere ||
                  m.title ||
                  m.nom ||
                  m.label,
            )
            .filter((m: any): m is string => !!m);

          console.log('✅ Matières API:', this.availableMatieres);

          this.finishMatiereLoading();
        } else {
          this.loadMatieresFromCourses(classe, niveauToUse);
        }
      },

      error: () => {
        console.warn('⚠️ API indisponible → fallback cours');
        this.loadMatieresFromCourses(classe, niveauToUse);
      },
    });
  }

  private getEffectiveLevel(): string {
    return this.userNiveauScolaire === 'PROFESSIONNEL'
      ? 'UNIVERSITAIRE'
      : this.userNiveauScolaire || '';
  }

  getMatieresList(): { id: string; name: string }[] {
    return this.matieresDisponibles.map((id) => ({
      id: id,
      name: this.matieresMap[id] || 'Matière inconnue',
    }));
  }

  getMatiereName(matiereId: string): string {
    if (!matiereId) return 'Non spécifié';
    return (
      this.matieresMap[matiereId] || `Matière ${matiereId.substring(0, 8)}...`
    );
  }

  getFilteredMatieresList(): { id: string; name: string }[] {
    // Récupérer les IDs des matières présentes dans filteredCourses
    const matiereIdsInFilteredCourses = new Set(
      this.filteredCourses
        .map((c) => c.matiereId)
        .filter((id): id is string => !!id),
    );

    // Filtrer matieresDisponibles pour ne garder que celles présentes dans filteredCourses
    return this.matieresDisponibles
      .filter((id) => matiereIdsInFilteredCourses.has(id))
      .map((id) => ({
        id: id,
        name: this.matieresMap[id] || 'Matière inconnue',
      }));
  }

  generateMatieres() {
    // Récupérer les IDs des matières depuis les cours
    const matiereIdsFromCourses = this.allCourses
      .map((c) => c.matiereId)
      .filter((id): id is string => !!id);

    // Récupérer les IDs déjà chargés depuis Firestore
    const matiereIdsFromFirestore = Object.keys(this.matieresMap);

    // Fusionner les deux sources (IDs uniques)
    const allMatiereIds = Array.from(
      new Set([...matiereIdsFromFirestore, ...matiereIdsFromCourses]),
    );

    this.matieresDisponibles = allMatiereIds;

    // Pour les IDs qui viennent des cours mais pas de Firestore
    matiereIdsFromCourses.forEach((id) => {
      if (!this.matieresMap[id]) {
        const courseWithMatiere = this.allCourses.find(
          (c) => c.matiereId === id,
        );
        if (courseWithMatiere && courseWithMatiere.matiere) {
          this.matieresMap[id] = courseWithMatiere.matiere;
        } else {
          this.matieresMap[id] = `Matière ${id.substring(0, 8)}...`;
        }
      }
    });

    // Initialiser filteredMatieresList
    this.filteredMatieresList = this.getFilteredMatieresList();

    console.log('📚 Matières disponibles (IDs):', this.matieresDisponibles);
    console.log('🗺️ Matieres map (noms):', this.matieresMap);
    console.log('🎯 Matières filtrées:', this.filteredMatieresList);
  }

  extractMatieresFromCourses(classe: string) {
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        const niveauToFilter =
          this.userNiveauScolaire === 'PROFESSIONNEL'
            ? 'UNIVERSITAIRE'
            : this.userNiveauScolaire;

        const classeCourses = courses.filter(
          (c: Course) =>
            (c.type === 'En ligne' || c.type === 'VIDEO') &&
            c.niveauScolaire === niveauToFilter &&
            c.classe === classe,
        );

        // ✅ récupérer MATIERE et non CATEGORY
        const matieres = Array.from(
          new Set(
            classeCourses.map((c) => c.matiere).filter((m): m is string => !!m),
          ),
        );

        console.log('📚 Matières extraites:', matieres);

        this.availableMatieres = matieres;
      },
    });
  }

  private loadMatieresFromCourses(classe?: string, niveauToUse?: string) {
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        let filtered: Course[];

        if (this.userNiveauScolaire === 'PROFESSIONNEL') {
          filtered = courses.filter(
            (c) =>
              (c.type === 'En ligne' || c.type === 'VIDEO') &&
              c.niveauScolaire === niveauToUse,
          );
        } else {
          filtered = courses.filter(
            (c) =>
              (c.type === 'En ligne' || c.type === 'VIDEO') &&
              c.niveauScolaire === niveauToUse &&
              c.classe === classe,
          );
        }

        const matieres = Array.from(
          new Set(
            filtered
              .map((c) => c.matiere?.trim())
              .filter((m): m is string => !!m),
          ),
        ).sort();

        console.log('📖 Matières fallback:', matieres);

        this.availableMatieres = matieres;

        this.finishMatiereLoading();
      },
      error: (err) => {
        console.error('❌ Erreur cours:', err);
        this.finishMatiereLoading();
      },
    });
  }

  // async loadMatieres() {
  //   const matiereRef = collection(this.firestore, 'matiere');
  //   const snapshot = await getDocs(matiereRef);

  //   snapshot.forEach((doc) => {
  //     const data: any = doc.data();
  //     this.matieresMap[doc.id] = data.nom;
  //   });

  //   // créer la liste pour le filtre
  //   this.matieresDisponibles = Object.keys(this.matieresMap);

  //   console.log('Matieres map :', this.matieresMap);
  // }

  async loadMatieres() {
    try {
      const matiereRef = collection(this.firestore, 'matieres');
      const snapshot = await getDocs(matiereRef);

      // Clear existing data
      this.matieresMap = {};
      this.matieresDisponibles = [];

      snapshot.forEach((doc) => {
        const data: any = doc.data();
        // Store mapping of ID -> name
        this.matieresMap[doc.id] =
          data.nom || data.name || data.title || 'Matière sans nom';
        // Store IDs for the select options
        this.matieresDisponibles.push(doc.id);
      });

      console.log('✅ Matieres map:', this.matieresMap);
      console.log('✅ Matieres disponibles (IDs):', this.matieresDisponibles);

      // Force change detection by creating new array
      this.matieresDisponibles = [...this.matieresDisponibles];
    } catch (error) {
      console.error('❌ Error loading matieres:', error);
    }
  }

  private finishMatiereLoading() {
    this.showMatiereSelection = true;
    this.isMatiereLoading = false;
  }

  isMatiereSelected(m: string): boolean {
    return this.selectedMatieres.includes(m);
  }

  toggleMatiere(m: string) {
    if (this.isMatiereSelected(m)) {
      this.selectedMatieres = this.selectedMatieres.filter((x) => x !== m);
    } else {
      if (this.selectedMatieres.length < this.maxMatieres) {
        this.selectedMatieres.push(m);
      }
    }
  }

  /**
   * S'abonner à une classe (ELEMENTAIRE uniquement)
   */
  async subscribeToClasse() {
    if (!this.userClasse || !this.userNiveauScolaire) return;
    this.router.navigate(['/payment-method'], {
      state: {
        isClasseSubscription: true,
        classe: this.userClasse,
        niveauScolaire: this.userNiveauScolaire,
        plan: {
          type: 'ANNUAL',
          name: `Abonnement ${this.userClasse}`,
          price: 5000,
          currency: 'XOF',
        },
        userInfo: {
          classe: this.userClasse,
          niveau: this.userNiveauScolaire,
        },
      },
    });
  }

  /**
   * S'abonner avec les matières sélectionnées (MOYEN/SECONDAIRE/UNIVERSITAIRE)
   */
  async subscribeWithMatieres() {
    if (!this.selectedClasse) {
      const toast = await this.toastCtrl.create({
        message: '⚠️ Veuillez sélectionner une classe',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    if (this.selectedMatieres.length !== this.maxMatieres) {
      const toast = await this.toastCtrl.create({
        message: `⚠️ Vous devez sélectionner exactement ${this.maxMatieres} matières`,
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    console.log('📝 Abonnement matières:', {
      classe: this.selectedClasse,
      niveauScolaire: this.userNiveauScolaire,
      matieres: this.selectedMatieres,
    });

    this.router.navigate(['/payment-method'], {
      state: {
        type: 'matiere',
        classe: this.selectedClasse,
        niveauScolaire: this.userNiveauScolaire,
        matieres: this.selectedMatieres,
        totalCourses: this.courses.length,
        isMatiereSubscription: true,
      },
    });
  }

  private loadCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr) as AppUser;
        console.log(
          'Utilisateur chargé depuis localStorage:',
          this.currentUser.classe,
          this.currentUser.level,
        );
      } else {
        console.warn('Aucun utilisateur trouvé dans localStorage');
        // Option : rediriger vers login ?
        // this.router.navigate(['/login']);
      }
    } catch (err) {
      console.error('Erreur lors de la lecture de currentUser', err);
      this.currentUser = null;
    }
  }

  private initializeUserLevel() {
    if (!this.currentUser) return;

    // ✅ IMPORTANT : alimenter les variables utilisées dans le HTML
    console.log('vvvvv', this.currentUser);

    this.userClasse = this.currentUser.classe || null;
    this.userNiveauScolaire = this.currentUser.niveauScolaire || null;

    this.hasClasse = !!this.userClasse;
    this.selectedClasse = this.userClasse;

    const niveau = this.userNiveauScolaire;

    this.isElementaire = niveau === 'ELEMENTAIRE';
    this.isMoyenSecondaireUniv = [
      'MOYEN',
      'SECONDAIRE',
      'UNIVERSITAIRE',
      'PROFESSIONNEL',
    ].includes(niveau || '');

    if (this.isMoyenSecondaireUniv && niveau) {
      if (niveau === 'MOYEN') {
        this.availableClassesForLevel = ['6ème', '5ème', '4ème', '3ème'];
      }
      if (niveau === 'SECONDAIRE') {
        this.availableClassesForLevel = ['2nde', '1ère', 'Terminale'];
      }
      if (niveau === 'UNIVERSITAIRE') {
        this.availableClassesForLevel = [
          'Licence 1',
          'Licence 2',
          'Licence 3',
          'Master 1',
          'Master 2',
        ];
      }

      if (niveau === 'PROFESSIONNEL') {
        this.availableClassesForLevel = [];
      }
    }
  }

  private applyAllFilters() {
    let temp = [...this.courses];

    // 2. Filtre par niveau / classe de l'utilisateur
    if (this.currentUser) {
      temp = temp.filter((course) => {
        // Adaptez selon les vrais noms de champs dans ton modèle Course
        const matchLevel =
          !course.niveauScolaire ||
          course.niveauScolaire === this.userNiveauScolaire;

        const matchClasse = !course.classe || course.classe === this.userClasse;

        // ou : course.niveauScolaire === this.currentUser?.niveauScolaire

        return matchLevel && matchClasse;
      });
    }

    this.filteredCourses = temp;
  }

  // private filterBySegment(courses: Course[]): Course[] {
  //   switch (this.selectedSegment) {
  //     case 'cours':
  //       return courses.filter((c) => c.type === 'Présentiel');
  //     case 'cours-en-ligne':
  //       return courses.filter((c) => c.type === 'En ligne');
  //     case 'tutoriel':
  //       return courses.filter((c) => c.type === 'Tuto');
  //     default:
  //       return courses;
  //   }
  // }

  // searchCourse(event: any) {
  //   const term = (event.target.value || '').toLowerCase().trim();

  //   if (!term) {
  //     // Si la recherche est vide, revenir à la liste complète
  //     this.filteredCourses = [...this.allCourses];
  //     this.updatePagination();
  //     return;
  //   }

  //   // Filtrer par titre uniquement (ou titre ET description si vous voulez)
  //   this.filteredCourses = this.allCourses.filter(
  //     (course) => course.title.toLowerCase().includes(term),
  //     // Vous pouvez ajouter d'autres critères si nécessaire :
  //     // || (course.description && course.description.toLowerCase().includes(term))
  //     // || (course.category && course.category.toLowerCase().includes(term))
  //   );

  //   console.log(
  //     `🔍 Recherche "${term}" : ${this.filteredCourses.length} résultat(s)`,
  //   );
  //   this.updatePagination();
  // }

  searchCourse(event: any) {
    this.searchTerm = (event.target.value || '').toLowerCase().trim();
    this.applyFilters();
  }

  filterByMatiere(event: any) {
    this.selectedMatiereId = event.detail.value;
    this.applyFilters();
  }

  // applyFilters() {
  //   let temp = [...this.allCourses];

  //   // 🔎 recherche
  //   if (this.searchTerm) {
  //     temp = temp.filter((c) =>
  //       c.title?.toLowerCase().includes(this.searchTerm),
  //     );
  //   }

  //   // 📚 filtre matière
  //   if (this.selectedMatiereId) {
  //     temp = temp.filter((c) => c.matiereId === this.selectedMatiereId);
  //   }

  //   this.filteredCourses = temp;

  //   // Mettre à jour filteredMatieresList
  //   this.filteredMatieresList = this.getFilteredMatieresList();

  //   // Si la matière sélectionnée n'est plus dans la liste filtrée, réinitialiser
  //   if (
  //     this.selectedMatiereId &&
  //     !this.filteredMatieresList.some((m) => m.id === this.selectedMatiereId)
  //   ) {
  //     this.selectedMatiereId = '';
  //   }
  // }

  resetSearch() {
    this.filteredCourses = [...this.allCourses];
    this.updatePagination();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goHome() {
    this.router.navigate(['/courses']);
  }

  loadCourses() {
    this.isLoading = true;

    const sub = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log('Cours chargés:', courses);
        this.applyAllFilters();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
        this.isLoading = false;
      },
    });

    this.subscription.add(sub);
  }

  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredCourses.length / this.itemsPerPage,
    );
    this.currentPage = 1;
    this.paginateCourses();
  }

  paginateCourses() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedCourses = this.filteredCourses.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateCourses();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateCourses();
    }
  }

  // loadAllCoursesPreview() {
  //   this.isCoursesLoading = true;

  //   this.courseService.getAllCourses().subscribe({
  //     next: (courses) => {
  //       console.log("🌐 Total cours reçus de l'API:", courses.length);

  //       // Filtrer par type (En ligne ou VIDEO)
  //       let filteredCourses = courses.filter(
  //         (c) => c.type === 'En ligne' || c.type === 'VIDEO',
  //       );
  //       console.log('📹 Cours "En ligne" + "VIDEO":', filteredCourses.length);

  //       // Filtrer par niveau scolaire si disponible
  //       if (this.userNiveauScolaire) {
  //         filteredCourses = filteredCourses.filter(
  //           (c) => c.niveauScolaire === this.userNiveauScolaire,
  //         );
  //         console.log(
  //           `🎓 Cours pour niveau "${this.userNiveauScolaire}":`,
  //           filteredCourses.length,
  //         );

  //         // Si l'utilisateur a une classe spécifique (ex: CM2), filtrer aussi par classe
  //         if (this.userClasse) {
  //           const beforeClassFilter = filteredCourses.length;
  //           filteredCourses = filteredCourses.filter(
  //             (c) => c.classe === this.userClasse,
  //           );
  //           console.log(`📚 Filtrage pour classe "${this.userClasse}":`);
  //           console.log(`   Avant: ${beforeClassFilter} cours`);
  //           console.log(`   Après: ${filteredCourses.length} cours`);

  //           // Log des cours filtrés
  //           if (filteredCourses.length > 0) {
  //             console.log('✅ Cours filtrés pour', this.userClasse + ':');
  //             filteredCourses.forEach((c) => {
  //               console.log(`   - ${c.title} (classe: ${c.classe})`);
  //             });
  //           } else {
  //             console.warn(
  //               '⚠️ Aucun cours trouvé pour la classe',
  //               this.userClasse,
  //             );
  //           }
  //         }
  //       } else {
  //         console.warn("⚠️ Aucun niveau scolaire défini pour l'utilisateur");
  //       }

  //       this.allCourses = filteredCourses;
  //       this.allCourses = filteredCourses;
  //       this.filteredCourses = [...filteredCourses]; // Initialiser filteredCourses
  //       console.log('✅ Total cours affichés:', this.allCourses.length);
  //       console.log('✅ Total cours affichés:', this.allCourses.length);
  //       this.isCoursesLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('❌ Erreur chargement cours:', err);
  //       this.isCoursesLoading = false;
  //     },
  //   });
  // }

  loadAllCoursesPreview() {
    console.log('🚀 Chargement preview cours...');
    this.isCoursesLoading = true;

    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('📦 Tous les cours:', courses.length);

        let filteredCourses = [...courses];

        // 🎯 1️⃣ On garde seulement les cours en ligne / vidéo
        filteredCourses = filteredCourses.filter(
          (c) => c.type === 'En ligne' || c.type === 'VIDEO',
        );

        console.log('🎥 Cours en ligne:', filteredCourses.length);
        console.log('🎥 this.userNiveauScolaire:', this.userNiveauScolaire);
        // 🎯 2️⃣ Gestion du niveau
        if (this.userNiveauScolaire) {
          // 🔥 CAS PROFESSIONNEL
          const niveauEffectif =
            this.userNiveauScolaire === 'PROFESSIONNEL'
              ? 'UNIVERSITAIRE'
              : this.userNiveauScolaire;

          filteredCourses = filteredCourses.filter(
            (c) => c.niveauScolaire === niveauEffectif,
          );

          console.log(
            `🎓 Cours pour niveau "${niveauEffectif}":`,
            filteredCourses.length,
          );

          // 🎯 3️⃣ Filtrage par classe UNIQUEMENT si pas professionnel
          if (this.userClasse && this.userNiveauScolaire !== 'PROFESSIONNEL') {
            const beforeClassFilter = filteredCourses.length;

            filteredCourses = filteredCourses.filter(
              (c) => c.classe === this.userClasse,
            );

            console.log(`📚 Filtrage classe "${this.userClasse}"`);
            console.log(`   Avant: ${beforeClassFilter}`);
            console.log(`   Après: ${filteredCourses.length}`);
          }
        }

        // 🎯 4️⃣ Limiter le nombre de cours affichés (ex: 6)
        this.allCourses = filteredCourses;
        this.allCourses = filteredCourses;
        this.filteredCourses = [...filteredCourses]; // Initialiser filteredCourses
        this.generateMatieres(); // Générer les matières disponibles

        this.currentLoadedCount = 0;
        this.loadMoreCourses();   // Charge les 20 premiers

        console.log('✅ Total cours affichés:', this.allCourses.length);
        console.log('✅ Total cours affichés:', this.allCourses.length);
        this.isCoursesLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement cours:', err);
        this.isCoursesLoading = false;
      },
    });
  }

  loadMoreCourses() {
    const nextBatch = this.itemsPerLoad;
    const start = this.currentLoadedCount;
    const end = Math.min(start + nextBatch, this.filteredCourses.length);

    const newCourses = this.filteredCourses.slice(start, end);

    this.displayedCourses = [...this.displayedCourses, ...newCourses];
    this.currentLoadedCount = end;
  }

  // === Important : Mettre à jour quand les filtres changent ===
  applyFilters() {
    let temp = [...this.allCourses];

    if (this.searchTerm) {
      temp = temp.filter((c) =>
        c.title?.toLowerCase().includes(this.searchTerm)
      );
    }

    if (this.selectedMatiereId) {
      temp = temp.filter((c) => c.matiereId === this.selectedMatiereId);
    }

    this.filteredCourses = temp;

    // Réinitialiser l'affichage progressif quand on filtre
    this.displayedCourses = [];
    this.currentLoadedCount = 0;
    this.loadMoreCourses();   // Recharge les premiers résultats filtrés

    this.filteredMatieresList = this.getFilteredMatieresList();
  }
  // onSegmentChange(event: any) {
  //   this.selectedSegment = event.detail.value;
  //   this.filterCoursesBySegment();
  // }

  // filterCoursesBySegment() {
  //   if (this.selectedSegment === 'cours') {
  //     // Filtrer pour afficher les cours qui ne sont PAS "En ligne"
  //     this.filteredCourses = this.courses.filter((c) => c.type !== 'En ligne');
  //   } else {
  //     // Filtrer pour afficher uniquement les cours "En ligne"
  //     this.filteredCourses = this.courses.filter((c) => c.type === 'En ligne');
  //   }
  // }

  // filterCoursesBySegment() {
  //   switch (this.selectedSegment) {
  //     case 'cours':
  //       // Filtrer pour afficher les cours qui ne sont PAS "En ligne" ni "Tuto"
  //       this.filteredCourses = this.courses.filter(
  //         (c) => c.type === 'Présentiel',
  //       );
  //       break;

  //     case 'cours-en-ligne':
  //       // Filtrer pour afficher uniquement les cours "En ligne"
  //       this.filteredCourses = this.courses.filter(
  //         (c) => c.type === 'En ligne',
  //       );
  //       break;

  //     case 'tutoriel':
  //       // Filtrer pour afficher uniquement les cours de type "Tuto"
  //       this.filteredCourses = this.courses.filter((c) => c.type === 'Tuto');
  //       break;

  //     default:
  //       this.filteredCourses = this.courses;
  //   }

  //   console.log(
  //     `Segment actif: ${this.selectedSegment}, Cours affichés: ${this.filteredCourses.length}`,
  //   );
  // }

  // searchCourse(event: any) {
  //   const term = event.target.value?.toLowerCase().trim() ?? '';

  //   // Appliquer le filtre de recherche sur les cours déjà filtrés par segment
  //   let baseCourses: Course[] = [];

  //   switch (this.selectedSegment) {
  //     case 'cours':
  //       baseCourses = this.courses.filter(
  //         (c) => c.type !== 'En ligne' && c.type !== 'Tuto',
  //       );
  //       break;
  //     case 'cours-en-ligne':
  //       baseCourses = this.courses.filter((c) => c.type === 'En ligne');
  //       break;
  //     case 'tutoriel':
  //       baseCourses = this.courses.filter((c) => c.type === 'Tuto');
  //       break;
  //     default:
  //       baseCourses = this.courses;
  //   }

  //   this.filteredCourses = baseCourses.filter(
  //     (c) =>
  //       c.title.toLowerCase().includes(term) ||
  //       c.category.toLowerCase().includes(term),
  //   );
  // }

  openCourse(course: Course) {
    console.log('Ouvrir le cours:', course.id);
    this.router.navigate(['/course-detail', course.id]);
  }

  openFilters() {
    console.log('Ouvrir filtres');
  }

  // Méthode utilitaire pour regrouper les cours par catégorie
  getCoursesByCategory(category: string): Course[] {
    return this.filteredCourses.filter((c) => c.category === category);
  }

  // Obtenir les catégories des cours filtrés
  getFilteredCategories(): string[] {
    return [
      ...new Set(
        this.filteredCourses
          .map((c) => c.category)
          .filter((x) => x && x.trim() !== ''),
      ),
    ];
  }
}
