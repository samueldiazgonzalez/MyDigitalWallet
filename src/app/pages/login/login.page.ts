import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {

  email = '';
  password = '';
  loading = false;
  errorMsg = '';
  biometricAvailable = false;

  constructor(private authService: AuthService, private router: Router) {}

  async ionViewWillEnter() {
    // Limpiamos errores y campos cada vez que se entra a la vista
    this.errorMsg = '';
    this.loading = false;
    this.email = '';
    this.password = '';
    this.biometricAvailable = await this.authService.isBiometricAvailable();
  }

  async login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      const result = await this.authService.login(this.email.trim(), this.password);
      
      if (result.user) {
        // Intentar guardar las credenciales biométricas (si falla, continuar igual)
        try {
          await this.authService.setBiometricCredentials(this.email.trim(), this.password);
        } catch (bioError) {
          // Si falla biometría, no importa, continuar con el login
          console.warn('No se pudieron guardar credenciales biométricas:', bioError);
        }
        
        // Esperar un poco para que Firebase actualice el estado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('Error de login:', error);
      this.errorMsg = this.getErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  async loginConBiometria() {
    try {
      const verified = await this.authService.verifyBiometric();
      if (!verified) return;
      
      const credentials = await this.authService.getBiometricCredentials();
      
      if (credentials) {
        this.loading = true;
        await this.authService.login(credentials.username, credentials.password);
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.errorMsg = 'No hay credenciales guardadas. Inicia sesión manualmente primero.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Modificado para limpiar la sesión y los campos antes de ir a registro.
   * Esto evita que al registrarte te cargue la cuenta que acabas de cerrar.
   */
  async goToRegister() {
    this.email = '';
    this.password = '';
    this.errorMsg = '';
    
    try {
      // Cerramos sesión completamente antes de navegar
      await this.authService.signOut(); 
      // Pequeña espera para asegurar que authState se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      // Si no hay sesión activa, ignoramos el error
    }

    this.router.navigate(['/register']);
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'Usuario no encontrado';
      case 'auth/wrong-password': return 'Contraseña incorrecta';
      case 'auth/invalid-email': return 'Email inválido';
      case 'auth/too-many-requests': return 'Demasiados intentos. Intenta más tarde.';
      case 'auth/configuration-not-found': return 'Error de configuración en Firebase.';
      default: return 'Error al iniciar sesión';
    }
  }
  async loginConGoogle() {
  this.loading = true;
  this.errorMsg = '';
  try {
    await this.authService.loginConGoogle();
    this.router.navigate(['/home']);
  } catch (error: any) {
    this.errorMsg = 'Error al iniciar sesión con Google';
  } finally {
    this.loading = false;
  }
}
}