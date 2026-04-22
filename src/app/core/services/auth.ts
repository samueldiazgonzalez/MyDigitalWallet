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

  async login(email: string, password: string) {
    try {
      // Asegúrate de que no hay sesión anterior activa
      const currentUser = await this.afAuth.currentUser;
      if (currentUser && currentUser.email !== email) {
        await this.afAuth.signOut();
      }
      
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    await this.afAuth.signOut();
    // Forzar una pequena espera para que Firebase procese completamente el sign out
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async logout() {
    await this.signOut();
    this.router.navigate(['/login']);
  }

  /**
   * Obtener el usuario actualmente autenticado
   */
  async getCurrentUser() {
    return await this.afAuth.currentUser;
  }

  getUser() {
    return this.afAuth.authState;
  }

  getUserProfile(uid: string) {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }
  // Verificar si biometría está disponible
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      // Si estamos en web o biometría no está disponible, retornar false
      console.warn('Biometría no disponible:', error);
      return false;
    }
  }

  // Verificar identidad con biometría
  async verifyBiometric(): Promise<boolean> {
    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      await NativeBiometric.verifyIdentity({
        reason: 'Confirma tu identidad',
        title: 'Autenticación',
        subtitle: 'Usa tu huella o Face ID',
        description: 'Requerido para acceder'
      });
      return true;
    } catch (error) {
      console.warn('Verificación biométrica falló:', error);
      return false;
    }
  }

// Guardar credenciales biométricas
async setBiometricCredentials(email: string, password: string) {
  try {
    const { NativeBiometric } = await import('capacitor-native-biometric');
    await NativeBiometric.setCredentials({
      username: email,
      password: password,
      server: 'mydigitalwallet.app'
    });
  } catch (error) {
    console.warn('No se pudieron guardar credenciales biométricas:', error);
    // No lanzamos error, solo continuamos
  }
}

// Obtener credenciales biométricas
async getBiometricCredentials() {
  try {
    const { NativeBiometric } = await import('capacitor-native-biometric');
    return await NativeBiometric.getCredentials({
      server: 'mydigitalwallet.app'
    });
  } catch (error) {
    console.warn('No se pudieron obtener credenciales biométricas:', error);
    return null;
  }
}
async loginConGoogle() {
  try {
    const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');

    await GoogleSignIn.initialize({
      clientId: '255815554661-clmcvmdtbofnkaprm6n06ppqb2darenk.apps.googleusercontent.com',
    });

    const result = await GoogleSignIn.signIn();

    const { GoogleAuthProvider, signInWithCredential, getAuth } = await import('firebase/auth');
    const credential = GoogleAuthProvider.credential(result.idToken);
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, credential);

    const user = userCredential.user;
    const userDoc = await this.firestore.firestore.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      await this.firestore.firestore.collection('users').doc(user.uid).set({
        nombre: user.displayName?.split(' ')[0] || '',
        apellido: user.displayName?.split(' ')[1] || '',
        email: user.email,
        biometricEnabled: false,
        saldo: 0,
        createdAt: new Date()
      });
    }

    return userCredential;
  } catch (error) {
    throw error;
  }
}
}