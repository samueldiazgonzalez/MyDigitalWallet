import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export interface Transaction {
  id?: string;
  cardId: string;
  merchant: string;
  amount: number;
  date: Date;
  emoji?: string;
  uid: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  async realizarPago(cardId: string, merchant: string, amount: number) {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');
    return this.firestore.collection('transactions').add({
      cardId,
      merchant,
      amount,
      date: new Date(),
      uid: user.uid,
      emoji: ''
    });
  }

  obtenerTransacciones(uid: string) {
    return this.firestore.collection('transactions', ref =>
      ref.where('uid', '==', uid).orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  obtenerTransaccionesPorTarjeta(cardId: string) {
    return this.firestore.collection('transactions', ref =>
      ref.where('cardId', '==', cardId).orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  async actualizarEmoji(transactionId: string, emoji: string) {
    return this.firestore.collection('transactions').doc(transactionId).update({ emoji });
  }
}