import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from 'src/app/features/services/courseService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Course } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc, Firestore, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-cours',
  templateUrl: './edit-cours.page.html',
  styleUrls: ['./edit-cours.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditCoursPage implements OnInit {

  editForm: FormGroup;
  course!: Course;
  courseId: string = '';
  instructors: Instructor[] = [];
  categories: string[] = [];

  // Gestion image
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  originalImageUrl: string | null = null;
  imageBase64: string | null = null;

  isSaving = false;
  showNewCategoryInput = false;
  selectedCategoryBeforeAdd: string = '';

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private firestore: Firestore
  ) {
    this.editForm = this.fb.group({
      title: [''],
      instructorId: [''],
      type: ['En ligne'],
      level: ['Débutant'],
      price: [0, Validators.min(0)],
      description: [''],
      duration: [0, Validators.min(0)],
      sessions: [''],
      exercises: [0, Validators.min(0)],
      certificateAvailable: [false],
      selectedCategoryOption: [''],
      newCategoryName: [''],
      category: ['']
    });
  }

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.courseId) {
      this.showToast('ID du cours introuvable', 'danger');
      this.router.navigate(['/admin-login/courses']);
      return;
    }

    this.loadInstructors();
    this.loadCategories();
    this.loadCourse();
  }

  private loadCourse() {
    this.courseService.getCourse(this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data || res;
        this.originalImageUrl = this.course.image || null;
        this.imagePreview = this.course.image || null;

        this.editForm.patchValue({
          title: this.course.title || '',
          instructorId: this.course.instructorId || '',
          type: this.course.type || 'En ligne',
          level: this.course.level || 'Débutant',
          price: this.course.price ?? 0,
          description: this.course.description || '',
          duration: this.course.duration ?? 0,
          sessions: this.course.sessions ?? 0,
          exercises: this.course.exercises ?? 0,
          certificateAvailable: !!this.course.certificateAvailable,
          category: this.course.category || '',
          selectedCategoryOption: this.course.category || ''
        });
      },
      error: () => {
        this.showToast('Impossible de charger le cours', 'danger');
      }
    });
  }

  private loadInstructors() {
    this.instructorService.getInstructors().subscribe({
      next: data => this.instructors = data,
      error: err => console.error('Erreur instructors', err)
    });
  }

  private loadCategories() {
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        this.categories = [...new Set(courses.map(c => c.category).filter(c => !!c))];
      }
    });
  }

  // ──────────────────────────────────────────────────
  // Gestion image
  // ──────────────────────────────────────────────────
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.showToast('Veuillez sélectionner une image valide', 'warning');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      this.showToast('Image trop volumineuse (max 16 Mo)', 'warning');
      return;
    }

    this.selectedImageFile = file;

    // Créer la prévisualisation en base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      this.imagePreview = base64;
      this.imageBase64 = base64;
    };
    reader.readAsDataURL(file);
  }

  // ──────────────────────────────────────────────────
  // Gestion catégorie
  // ──────────────────────────────────────────────────
  onCategoryOptionChange(value: string | null) {
    const categoryControl = this.editForm.get('category');

    if (value === '__add_new__') {
      // Sauvegarder la catégorie actuelle
      const currentCat = categoryControl?.value;
      if (currentCat && this.categories.includes(currentCat)) {
        this.selectedCategoryBeforeAdd = currentCat;
      }

      this.showNewCategoryInput = true;
      this.editForm.get('newCategoryName')?.setValue('');
      categoryControl?.setValue('');
    } else {
      this.showNewCategoryInput = false;
      this.editForm.get('newCategoryName')?.setValue('');
      categoryControl?.setValue(value || '');
    }
  }

  addNewCategory() {
    const newCatNameControl = this.editForm.get('newCategoryName');
    const categoryControl = this.editForm.get('category');
    const newCatName = newCatNameControl?.value?.trim();

    if (!newCatName || newCatName.length < 2) {
      this.showToast('Le nom de la catégorie doit contenir au moins 2 caractères', 'warning');
      return;
    }

    // Ajouter la nouvelle catégorie si elle n'existe pas
    if (!this.categories.includes(newCatName)) {
      this.categories.push(newCatName);
      this.categories.sort();
    }

    // Définir la nouvelle catégorie
    categoryControl?.setValue(newCatName);
    this.editForm.get('selectedCategoryOption')?.setValue(newCatName);
    this.showNewCategoryInput = false;

    this.showToast('Nouvelle catégorie ajoutée', 'success');
  }

  cancelNewCategory() {
    this.showNewCategoryInput = false;
    this.editForm.get('newCategoryName')?.setValue('');

    // Remettre la catégorie précédente
    if (this.selectedCategoryBeforeAdd && this.categories.includes(this.selectedCategoryBeforeAdd)) {
      this.editForm.get('selectedCategoryOption')?.setValue(this.selectedCategoryBeforeAdd);
      this.editForm.get('category')?.setValue(this.selectedCategoryBeforeAdd);
    } else {
      this.editForm.get('selectedCategoryOption')?.setValue(this.course?.category || '');
      this.editForm.get('category')?.setValue(this.course?.category || '');
    }
  }

  // ──────────────────────────────────────────────────
  // Sauvegarde - VERSION CORRIGÉE
  // ──────────────────────────────────────────────────
  async saveCourse() {
    // Vérifier si le formulaire est valide
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.showToast('Veuillez compléter les champs obligatoires', 'warning');
      console.log('Formulaire invalide:', this.editForm.errors);

      // Afficher les erreurs de chaque champ
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        if (control?.invalid) {
          console.log(`${key} est invalide:`, control.errors);
        }
      });

      return;
    }

    this.isSaving = true;
    const formValue = this.editForm.value;

    try {
      const updateData: any = {
        title: formValue.title,
        instructorId: formValue.instructorId,
        type: formValue.type,
        level: formValue.level,
        price: Number(formValue.price) || 0,
        description: formValue.description || '',
        duration: Number(formValue.duration) || 0,
        sessions: Number(formValue.sessions) || 0,
        exercises: Number(formValue.exercises) || 0,
        certificateAvailable: !!formValue.certificateAvailable,
        category: formValue.category,
        updatedAt: Timestamp.now()
      };

      // Si une nouvelle image a été sélectionnée, on l'ajoute en base64
      if (this.imageBase64) {
        updateData.image = this.imageBase64;
      }

      console.log('Mise à jour du cours avec:', updateData);

      // Mise à jour via Firestore
      const docRef = doc(this.firestore, 'courses', this.courseId);
      await updateDoc(docRef, updateData);

      this.showToast('Cours modifié avec succès', 'success');

      // Réinitialiser les fichiers sélectionnés
      this.selectedImageFile = null;
      this.imageBase64 = null;

      // Retour à la liste des cours
      this.router.navigate(['/admin-login/courses']);

    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      this.showToast(`Erreur: ${err.message || 'Impossible de sauvegarder'}`, 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'top'
    });
    await toast.present();
  }
}