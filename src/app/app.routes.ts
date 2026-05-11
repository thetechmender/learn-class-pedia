import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const urlParams = new URLSearchParams(window.location.search);
  const hasTokenInUrl = urlParams.has('t') || urlParams.has('token');
  
  if (hasTokenInUrl || authService.isUserAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};

const rootGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isUserAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  
  return router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: '',
    canActivate: [rootGuard],
    children: []
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'course',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'course/classroom',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'classroom',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent),
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
