import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'animate-pulse bg-gray-200 ' + className" [ngStyle]="{'width': width, 'height': height, 'border-radius': borderRadius}"></div>
  `,
  styles: [`
    :host { display: inline-block; width: 100%; }
  `]
})
export class SkeletonComponent {
  @Input() className = '';
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() borderRadius = '0.25rem';
}
