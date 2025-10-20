import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[formatNumber]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormatNumberDirective),
      multi: true
    }
  ]
})
export class FormatNumberDirective implements ControlValueAccessor {
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private isDisabled = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: any): void {
    if (value !== null && value !== undefined && !isNaN(value)) {
      this.el.nativeElement.value = this.format(Number(value));
    } else {
      this.el.nativeElement.value = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.el.nativeElement.disabled = isDisabled;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    // Éviter de formater pendant la saisie pour une meilleure expérience utilisateur
    const numericValue = this.parse(value);
    this.el.nativeElement.value = isNaN(numericValue) ? '' : this.format(numericValue);
    this.onChange(isNaN(numericValue) ? null : numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    // Formater seulement quand le champ perd le focus
    const value = this.parse(this.el.nativeElement.value);
    this.el.nativeElement.value = isNaN(value) ? '' : this.format(value);
    this.onTouched();
  }

  private parse(value: string): number {
    if (!value) return NaN;
    // Permet à la fois . et , comme séparateur décimal
    const cleanedValue = value.replace(/\s/g, '')
                             .replace(',', '.');
    return parseFloat(cleanedValue);
  }

  private format(value: number): string {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
}