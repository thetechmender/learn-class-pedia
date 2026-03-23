import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'course',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'course',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent)
  },
  {
    path: 'course/classroom',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent)
  },
  {
    path: 'classroom',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent)
  },
  {
    path: '**',
    redirectTo: 'course'
  }
];
