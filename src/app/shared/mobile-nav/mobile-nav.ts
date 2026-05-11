import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-nav.html',
  styles: [`
    :host {
      display: block;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 50;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0;
      color: #6b7280;
      font-size: 0.75rem;
      transition: color 0.2s;
    }
    .nav-item.active {
      color: #0062CC;
    }
    .nav-item svg {
      width: 1.5rem;
      height: 1.5rem;
      margin-bottom: 0.25rem;
    }
  `]
})
export class MobileNavComponent {}
