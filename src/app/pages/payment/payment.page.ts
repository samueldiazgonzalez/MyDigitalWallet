import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { faker } from '@faker-js/faker';
import { NotificationService } from '../../core/services/notification';
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
  uid = '';

  private db: any;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private toast: ToastService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.db = this.firestore.firestore;
  }

  async ionViewWillEnter() {
    await this.notification.initPush();
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
    try {
      // Agregar la transacción a la base de datos
      await this.db.collection('transactions').add({
        cardId: this.tarjetaSeleccionada.id,
        merchant: this.merchant,
        amount: this.amount,
        date: new Date(),
        uid: this.uid,
        emoji: ''
      });

      // Mostrar toast de éxito
      await this.toast.showSuccess(
        `Pago de $${this.amount.toLocaleString()} realizado exitosamente`
      );

      // Enviar notificación (con pequeño delay para asegurar tokens)
      try {
        const status = this.notification.getStatus();
        console.log('Estado de notificaciones:', status);
        
        if (status.conectado) {
          await this.notification.enviarNotificacion(
            'Pago Exitoso ✅',
            `Has realizado un pago de $${this.amount.toLocaleString()} en ${this.merchant}`,
            {
              merchant: this.merchant,
              amount: this.amount.toString(),
              timestamp: new Date().toISOString()
            }
          );
        } else {
          console.warn('⚠️ Tokens no disponibles. Reintentando en 1s...');
          // Reintentar después de 1 segundo
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.notification.enviarNotificacion(
            'Pago Exitoso ✅',
            `Has realizado un pago de $${this.amount.toLocaleString()} en ${this.merchant}`,
            {
              merchant: this.merchant,
              amount: this.amount.toString(),
              timestamp: new Date().toISOString()
            }
          );
        }
      } catch (notificationError) {
        console.error('⚠️ Error al enviar notificación (no crítico):', notificationError);
        // No bloqueamos el pago si la notificación falla
      }

      // Generar nuevo pago simulado
      this.generarSimulacion();
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      this.errorMsg = 'Error al procesar el pago';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}