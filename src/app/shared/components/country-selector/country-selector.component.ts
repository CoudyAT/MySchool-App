import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface OptionCountry {
  country: string,
  nationality: string,
  icon?: string,    // Classes CSS pour l'icône (ex: "fas fa-flag")
  flag?: string,    // URL vers une image de drapeau
}

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class CountrySelectorComponent implements OnInit {
  @Input() options: OptionCountry[] = [];
  @Input() placeholder = 'Sélectionnez une option';
  // @Input() defaultOption: string | null = nationalities[0];
  @Output() selectedChange = new EventEmitter<any>();

  isOpen = false;
  selectedOption: OptionCountry | null = null;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.selectOption(this.options[0])
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  selectOption(option: OptionCountry) {
    this.selectedOption = option;
    this.selectedChange.emit(option.nationality);
    this.close();
  }
}