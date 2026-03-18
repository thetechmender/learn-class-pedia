import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    console.log('Logout clicked');
  }
}
