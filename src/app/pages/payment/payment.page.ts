import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { faker } from '@faker-js/faker';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false
})
export class PaymentPage implements OnInit {

  tarjetas: any[] = [];
  tarjetaSeleccionada: any = null;
  merchant = '';
  amount = 0;
  loading = false;
  errorMsg = '';
  successMsg = '';
  uid = '';

  private db: any;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private toast: ToastService,
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

      this.db.collection('cards')
        .where('uid', '==', user.uid)
        .onSnapshot((snap: any) => {
          this.tarjetas = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          if (this.tarjetas.length > 0 && !this.tarjetaSeleccionada) {
            this.tarjetaSeleccionada = this.tarjetas[0];
          }
        });
    });
    this.generarSimulacion();
  }

  generarSimulacion() {
    this.merchant = faker.company.name();
    this.amount = parseFloat(faker.commerce.price({ min: 5000, max: 500000 }));
  }

  async realizarPago() {
    if (!this.tarjetaSeleccionada) {
      this.errorMsg = 'Selecciona una tarjeta';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    try {
      await this.db.collection('transactions').add({
        cardId: this.tarjetaSeleccionada.id,
        merchant: this.merchant,
        amount: this.amount,
        date: new Date(),
        uid: this.uid,
        emoji: ''
      });
      await this.toast.showSuccess(
  `Pago de $${this.amount.toLocaleString()} realizado exitosamente`
);
this.generarSimulacion();
    } catch (error) {
      this.errorMsg = 'Error al procesar el pago';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}