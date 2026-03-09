import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from 'src/app/features/services/courseService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Course, Matiere } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';
import { getStorage, ref, listAll, uploadBytes, getDownloadURL } from 'firebase/storage';

import { updateDoc, doc, Firestore, Timestamp } from '@angular/fire/firestore';
import { MatiereService } from 'src/app/features/services/matiere.service';

// Interface vidéo Storage
interface StorageVideo {
  name: string;
  path: string;
  url: string;
}

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
  matieres: Matiere[] = [];
  courseId: string = '';
  instructors: Instructor[] = [];
  categories: string[] = [];
  matieresFiltrees: Matiere[] = [];

  existingDocuments: any[] = [];
  documentsToDelete: string[] = [];

  selectedNewDocuments: File[] = [];

  isUploadingDocuments = false;

  // Gestion image
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  originalImageUrl: string | null = null;
  imageBase64: string | null = null;

  isSaving = false;
  showNewCategoryInput = false;
  selectedCategoryBeforeAdd: string = '';

  storageVideos: StorageVideo[] = [];
  isVideoPickerOpen = false;
  isLoadingVideos = false;
  selectedVideo: StorageVideo | null = null;
  currentVideoUrl: string | null = null;
  classesDisponibles: string[] = [];
  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private firestore: Firestore,
    private matiereService: MatiereService
  ) {
    this.editForm = this.fb.group({
      title: [''],
      instructorId: [''],
      type: ['En ligne'],
      niveauScolaire: [this.course?.niveauScolaire || '', Validators.required],
      price: [0, Validators.min(0)],
      description: [''],
      duration: [0, Validators.min(0)],
      sessions: [''],
      documents: this.fb.array([]),
      exercises: [0, Validators.min(0)],
      certificateAvailable: [false],
      selectedCategoryOption: [''],
      newCategoryName: [''],
      category: [''],
      matiere: [this.course?.matiereId || '', Validators.required],
      videoUrl: [''],
      videoPath: [''],
      videoName: [''],
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
    this.loadMatieres();

    this.editForm.get('niveauScolaire')?.valueChanges.subscribe(() => {
      this.updateMatieresFiltrees();
      const currentMatiere = this.editForm.get('matiere')?.value;
      if (currentMatiere && !this.matieresFiltrees.some(m => m.id === currentMatiere)) {
        this.editForm.patchValue({ matiere: '' });
      }

      this.editForm.get('classe')?.valueChanges.subscribe(() => this.updateMatieresFiltrees());
    });


  }

  getNiveauLabel(niveau: string): string {
    const labels: Record<string, string> = {
      ELEMENTAIRE: 'Élémentaire',
      MOYEN: 'Moyen',
      SECONDAIRE: 'Secondaire',
      UNIVERSITAIRE: 'Universitaire'
    };
    return labels[niveau] || niveau || '?';
  }

  get documentsArray(): FormArray {
    return this.editForm.get('documents') as FormArray;
  }

  private loadCourse() {
    this.courseService.getCourse(this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data || res;
        this.originalImageUrl = this.course.image || null;
        this.imagePreview = this.course.image || null;
        this.existingDocuments = this.course.documents || [];

        const courseAny = this.course as any;
        if (courseAny.videoUrl) {
          this.currentVideoUrl = courseAny.videoUrl;
          this.selectedVideo = {
            url: courseAny.videoUrl,
            path: courseAny.videoPath || '',
            name: courseAny.videoName || 'Vidéo actuelle'
          };
        }

        this.documentsArray.clear();
        this.existingDocuments.forEach(doc => {
          this.documentsArray.push(this.fb.group({
            name: [doc.name],
            url: [doc.url],
            size: [doc.size],
            uploadedAt: [doc.uploadedAt]
          }));
        });


        this.editForm.patchValue({
          title: this.course.title || '',
          instructorId: this.course.instructorId || '',
          type: this.course.type || 'En ligne',
          price: this.course.price ?? 0,
          description: this.course.description || '',
          niveauScolaire: this.course.niveauScolaire || this.course.niveauScolaire || '',
          duration: this.course.duration ?? 0,
          sessions: this.course.sessions ?? 0,
          exercises: this.course.exercises ?? 0,
          certificateAvailable: !!this.course.certificateAvailable,
          category: this.course.category || '',
          selectedCategoryOption: this.course.category || '',
          videoUrl: courseAny.videoUrl || '',
          videoPath: courseAny.videoPath || '',
          videoName: courseAny.videoName || '',
          matiere: this.course.matiereId || '',
        });
      },
      error: () => {
        this.showToast('Impossible de charger le cours', 'danger');
      }
    });
  }

  // Quand l’utilisateur sélectionne de nouveaux fichiers
  onNewDocumentsSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach(file => {
      if (!file.name.toLowerCase().match(/\.(pdf|doc|docx)$/)) {
        this.showToast(`Format non supporté : ${file.name}`, 'warning');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.showToast(`Fichier trop gros : ${file.name} (> 10 Mo)`, 'warning');
        return;
      }

      this.selectedNewDocuments.push(file);

      // Ajout dans le FormArray (url vide pour l’instant)
      this.documentsArray.push(this.fb.group({
        name: [file.name],
        url: [''],
        size: [file.size],
        uploadedAt: ['']
      }));
    });

    input.value = ''; // reset input
  }

  removeDocument(index: number, isNew: boolean = false) {
    if (isNew) {
      this.selectedNewDocuments.splice(index - this.existingDocuments.length, 1);
      this.documentsArray.removeAt(index);
    } else {
      const docToRemove = this.existingDocuments[index];
      this.existingDocuments.splice(index, 1);
      this.documentsArray.removeAt(index);
    }
  }

  private async uploadNewDocuments(): Promise<any[]> {
    if (this.selectedNewDocuments.length === 0) return [];

    this.isUploadingDocuments = true;
    const storage = getStorage();
    const uploaded: any[] = [];

    try {
      for (let i = 0; i < this.selectedNewDocuments.length; i++) {
        const file = this.selectedNewDocuments[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `courses/${this.courseId}/documents/${Date.now()}_${safeName}`;
        const fileRef = ref(storage, path);

        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        const docInfo = {
          name: file.name,
          url,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };

        uploaded.push(docInfo);
      }
      return uploaded;
    } catch (err) {
      console.error('Erreur upload documents', err);
      this.showToast('Erreur lors de l’upload des documents', 'danger');
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
            url
          };
        })
      );

      console.log(` ${this.storageVideos.length} vidéos trouvées`);

    } catch (err) {
      console.error('Erreur chargement vidéos Storage:', err);
      this.showToast('Erreur lors du chargement des vidéos', 'danger');
    } finally {
      this.isLoadingVideos = false;
    }
  }

  selectVideo(video: StorageVideo) {
    this.selectedVideo = video;
    this.currentVideoUrl = video.url;

    this.editForm.patchValue({
      videoUrl: video.url,
      videoPath: video.path,
      videoName: video.name,
    });

    this.isVideoPickerOpen = false;
    this.showToast(`Vidéo "${video.name}" sélectionnée`, 'success');
  }

  removeVideo() {
    this.selectedVideo = null;
    this.currentVideoUrl = null;

    this.editForm.patchValue({
      videoUrl: '',
      videoPath: '',
      videoName: '',
    });
  }

  closeVideoPicker() {
    this.isVideoPickerOpen = false;
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

  loadMatieres() {
    this.matiereService.getMatiereActives().subscribe({
      next: (data) => {
        this.matieres = data || [];
        this.updateMatieresFiltrees();
      },
      error: err => console.error('Erreur matières', err)
    });
  }

  updateMatieresFiltrees() {
    const niveau = this.editForm.get('niveauScolaire')?.value;
    const classe = this.editForm.get('classe')?.value;
    let filtered = this.matieres;

    if (niveau) {
      filtered = filtered.filter(m => m.niveauScolaire === niveau);
    }

    if (classe) {
      filtered = filtered.filter(m => m.classe === classe);
    }

    this.matieresFiltrees = filtered.sort((a, b) =>
      (a.ordre || 0) - (b.ordre || 0) || a.nom.localeCompare(b.nom)
    );
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
        niveauScolaire: formValue.niveauScolaire,
        price: Number(formValue.price) || 0,
        description: formValue.description || '',
        duration: Number(formValue.duration) || 0,
        sessions: formValue.videoUrl || null,
        exercises: Number(formValue.exercises) || 0,
        certificateAvailable: !!formValue.certificateAvailable,
        category: formValue.category,
        videoUrl: formValue.videoUrl || null,
        videoPath: formValue.videoPath || null,
        videoName: formValue.videoName || null,
        matiereId: formValue.matiere || null,
        updatedAt: Timestamp.now()
      };

      // Si une nouvelle image a été sélectionnée, on l'ajoute en base64
      if (this.imageBase64) {
        updateData.image = this.imageBase64;
      }

      const newUploadedDocs = await this.uploadNewDocuments();

      // Fusion : anciens documents (non supprimés) + nouveaux
      const finalDocuments = [
        ...this.existingDocuments,
        ...newUploadedDocs
      ];

      if (finalDocuments.length > 0 || this.existingDocuments.length === 0) {
        updateData.documents = finalDocuments;
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

  goBack() {
    this.router.navigate([`admin-login/cours/${this.courseId}`]);
  }
}