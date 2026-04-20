import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';

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

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg = this.getErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'Usuario no encontrado';
      case 'auth/wrong-password': return 'Contraseña incorrecta';
      case 'auth/invalid-email': return 'Email inválido';
      case 'auth/too-many-requests': return 'Demasiados intentos, intenta más tarde';
      default: return 'Error al iniciar sesión';
    }
  }
}