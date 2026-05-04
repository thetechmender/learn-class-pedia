import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.sass'
})
export class HeaderComponent {
  isProfileDropdownOpen = signal(false);
  isMobileMenuOpen = signal(false);
  private courseService = inject(CourseService)

  user = {
    name: 'Danish Ahmed',
    email: 'danish.ahmed@example.com',
    initials: 'DA'
  };

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout() {
  }

  toggleChat() {
    this.courseService.toggleChat();
  }
}
