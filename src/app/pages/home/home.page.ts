import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { CardService } from '../../core/services/card';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  userName = '';
  saldo = 0;
  mostrarSaldo = true;
  tarjetas: any[] = [];
  uid = '';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private cardService: CardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return of(null);
        }
        this.uid = user.uid;
        this.cardService.obtenerTarjetas(user.uid).subscribe(t => {
          this.tarjetas = t;
        });
        return this.firestore.collection('users').doc(user.uid).valueChanges();
      })
    ).subscribe((perfil: any) => {
      if (perfil) {
        this.userName = perfil.nombre || '';
        this.saldo = perfil.saldo || 0;
      }
    });
  }

  toggleSaldo() {
    this.mostrarSaldo = !this.mostrarSaldo;
  }

  goToAddCard() {
    this.router.navigate(['/add-card']);
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }
}