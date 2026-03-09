import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from 'src/app/features/services/courseService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Course, Matiere } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';

// Firestore
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { IonIcon, IonSpinner, } from "@ionic/angular/standalone";
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import { updateDoc } from 'firebase/firestore';
import { MatiereService } from '../../services/matiereService';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { documents, imageOutline, documentOutline, documentTextOutline, closeOutline } from 'ionicons/icons';

interface StorageVideo {
  name: string;
  path: string;
  url: string;
}


@Component({
  selector: 'app-add-cours',
  templateUrl: './add-cours.component.html',
  styleUrls: ['./add-cours.component.scss'],
  standalone: true,
  imports: [IonSpinner, IonIcon, CommonModule, ReactiveFormsModule],
})
export class AddCoursComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  storageVideos: StorageVideo[] = [];
  isVideoPickerOpen = false;
  isLoadingVideos = false;
  selectedVideo: StorageVideo | null = null;

  matieres: Matiere[] = [];

  // Listes filtrées dynamiques
  niveauxUniques: string[] = [];
  classesDisponibles: string[] = [];
  matieresDisponibles: Matiere[] = [];

  niveauxEtude = [
    { value: 'ELEMENTAIRE', label: 'Élémentaire' },
    { value: 'MOYEN', label: 'Moyen (Collège)' },
    { value: 'SECONDAIRE', label: 'Secondaire (Lycée)' },
    { value: 'UNIVERSITAIRE', label: 'Universitaire' },
  ];

  // classesParNiveau: { [key: string]: string[] } = {
  //   ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  //   MOYEN: ['6ème', '5ème', '4ème', '3ème (BFEM)'],
  //   SECONDAIRE: ['Seconde', 'Première', 'Terminale'],
  //   UNIVERSITAIRE: ['Licence1', 'Licence2', 'Licence3', 'Master1', 'Master2'],
  // };

  courseForm: FormGroup;
  instructors: Instructor[] = [];
  categories: string[] = [];

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageBase64: string | null = null;
  isSaving = false;

  selectedDocuments: File[] = [];
  isUploadingDocuments = false;

  selectedCategoryOption: string = '';
  newCategoryName: string = '';
  showNewCategoryInput: boolean = false;
  selectedCategoryBeforeAdd: string = '';

  selectedPdf: File | null = null;

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private courseService: CourseService,
    private matiereService: MatiereService,
    private firestore: Firestore,
    private http: HttpClient,
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      selectedCategoryOption: [''],
      instructorId: ['', Validators.required],
      description: [''],
      price: [0],
      sessions: [''],
      exercises: [0],
      documents: this.fb.array([]),
      matiereId: ['', Validators.required],
      certificateAvailable: [false],
      duration: [0],
      level: ['DEBUTANT', Validators.required],
      type: ['En ligne', Validators.required],
      isPublished: [false],
      support: [null],
      niveauScolaire: ['', Validators.required],
      classe: ['', Validators.required],
      newCategoryName: [''],
    });

    this.courseForm
      .get('selectedCategoryOption')
      ?.valueChanges.subscribe((value) => {
        this.onCategoryOptionChange(value);
      });
  }

  ngOnInit(): void {
    this.loadInstructors();
    this.loadCategories();
    this.loadMatieres();

    // Écoute des changements
    this.courseForm.get('niveauScolaire')?.valueChanges.subscribe(() => {
      this.updateClassesDisponibles();
      this.updateMatieresDisponibles();
    });

    this.courseForm.get('classe')?.valueChanges.subscribe(() => {
      this.updateMatieresDisponibles();
    });
  }

  onDocumentsSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);

    newFiles.forEach((file) => {
      // Optionnel : filtre par type
      if (
        !file.name.toLowerCase().endsWith('.pdf') &&
        !file.name.toLowerCase().endsWith('.doc') &&
        !file.name.toLowerCase().endsWith('.docx')
      ) {
        alert(`Fichier ignoré : ${file.name} (seuls PDF, DOC, DOCX acceptés)`);
        return;
      }

      // Optionnel : limite de taille (ex: 10 Mo)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Fichier trop volumineux : ${file.name} (> 10 Mo)`);
        return;
      }

      this.selectedDocuments.push(file);

      // Ajout d'une entrée vide dans le FormArray (on remplira après upload)
      this.documentsArray.push(
        this.fb.group({
          name: [file.name],
          url: [''],
          size: [file.size],
          uploadedAt: [''],
        }),
      );
    });

    // Reset input file
    input.value = '';
  }

  // Supprimer un document (local + formulaire)
  removeDocument(index: number) {
    this.selectedDocuments.splice(index, 1);
    this.documentsArray.removeAt(index);
  }

  private async uploadDocuments(courseId: string): Promise<any[]> {
    if (this.selectedDocuments.length === 0) return [];

    this.isUploadingDocuments = true;
    const storage = getStorage();
    const uploadedDocs: any[] = [];

    try {
      for (let i = 0; i < this.selectedDocuments.length; i++) {
        const file = this.selectedDocuments[i];
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `courses/${courseId}/documents/${Date.now()}_${safeFileName}`;
        const storageRef = ref(storage, filePath);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const docInfo = {
          name: file.name,
          url,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };

        uploadedDocs.push(docInfo);

        // Mise à jour dans le FormArray (optionnel mais propre)
        this.documentsArray.at(i).patchValue(docInfo);
      }

      return uploadedDocs;
    } catch (err) {
      console.error('Erreur upload documents :', err);
      alert("Erreur lors de l'envoi d'un ou plusieurs documents");
      return [];
    } finally {
      this.isUploadingDocuments = false;
    }
  }

  async openVideoPicker() {
    this.isVideoPickerOpen = true;
    this.isLoadingVideos = true;

    try {
      const storage = getStorage();
      const folderRef = ref(storage, 'VIDEOS/');
      const result = await listAll(folderRef);

      this.storageVideos = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            path: item.fullPath,
            url,
          };
        }),
      );
    } catch (err) {
      console.error('Erreur chargement vidéos :', err);
      alert('Impossible de charger les vidéos du stockage');
    } finally {
      this.isLoadingVideos = false;
    }
  }

  selectVideo(video: StorageVideo) {
    this.selectedVideo = video;

    this.courseForm.patchValue({
      sessions: video.url,
    });

    this.isVideoPickerOpen = false;
  }

  removeVideo() {
    this.selectedVideo = null;
    this.courseForm.patchValue({ sessions: '' });
  }

  closeVideoPicker() {
    this.isVideoPickerOpen = false;
  }

  // async importCoursesFromJson() {
  //   try {
  //     const data = await firstValueFrom(this.http.get<any[]>('assets/csvjson.json'));
  //     console.log(`📊 ${data.length} lignes à traiter`);

  //     // 1️⃣ REGROUPER par cours ET par niveau
  //     // Clé = "Thématique||Niveau" pour séparer les niveaux
  //     const coursesMap = new Map<string, any[]>();

  //     data.forEach(item => {
  //       const courseTitle = item["Thématique"]?.trim();
  //       const niveauRaw = item["Niveau"]?.trim() || "";

  //       if (!courseTitle) return;

  //       // Séparer les niveaux multiples (ex: "Terminale L2, Terminale L1")
  //       const niveaux = niveauRaw.split(',').map((n: string) => n.trim()).filter((n: string) => n);

  //       // Si pas de niveau, on utilise une clé sans niveau
  //       const niveauxList = niveaux.length > 0 ? niveaux : [""];

  //       niveauxList.forEach((niveau: string) => {
  //         const key = `${courseTitle}||${niveau}`;
  //         if (!coursesMap.has(key)) {
  //           coursesMap.set(key, []);
  //         }
  //         // Stocker l'item avec le niveau isolé
  //         coursesMap.get(key)!.push({ ...item, _niveauIsolé: niveau });
  //       });
  //     });

  //     console.log(`📚 ${coursesMap.size} cours uniques détectés (après séparation des niveaux)`);

  //     let success = 0;
  //     let failed = 0;

  //     // 2️⃣ CRÉER chaque cours avec ses chapitres
  //     for (const [key, items] of coursesMap.entries()) {
  //       try {
  //         const firstItem = items[0];
  //         const courseTitle = firstItem["Thématique"]?.trim();
  //         const niveauIsolé = firstItem["_niveauIsolé"];

  //         // Trouver l'instructeur
  //         const instructor = this.instructors.find(
  //           p => p.name?.toLowerCase().trim() === firstItem["Professeur"]?.toLowerCase().trim()
  //         );

  //         // Trouver la matière
  //         const matiere = this.matieres.find(
  //           m => m.nom?.toLowerCase().trim() === firstItem["Matière"]?.toLowerCase().trim()
  //             && m.classe?.toLowerCase().trim() === niveauIsolé?.toLowerCase().trim()
  //         );

  //         if (!instructor) {
  //           console.warn('⚠️ Professeur introuvable:', firstItem["Professeur"]);
  //           failed++;
  //           continue;
  //         }

  //         if (!matiere) {
  //           console.warn('⚠️ Matière introuvable:', firstItem["Matière"]);
  //           failed++;
  //           continue;
  //         }

  //         // 3️⃣ CRÉER LE COURS
  //         const courseData = {
  //           title: courseTitle,
  //           category: firstItem["Matière"] || "",
  //           matiereId: matiere.id,
  //           description: `Cours comprenant ${items.length} chapitre(s)`,
  //           niveauScolaire: firstItem["Classe"]?.toUpperCase() || "",
  //           type: "En ligne",
  //           duration: 0,
  //           sessions: "",
  //           exercises: 0,
  //           image: instructor.image || null,
  //           isPublished: true,
  //           certificateAvailable: false,
  //           price: 0,
  //           instructorId: instructor.id,
  //           instructorName: instructor.name,
  //           classe: niveauIsolé, // ✅ Niveau unique et propre
  //           chapters: [],
  //           chaptersIds: []
  //         };

  //         const courseRef = await addDoc(collection(this.firestore, 'courses'), {
  //           ...courseData,
  //           createdAt: Timestamp.now(),
  //           updatedAt: Timestamp.now()
  //         });

  //         console.log(`✅ Cours créé: "${courseTitle}" — ${niveauIsolé} (ID: ${courseRef.id})`);

  //         // 4️⃣ CRÉER LES CHAPITRES
  //         const chapterIds: string[] = [];

  //         for (let i = 0; i < items.length; i++) {
  //           const item = items[i];
  //           const chapterTitle = item["Chapitres des cours"]?.trim() || `Chapitre ${i + 1}`;

  //           const chapterData = {
  //             courseId: courseRef.id,
  //             title: chapterTitle,
  //             order: i + 1,
  //             description: item["Type de cours"] || "",
  //             duration: "0h",
  //             exercisesIds: [],
  //             lessonsIds: [],
  //             createdAt: Timestamp.now(),
  //             updatedAt: Timestamp.now()
  //           };

  //           const chapterRef = await addDoc(
  //             collection(this.firestore, 'chapters'),
  //             chapterData
  //           );

  //           chapterIds.push(chapterRef.id);
  //           console.log(`  📝 Chapitre ${i + 1}/${items.length}: ${chapterTitle}`);
  //         }

  //         // 5️⃣ METTRE À JOUR le cours avec les IDs chapitres
  //         await updateDoc(courseRef, {
  //           chaptersIds: chapterIds,
  //           updatedAt: Timestamp.now()
  //         });

  //         console.log(`  ✅ ${items.length} chapitres ajoutés au cours`);
  //         success++;

  //       } catch (err) {
  //         console.error(`❌ Erreur pour la clé "${key}":`, err);
  //         failed++;
  //       }
  //     }

  //     alert(`🎉 Import terminé!\n\n✅ Cours créés: ${success}\n❌ Échecs: ${failed}`);
  //     this.loadCategories();

  //   } catch (err) {
  //     console.error('💥 Erreur globale:', err);
  //     alert('Erreur lors du chargement du fichier JSON');
  //   }
  // }

  // ==================== GESTION IMAGE ====================
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      this.imagePreview = base64;
      this.imageBase64 = base64;
    };
    reader.readAsDataURL(file);
  }

  get documentsArray(): FormArray {
    return this.courseForm.get('documents') as FormArray;
  }

  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Le PDF ne doit pas dépasser 10 Mo');
      return;
    }

    this.selectedPdf = file;
  }

  // async uploadPdf(courseId: string): Promise<string | null> {
  //   if (!this.selectedPdf) return null;

  //   const storage = getStorage();
  //   const filePath = `courses/${courseId}/support.pdf`;
  //   const storageRef = ref(storage, filePath);

  //   await uploadBytes(storageRef, this.selectedPdf);
  //   return await getDownloadURL(storageRef);
  // }

  onCategoryOptionChange(value: string) {
    const categoryControl = this.courseForm.get('category');

    if (value === '__add_new__') {
      const currentCat = categoryControl?.value;
      if (currentCat && this.categories.includes(currentCat)) {
        this.selectedCategoryBeforeAdd = currentCat;
      }

      this.showNewCategoryInput = true;
      this.courseForm.get('newCategoryName')?.setValue('');
      categoryControl?.setValue(''); // Rend le champ invalide temporairement
    } else {
      this.showNewCategoryInput = false;
      this.courseForm.get('newCategoryName')?.setValue('');
      categoryControl?.setValue(value);
    }
  }

  // Ajouter une nouvelle catégorie
  addNewCategoryIfValid() {
    const newCatNameControl = this.courseForm.get('newCategoryName');
    const categoryControl = this.courseForm.get('category');

    const newCatName = newCatNameControl?.value?.trim();

    if (newCatName && newCatName.length >= 2) {
      // Vérifier si elle n'existe pas déjà
      if (!this.categories.includes(newCatName)) {
        this.categories.push(newCatName); // Ajouter à la liste locale
        // this.courseService.addCategory(newCatName);
      }

      // Définir la catégorie finale
      categoryControl?.setValue(newCatName);
      this.courseForm.get('selectedCategoryOption')?.setValue(newCatName);
      this.showNewCategoryInput = false;
    } else {
      // Nom invalide, annuler
      this.cancelNewCategory();
    }
  }

  // Annuler l'ajout
  cancelNewCategory() {
    this.showNewCategoryInput = false;
    this.courseForm.get('newCategoryName')?.setValue('');

    // Remettre la catégorie précédente ou vider
    if (
      this.selectedCategoryBeforeAdd &&
      this.categories.includes(this.selectedCategoryBeforeAdd)
    ) {
      this.courseForm
        .get('selectedCategoryOption')
        ?.setValue(this.selectedCategoryBeforeAdd);
      this.courseForm.get('category')?.setValue(this.selectedCategoryBeforeAdd);
    } else {
      this.courseForm.get('selectedCategoryOption')?.setValue('');
      this.courseForm.get('category')?.setValue('');
    }
  }
  // ==================== CHARGEMENT DONNÉES ====================
  private loadInstructors() {
    this.instructorService.getInstructors().subscribe({
      next: (data) => (this.instructors = data),
      error: (err) => console.error('Erreur instructeurs', err),
    });
  }

  private loadCategories() {
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        this.categories = [...new Set(courses.map((c) => c.category))];
      },
      error: (err) => console.error('Erreur catégories', err),
    });
  }

  private loadMatieres() {
    this.matiereService.getMatieres().subscribe({
      next: (data) => {
        this.matieres = data || [];

        this.niveauxUniques = [...new Set(
          this.matieres
            .map(m => m.niveauScolaire)
            .filter(Boolean)
        )].sort();

      },
      error: (err) => console.error('Erreur matières', err),
    });
  }

  updateClassesDisponibles() {
    const niveau = this.courseForm.get('niveauScolaire')?.value;

    let filtered = this.matieres;

    if (niveau) {
      filtered = filtered.filter(m => m.niveauScolaire === niveau);
    }

    this.classesDisponibles = [...new Set(
      filtered
        .map(m => m.classe)
        .filter((c): c is string => !!c)
    )].sort();

    // Si la classe actuelle n'est plus valide → reset
    const currentClasse = this.courseForm.get('classe')?.value;
    if (currentClasse && !this.classesDisponibles.includes(currentClasse)) {
      this.courseForm.patchValue({ classe: '' });
      this.updateMatieresDisponibles(); // cascade
    }
  }

  updateMatieresDisponibles() {
    const niveau = this.courseForm.get('niveauScolaire')?.value;
    const classe = this.courseForm.get('classe')?.value;

    let filtered = this.matieres;

    if (niveau) {
      filtered = filtered.filter(m => m.niveauScolaire === niveau);
    }
    if (classe) {
      filtered = filtered.filter(m => m.classe === classe);
    }

    this.matieresDisponibles = filtered.sort((a, b) =>
      (a.ordre || 0) - (b.ordre || 0) || a.nom.localeCompare(b.nom)
    );

    // Reset matière si plus valide
    const currentMatiereId = this.courseForm.get('matiereId')?.value;
    if (currentMatiereId && !this.matieresDisponibles.some(m => m.id === currentMatiereId)) {
      this.courseForm.patchValue({ matiereId: '' });
    }
  }

  // ==================== SOUMISSION ====================
  async submitForm() {
    if (this.courseForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    try {
      // Création du cours
      const docRef = await addDoc(collection(this.firestore, 'courses'), {
        ...this.courseForm.value,
        image: this.imageBase64 || null,
        documents: [],
        support: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      const uploadedDocs = await this.uploadDocuments(docRef.id);

      // 3. Mettre à jour le cours avec les vrais documents
      if (uploadedDocs.length > 0) {
        await updateDoc(docRef, {
          documents: uploadedDocs,
          updatedAt: Timestamp.now(),
        });
      }

      // Upload du PDF
      // const pdfUrl = await this.uploadPdf(docRef.id);

      // Mise à jour avec l’URL
      // if (pdfUrl) {
      //   await updateDoc(docRef, {
      //     support: pdfUrl,
      //     updatedAt: Timestamp.now(),
      //   });
      // }

      alert('Cours créé avec succès !');
      this.formSubmit.emit();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      this.isSaving = false;
    }
  }

  // async submitForm() {
  //   if (this.courseForm.invalid) {
  //     this.markAllAsTouched();
  //     return;
  //   }

  //   this.isSaving = true;

  //   try {
  //     const selectedInstructor = this.instructors.find(
  //       (prof) => prof.id === this.courseForm.value.instructorId,
  //     );

  //     const courseData = {
  //       ...this.courseForm.value,

  //       instructorId: selectedInstructor?.id || null,
  //       instructorName: selectedInstructor?.name || null,

  //       image: this.imageBase64 || null,
  //       support: null,
  //       createdAt: Timestamp.now(),
  //       updatedAt: Timestamp.now(),
  //     };

  //     const docRef = await addDoc(
  //       collection(this.firestore, 'courses'),
  //       courseData,
  //     );

  //     alert('Cours créé avec succès !');
  //     this.formSubmit.emit();
  //   } catch (error: any) {
  //     console.error(error);
  //     alert(error.message);
  //   } finally {
  //     this.isSaving = false;
  //   }
  // }

  private markAllAsTouched() {
    Object.keys(this.courseForm.controls).forEach((key) => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }

  // onNiveauEtudeChange(niveau: string) {
  //   if (niveau && this.classesParNiveau[niveau]) {
  //     this.classesDisponibles = this.classesParNiveau[niveau];
  //     // Réinitialiser la classe sélectionnée si elle n'est plus dans la liste
  //     const currentClasse = this.courseForm.get('classe')?.value;
  //     if (currentClasse && !this.classesDisponibles.includes(currentClasse)) {
  //       this.courseForm.patchValue({ classe: '' });
  //     }
  //   } else {
  //     this.classesDisponibles = [];
  //   }
  // }
}