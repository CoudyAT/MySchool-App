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

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private courseService: CourseService,
    private firestore: Firestore
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      selectedCategoryOption: [''],
      newCategoryName: [''],
      instructorId: [''],
      description: [''],
      price: [0],
      sessions: [0],
      exercises: [0],
      certificateAvailable: [false],
      duration: [0],
      level: ['DEBUTANT', Validators.required],
      type: ['En ligne', Validators.required],
      isPublished: [false],
      support: [null],
    });

    this.courseForm.get('selectedCategoryOption')?.valueChanges.subscribe(value => {
      this.onCategoryOptionChange(value);
    });
  }


  ngOnInit(): void {
    this.loadInstructors();
    this.loadCategories();
  }

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
    if (this.selectedCategoryBeforeAdd && this.categories.includes(this.selectedCategoryBeforeAdd)) {
      this.courseForm.get('selectedCategoryOption')?.setValue(this.selectedCategoryBeforeAdd);
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
        this.categories = [...new Set(courses.map(c => c.category))];
      },
      error: (err) => console.error('Erreur catégories', err),
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

  private markAllAsTouched() {
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }
}