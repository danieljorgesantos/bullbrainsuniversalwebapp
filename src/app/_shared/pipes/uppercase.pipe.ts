import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uppercase',
  standalone: true // Make the pipe standalone
})
export class UppercasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.toUpperCase();
  }
}
