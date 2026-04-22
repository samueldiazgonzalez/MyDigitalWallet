import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  userName = 'Cargando...';
  saldo = 0;
  mostrarSaldo = true;
  tarjetas: any[] = [];
  transacciones: any[] = [];
  uid = '';
  mostrarEmojiPicker = false;
  transaccionSeleccionada: any = null;

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
    // 1. Datos del Usuario
    this.db.collection('users').doc(uid)
      .onSnapshot((doc: any) => {
        if (doc.exists) {
          const data = doc.data();
          this.userName = data.nombre || 'Usuario';
          this.saldo = data.saldo || 0;
        }
      });

    // 2. Recuperar Tarjetas
    this.db.collection('cards')
      .where('uid', '==', uid)
      .onSnapshot((snap: any) => {
        this.tarjetas = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      });

    // 3. Recuperar Transacciones
    this.db.collection('transactions')
      .where('uid', '==', uid)
      .orderBy('date', 'desc')
      .onSnapshot((snap: any) => {
        this.transacciones = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }, (err: any) => {
        // Fallback si no hay índice creado en Firebase aún
        this.db.collection('transactions').where('uid', '==', uid)
          .onSnapshot((s: any) => {
            this.transacciones = s.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          });
      });
  }

  // --- Lógica de Interfaz ---

  toggleSaldo() {
    this.mostrarSaldo = !this.mostrarSaldo;
  }

  formatFecha(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  // --- LAS FUNCIONES QUE FALTABAN ---

  onLongPress(tx: any) {
    this.transaccionSeleccionada = tx;
    this.mostrarEmojiPicker = true;
  }

  // Esta función la usa el componente <emoji-mart>
  async seleccionarEmoji(event: any) {
    if (event && event.emoji) {
      this.selectEmoji(event.emoji.native);
    }
  }

  // Esta función la usan los botones del Modal (Líneas 135, 144, 153 del HTML)
  async selectEmoji(emoji: string) {
    if (this.transaccionSeleccionada) {
      try {
        await this.db.collection('transactions')
          .doc(this.transaccionSeleccionada.id)
          .update({ emoji: emoji });
      } catch (error) {
        console.error("Error al guardar emoji:", error);
      }
    }
    this.cerrarEmoji();
  }

  cerrarEmoji() {
    this.mostrarEmojiPicker = false;
    this.transaccionSeleccionada = null;
  }

  // Esta función la usa el *ngFor (Línea 134 del HTML)
  getEmojisByCategory(category: string): string[] {
    const categories: any = {
      'transacciones': ['💰', '💳', '🛒', '🍔', '🚗', '🎟️'],
      'sentimientos': ['😊', '🤑', '💸', '😍', '👍'],
      'otros': ['📦', '📱', '🎮', '🏠', '🎁']
    };
    return categories[category] || [];
  }

  // --- Navegación ---

  goToAddCard() { this.router.navigate(['/add-card']); }
  goToPayment() { this.router.navigate(['/payment']); }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }
  cardFlipped: { [key: string]: boolean } = {};

toggleCard(cardId: string) {
  this.cardFlipped[cardId] = !this.cardFlipped[cardId];
}
}