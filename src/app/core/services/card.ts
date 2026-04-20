import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export interface Card {
  id?: string;
  numero: string;
  titular: string;
  expiracion: string;
  cvv: string;
  franquicia: 'visa' | 'mastercard' | 'unknown';
  uid: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class CardService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  validarLuhn(numero: string): boolean {
    const digits = numero.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  detectarFranquicia(numero: string): 'visa' | 'mastercard' | 'unknown' {
    const digits = numero.replace(/\s/g, '');
    if (digits.startsWith('4')) return 'visa';
    const bin = parseInt(digits.substring(0, 4));
    if ((bin >= 51 && bin <= 55) || (bin >= 2221 && bin <= 2720)) return 'mastercard';
    return 'unknown';
  }

  formatearNumero(numero: string): string {
    const digits = numero.replace(/\D/g, '');
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  }

  async agregarTarjeta(card: Omit<Card, 'uid' | 'createdAt'>) {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');
    return this.firestore.collection('cards').add({
      ...card,
      uid: user.uid,
      createdAt: new Date()
    });
  }

  obtenerTarjetas(uid: string) {
    return this.firestore.collection('cards', ref =>
      ref.where('uid', '==', uid).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  eliminarTarjeta(id: string) {
    return this.firestore.collection('cards').doc(id).delete();
  }
}