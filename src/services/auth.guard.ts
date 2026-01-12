
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguarda inicialização se necessário (max 5s)
  let timeout = 0;
  while (!authService.isInitialized() && timeout < 50) {
    await new Promise(r => setTimeout(r, 100));
    timeout++;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
