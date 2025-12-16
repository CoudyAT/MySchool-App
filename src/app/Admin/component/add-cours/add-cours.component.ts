import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from 'src/app/features/services/courseService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { UploadService } from 'src/app/features/services/upload.service';
import { Course } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';

@Component({
  selector: 'app-add-cours',
  templateUrl: './add-cours.component.html',
  styleUrls: ['./add-cours.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddCoursComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<any>();

  courseForm: FormGroup;
  instructors: Instructor[] = [];
  categories: string[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  constructor(private fb: FormBuilder, private instructorService: InstructorService,
    private courseService: CourseService, private uploadService: UploadService) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      instructorId: [''],
      description: [''],
      price: [0],
      image: [''],
      sessions: [0],
      exercises: [0],
      certificateAvailable: [false],
    });
  }

  ngOnInit(): void {
    this.loadInstructors();
    this.loadCategories();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    // preview
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }

  private loadInstructors() {
    this.instructorService.getInstructors().subscribe({
      next: (data) => (this.instructors = data),
      error: (err) => console.error('Erreur instructeurs', err)
    });
  }


  private loadCategories() {
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        this.categories = [
          ...new Set(courses.map(course => course.category))
        ];
      },
      error: (err) => console.error('Erreur catégories', err)
    });
  }

  async submitForm() {
    if (this.courseForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    const courseData = {
      ...this.courseForm.value,
    };

    this.formSubmit.emit(courseData);
  }

  private markAllAsTouched() {
    Object.keys(this.courseForm.controls).forEach((key) => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }
}


