// phone-input.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { COUNTRIES } from '../../utils/countries';
import { AsYouType, CountryCode, formatNumber, parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Composant d'entrée de numéro de téléphone avec sélection de pays.
 * Permet de saisir un numéro de téléphone international avec un indicatif de pays.
 */
@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ],
  imports: [CommonModule, FormsModule]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Numéro de téléphone';
  @Input() disabled = false;
  @Output() countryChange = new EventEmitter<any>();
  @Output() validationChange = new EventEmitter<boolean>();

  countries = COUNTRIES;
  selectedCountry = this.countries[0];
  phoneNumber = '';
  displayPhoneNumber = ''; // Numéro formaté pour l'affichage
  isCountrySelectOpen = false;
  isValid = false;
  touched = false;

  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isCountrySelectOpen = false;
    }
  }

  // Implémentation ControlValueAccessor
  writeValue(value: string): void {
    if (value) {
      this.parseAndFormatPhoneValue(value);
    } else {
      this.phoneNumber = '';
      this.displayPhoneNumber = '';
      this.selectedCountry = this.countries[0];
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Méthodes de formatage
  parseAndFormatPhoneValue(value: string): void {
    if (!value) return;

    try {
      const phoneNumber = parsePhoneNumberWithError(value);
      if (phoneNumber) {
        // Trouve le pays correspondant
        const country = this.countries.find(c => c.code === phoneNumber.country);
        if (country) {
          this.selectedCountry = country;
        }

        this.phoneNumber = phoneNumber.nationalNumber;
        console.log("ddd");

        this.displayPhoneNumber = this.formatPhoneNumber(this.phoneNumber);
        this.validatePhoneNumber();
      }
    } catch (error) {
      // Si le parsing échoue, on garde la valeur brute
      console.log("parsing");

      this.phoneNumber = value;
      this.displayPhoneNumber = value;
      this.isValid = false;
    }
  }

  formatPhoneNumber(number: string): string {
    if (!number) return '';

    try {
      const countryCode = this.selectedCountry.code as CountryCode;
      const asYouType = new AsYouType(countryCode);
      const asYouTypeValue = asYouType.input(number);
      console.log("formatage des données ", asYouTypeValue);
      return asYouTypeValue;
    } catch (error) {
      console.log("erreur parsing");
      return number;
    }
  }

  validatePhoneNumber(): void {
    try {
      const fullNumber = this.selectedCountry.dialCode + this.phoneNumber;
      const phoneNumber = parsePhoneNumberWithError(fullNumber);
      this.isValid = phoneNumber ? phoneNumber.isValid() : false;
      this.validationChange.emit(this.isValid);
    } catch (error) {
      this.isValid = false;
      this.validationChange.emit(false);
    }
  }

  get fullPhoneNumber(): string {
    if (!this.phoneNumber) return '';
    return this.selectedCountry.dialCode + this.phoneNumber;
  }

  get formattedFullPhoneNumber(): string {
    if (!this.phoneNumber) return '';

    try {
      const fullNumber = this.fullPhoneNumber;
      return formatNumber(fullNumber, 'INTERNATIONAL') || fullNumber;
    } catch (error) {
      return this.fullPhoneNumber;
    }
  }

  toggleCountrySelect(): void {
    if (!this.disabled) {
      this.isCountrySelectOpen = !this.isCountrySelectOpen;
    }
  }

  selectCountry(country: any, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.disabled) return;

    this.selectedCountry = country;
    this.isCountrySelectOpen = false;
    this.countryChange.emit(country);

    // Reformate le numéro avec le nouveau pays
    if (this.phoneNumber) {
      this.displayPhoneNumber = this.formatPhoneNumber(this.phoneNumber);
      this.validatePhoneNumber();
    }

    this.updateValue();
  }

  onPhoneNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Extrait seulement les chiffres pour le stockage
    this.phoneNumber = value;

    // Formate pour l'affichage
    this.displayPhoneNumber = this.formatPhoneNumber(this.phoneNumber);

    // Met à jour la valeur dans l'input
    input.value = this.displayPhoneNumber;
    // input.value = formatNumber(fullNumber, 'INTERNATIONAL') || fullNumber;;

    this.validatePhoneNumber();
    this.updateValue();
  }

  onInputBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  close(): void {
    this.isCountrySelectOpen = false;
  }

  private updateValue(): void {
    const fullNumber = this.fullPhoneNumber;
    this.onChange(fullNumber);
  }

  // Méthode pour obtenir des exemples de numéros
  getExampleNumber(): string {
    try {
      const countryCode = this.selectedCountry.code as CountryCode;
      // Vous pouvez utiliser getExampleNumber de libphonenumber-js si nécessaire
      return this.selectedCountry.dialCode + ' XX XXX XX XX';
    } catch (error) {
      return this.placeholder;
    }
  }
}