import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrl: './date-selector.component.scss',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatNativeDateModule
  ]
})
export class DateSelectorComponent implements OnInit {
  @Input() placeholder = 'Sélectionnez une date de naissance';
  @Input() selectedDate: Date | null = null;
  @Output() dateChange = new EventEmitter<string | null>();

  @ViewChild('datePicker') datePicker!: MatDatepicker<Date>;

  isOpen = false;
  minDate: Date;
  maxDate: Date;

  constructor(private elementRef: ElementRef) {
    // Calcul des dates limites : entre 10 et 100 ans avant aujourd'hui
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    this.minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  }

ngOnInit() {
  // Si aucune date n'est passée en @Input, on utilise la date par défaut (ex: 10 ans en arrière)
  if (!this.selectedDate) {
    this.selectedDate = new Date(this.maxDate); // ou une autre valeur par défaut
    this.dateChange.emit(this.getFormattedDate()); 
  }
}


  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDatePicker() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // Ouvrir le datepicker
      this.datePicker.open();
    } else {
      // Fermer le datepicker
      this.datePicker.close();
    }
  }

  onDateSelected(selectedDate: Date | null) {
    this.selectedDate = selectedDate;
    this.dateChange.emit(this.getFormattedDate());
    this.isOpen = false;
  }

  onDatePickerClosed() {
    this.isOpen = false;
  }

  onDatePickerOpened() {
    this.isOpen = true;
  }

  getFormattedDate(): string {
    if (!this.selectedDate) {
      return this.placeholder;
    }
    
    return this.selectedDate.toLocaleDateString('us-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getDisplayAge(): string {
    if (!this.selectedDate) return '';
    
    const today = new Date();
    const age = today.getFullYear() - this.selectedDate.getFullYear();
    const monthDiff = today.getMonth() - this.selectedDate.getMonth();
    
    // Ajustement si l'anniversaire n'est pas encore passé cette année
    const finalAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.selectedDate.getDate())) 
      ? age - 1 
      : age;
    
    return `${finalAge} ans`;
  }
}