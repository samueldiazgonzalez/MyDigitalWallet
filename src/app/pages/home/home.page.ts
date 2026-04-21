import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap, of } from 'rxjs';

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
  transacciones: any[] = [];
  uid = '';

  private db: any;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.db = this.firestore.firestore;
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.uid = user.uid;
      this.cargarDatos(user.uid);
    });
  }

  async cargarDatos(uid: string) {
  // Perfil
  this.db.collection('users').doc(uid)
    .onSnapshot((doc: any) => {
      if (doc.exists) {
        const data = doc.data();
        this.userName = data.nombre || '';
        this.saldo = data.saldo || 0;
      }
    });

  // Tarjetas - sin orderBy por ahora
  this.db.collection('cards')
    .where('uid', '==', uid)
    .onSnapshot((snap: any) => {
      this.tarjetas = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      console.log('Tarjetas:', this.tarjetas);
    });

  // Transacciones - sin orderBy por ahora
  this.db.collection('transactions')
    .where('uid', '==', uid)
    .onSnapshot((snap: any) => {
      this.transacciones = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
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

  formatFecha(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }
}