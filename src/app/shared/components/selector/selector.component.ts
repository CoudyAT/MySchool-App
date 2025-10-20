import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Option {
    value: any,
    label: string,
    icon?: string,    // Classes CSS pour l'icône (ex: "fas fa-flag")
    flag?: string,    // URL vers une image de drapeau
    badge?: string
}

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class SelectorComponent implements OnInit{
  @Input() options: Option[] = [];
  @Input() placeholder = 'Sélectionnez une option';
  @Input() defaultOption: string | null = null;
  @Output() selectedChange = new EventEmitter<any>();

  isOpen = false;
  selectedOption: Option | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(){
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

  selectOption(option: Option) {
    this.selectedOption = option;
    this.selectedChange.emit(option.value);
    this.close();
  }
}