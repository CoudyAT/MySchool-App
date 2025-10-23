import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-cours',
  templateUrl: './add-cours.component.html',
  styleUrls: ['./add-cours.component.scss'],
  standalone: true,
})
export class AddCoursComponent   {
  @Output() formSubmit = new EventEmitter<any>();

  courseForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      instructor: ['', Validators.required],
      description: [''],
      price: [0],
      image: [''],
      sessions: [0],
      exercises: [0],
      certificateAvailable: [false]
    });
  }

  submitForm() {
    if (this.courseForm.valid) {
      this.formSubmit.emit(this.courseForm.value);
    } else {
      this.markAllAsTouched();
    }
  }

  private markAllAsTouched() {
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }
}


