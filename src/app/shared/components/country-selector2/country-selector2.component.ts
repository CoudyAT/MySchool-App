import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OptionCountry } from '../country-selector/country-selector.component';

@Component({
  selector: 'app-country-selector2',
  templateUrl: './country-selector2.component.html',
  styleUrls: ['./country-selector2.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class CountrySelector2Component  implements OnInit {
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