import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardService } from '../../core/services/card';
import { PaymentService } from '../../core/services/payment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { faker } from '@faker-js/faker';

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

  constructor(
    private cardService: CardService,
    private paymentService: PaymentService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.uid = user.uid;
      this.cardService.obtenerTarjetas(user.uid).subscribe(tarjetas => {
        this.tarjetas = tarjetas;
        if (tarjetas.length > 0) {
          this.tarjetaSeleccionada = tarjetas[0];
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
      await this.paymentService.realizarPago(
        this.tarjetaSeleccionada.id,
        this.merchant,
        this.amount
      );
      this.successMsg = `Pago de $${this.amount.toLocaleString()} realizado exitosamente`;
      setTimeout(() => {
        this.generarSimulacion();
        this.successMsg = '';
      }, 2000);
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