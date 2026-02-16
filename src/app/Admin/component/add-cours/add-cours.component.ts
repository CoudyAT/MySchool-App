import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from 'src/app/features/services/courseService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Course } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';

// Firestore
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { IonIcon, IonSpinner } from "@ionic/angular/standalone";
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { updateDoc } from 'firebase/firestore';
import { MatiereService } from '../../services/matiereService';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

  niveauxEtude = [
    { value: 'ELEMENTAIRE', label: 'Élémentaire' },
    { value: 'MOYEN', label: 'Moyen (Collège)' },
    { value: 'SECONDAIRE', label: 'Secondaire (Lycée)' },
    { value: 'UNIVERSITAIRE', label: 'Universitaire' },
  ];

  classesParNiveau: { [key: string]: string[] } = {
    ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    MOYEN: ['6ème', '5ème', '4ème', '3ème'],
    SECONDAIRE: ['Seconde', 'Première', 'Terminale'],
    UNIVERSITAIRE: ['Licence1', 'Licence2', 'Licence3', 'Master1', 'Master2'],
  };
  classesDisponibles: string[] = [];

  courseForm: FormGroup;
  instructors: Instructor[] = [];
  categories: string[] = [];

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageBase64: string | null = null;
  isSaving = false;

  selectedCategoryOption: string = '';
  newCategoryName: string = '';
  showNewCategoryInput: boolean = false;
  selectedCategoryBeforeAdd: string = '';

  selectedPdf: File | null = null;
  matieres: any[] = [];

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private courseService: CourseService,
    private matiereService: MatiereService,
    private firestore: Firestore,
    private http: HttpClient

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
  }

  // async importCoursesFromJson() {
  //   try {
  //     const data = await firstValueFrom(this.http.get<any[]>('assets/csvtest.json'));
  //     console.log(`📊 ${data.length} lignes à traiter`);

  //     // 1️⃣ REGROUPER les données par cours (même Description)
  //     const coursesMap = new Map<string, any[]>();

  //     data.forEach(item => {
  //       const courseTitle = item["Description"]?.trim();
  //       if (!courseTitle) return;

  //       if (!coursesMap.has(courseTitle)) {
  //         coursesMap.set(courseTitle, []);
  //       }
  //       coursesMap.get(courseTitle)!.push(item);
  //     });

  //     console.log(`📚 ${coursesMap.size} cours uniques détectés`);

  //     let success = 0;
  //     let failed = 0;

  //     // 2️⃣ CRÉER chaque cours avec ses chapitres
  //     for (const [courseTitle, items] of coursesMap.entries()) {
  //       try {
  //         const firstItem = items[0]; // Données communes du cours

  //         // Trouver l'instructeur
  //         const instructor = this.instructors.find(
  //           p => p.name?.toLowerCase().trim() === firstItem["Professeurs"]?.toLowerCase().trim()
  //         );

  //         // Trouver la matière
  //         const matiere = this.matieres.find(
  //           m => m.nom?.toLowerCase().trim() === firstItem["Matiéres"]?.toLowerCase().trim()
  //         );

  //         if (!instructor) {
  //           console.warn('⚠️ Professeur introuvable:', firstItem["Professeurs"]);
  //           failed++;
  //           continue;
  //         }

  //         if (!matiere) {
  //           console.warn('⚠️ Matière introuvable:', firstItem["Matiéres"]);
  //           failed++;
  //           continue;
  //         }

  //         // 3️⃣ CRÉER LE COURS d'abord
  //         const courseData = {
  //           title: courseTitle,
  //           category: firstItem["Matiéres"] || "",
  //           matiereId: matiere.id,
  //           description: `Cours comprenant ${items.length} chapitre(s)`,
  //           level: firstItem["Niveau"]?.toUpperCase() || "",
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
  //           niveauScolaire: firstItem["Niveau"]?.toUpperCase(),
  //           classe: firstItem["Classe"],
  //           chapters: [],
  //           chaptersIds: []
  //         };

  //         const courseRef = await addDoc(collection(this.firestore, 'courses'), {
  //           ...courseData,
  //           createdAt: Timestamp.now(),
  //           updatedAt: Timestamp.now()
  //         });

  //         console.log(`✅ Cours créé: ${courseTitle} (ID: ${courseRef.id})`);

  //         // 4️⃣ CRÉER LES CHAPITRES pour ce cours
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

  //         // 5️⃣ METTRE À JOUR le cours avec les IDs des chapitres
  //         await updateDoc(courseRef, {
  //           chaptersIds: chapterIds,
  //           updatedAt: Timestamp.now()
  //         });

  //         console.log(`  ✅ ${items.length} chapitres ajoutés au cours`);
  //         success++;

  //       } catch (err) {
  //         console.error(`❌ Erreur pour le cours "${courseTitle}":`, err);
  //         failed++;
  //       }
  //     }

  //     alert(`🎉 Import terminé!\n\n✅ Cours créés: ${success}\n❌ Échecs: ${failed}`);

  //     // Recharger les données
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
      next: (data) => (this.matieres = data),
      error: (err) => console.error('Erreur matières', err),
    });
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
        support: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

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

  onNiveauEtudeChange(niveau: string) {
    if (niveau && this.classesParNiveau[niveau]) {
      this.classesDisponibles = this.classesParNiveau[niveau];
      // Réinitialiser la classe sélectionnée si elle n'est plus dans la liste
      const currentClasse = this.courseForm.get('classe')?.value;
      if (currentClasse && !this.classesDisponibles.includes(currentClasse)) {
        this.courseForm.patchValue({ classe: '' });
      }
    } else {
      this.classesDisponibles = [];
    }
  }
}