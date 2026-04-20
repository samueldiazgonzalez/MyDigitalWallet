import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AutoLoginGuard implements CanActivate {

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate() {
    return this.afAuth.authState.pipe(
      take(1),
      map(user => {
        if (user) {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      })
    );
  }
}