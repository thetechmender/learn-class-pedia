import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>You do not have access to this course.</p>
        <p class="sub-text">Please ensure you are enrolled in this course or contact support for assistance.</p>
        <div class="action-buttons">
          <button (click)="goToHome()" class="btn-primary">Go to Home</button>
          <button (click)="goToLogin()" class="btn-secondary">Login</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .unauthorized-content {
      background: white;
      border-radius: 16px;
      padding: 60px 40px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .icon-wrapper {
      margin-bottom: 30px;
    }

    .icon-wrapper svg {
      color: #dc2626;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }

    p {
      font-size: 18px;
      color: #4b5563;
      margin-bottom: 12px;
    }

    .sub-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 32px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    button {
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 640px) {
      .unauthorized-content {
        padding: 40px 24px;
      }

      h1 {
        font-size: 24px;
      }

      p {
        font-size: 16px;
      }

      .action-buttons {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    window.location.href = '/login';
  }
}
