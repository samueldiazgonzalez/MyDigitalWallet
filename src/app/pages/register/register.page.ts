import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {

  nombre = '';
  apellido = '';
  tipoDocumento = 'CC';
  numeroDocumento = '';
  pais = '';
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    if (!this.nombre || !this.apellido || !this.numeroDocumento || 
        !this.pais || !this.email || !this.password) {
      this.errorMsg = 'Todos los campos son obligatorios';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.authService.signUp(this.email, this.password, {
        nombre: this.nombre,
        apellido: this.apellido,
        tipoDocumento: this.tipoDocumento,
        numeroDocumento: this.numeroDocumento,
        pais: this.pais
      });
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg = this.getErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use': return 'Este email ya está registrado';
      case 'auth/invalid-email': return 'Email inválido';
      case 'auth/weak-password': return 'Contraseña muy débil';
      default: return 'Error al registrarse';
    }
  }
}