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

  // Registro con email y contraseña
  async signUp(email: string, password: string, userData: {
    nombre: string;
    apellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
    pais: string;
  }) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const uid = credential.user?.uid;
    await this.firestore.collection('users').doc(uid).set({
      ...userData,
      email,
      biometricEnabled: false,
      saldo: 0,
      createdAt: new Date()
    });
    return credential;
  }

  // Login con email
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Logout
  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  // Obtener usuario actual como observable
  getUser() {
    return this.afAuth.authState;
  }

  // Obtener perfil desde Firestore
  getUserProfile(uid: string) {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }
}