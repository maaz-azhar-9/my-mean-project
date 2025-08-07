import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService)
  const router = inject(Router)
  const token = authSvc.getToken()
  if(!token){
    router.navigate(['/auth/login'])
    return false;
  }
  return true;
};
