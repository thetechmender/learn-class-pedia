import { Routes } from '@angular/router';
import { classroomGuard } from './guards/classroom.guard';

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
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent),
    canActivate: [classroomGuard]
  },
  {
    path: 'classroom',
    loadComponent: () => import('./setup/course/course').then(m => m.CourseComponent),
    canActivate: [classroomGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/unauthorized/unauthorized').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: 'course'
  }
];
