import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  async signUp(email: string, password: string, userData: {
    nombre: string;
    apellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
    pais: string;
  }) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const uid = credential.user?.uid;
    if (!uid) throw new Error('No se pudo obtener el UID');
    
    await this.firestore.firestore
      .collection('users')
      .doc(uid)
      .set({
        nombre: userData.nombre,
        apellido: userData.apellido,
        tipoDocumento: userData.tipoDocumento,
        numeroDocumento: userData.numeroDocumento,
        pais: userData.pais,
        email: email,
        biometricEnabled: false,
        saldo: 0,
        createdAt: new Date()
      });
    return credential;
  }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.afAuth.authState;
  }

  getUserProfile(uid: string) {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }
}