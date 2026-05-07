import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ClassroomAccessService } from '../services/classroom-access.service';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, switchMap } from 'rxjs';

export const classroomGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const classroomAccessService = inject(ClassroomAccessService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const courseId = route.queryParamMap.get('courseId');
  const careerPathLevelDetailId = route.queryParamMap.get('careerPathLevelDetailId');

  if (!courseId && !careerPathLevelDetailId) {
    router.navigate(['/unauthorized']);
    return of(false);
  }

  const idToValidate = careerPathLevelDetailId ? parseInt(careerPathLevelDetailId) : parseInt(courseId!);

  return classroomAccessService.checkAuthStatus().pipe(
    switchMap(() => {
      return classroomAccessService.validateClassroomAccess(idToValidate).pipe(
        map((response) => {
          if (response?.isSuccess || response?.success) {
            return true;
          } else {
            router.navigate(['/unauthorized']);
            return false;
          }
        }),
        catchError((error) => {
          if (error.status === 401) {
            authService.redirectToLogin();
          } else {
            router.navigate(['/unauthorized']);
          }
          return of(false);
        })
      );
    }),
    catchError((error) => {
      if (error.status === 401) {
        authService.redirectToLogin();
      } else {
        router.navigate(['/unauthorized']);
      }
      return of(false);
    })
  );
};
