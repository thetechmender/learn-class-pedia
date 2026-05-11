import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        if (response.isSuccess && response.data?.token) {
          this.toastr.success(`Welcome back, ${response.data.fullName}!`, 'Login Successful');
          
          this.authService.storeUserSession({
            token: response.data.token,
            customerId: response.data.customerId,
            fullName: response.data.fullName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
            profileImageUrl: response.data.profileImageUrl,
            tokenExpirationTime: response.data.tokenExpirationTime
          });

          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error(response.errorMessage || 'Login failed', 'Error');
          this.isLoading.set(false);
        }
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.toastr.error('An error occurred during login. Please try again.', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
