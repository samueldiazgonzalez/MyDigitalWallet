import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { debounceTime, map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AutoLoginGuard implements CanActivate {

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.afAuth.authState.pipe(
      debounceTime(200), // Esperar a que el estado se estabilice
      take(1),
      map(user => {
        // Si hay usuario autenticado y no está intentando ir a registro
        if (user && state.url !== '/register') {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      })
    );
  }
}