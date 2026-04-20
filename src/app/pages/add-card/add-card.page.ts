import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardService } from 'src/app/core/services/card';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
  standalone: false
})
export class AddCardPage {

  numero = '';
  titular = '';
  expiracion = '';
  cvv = '';
  franquicia: 'visa' | 'mastercard' | 'unknown' = 'unknown';
  loading = false;
  errorMsg = '';

  constructor(private cardService: CardService, private router: Router) {}

  onNumeroChange() {
    this.numero = this.cardService.formatearNumero(this.numero);
    this.franquicia = this.cardService.detectarFranquicia(this.numero);
  }

  onExpiracionChange() {
    const digits = this.expiracion.replace(/\D/g, '');
    if (digits.length >= 2) {
      this.expiracion = digits.substring(0, 2) + '/' + digits.substring(2, 4);
    } else {
      this.expiracion = digits;
    }
  }

  async guardarTarjeta() {
    if (!this.numero || !this.titular || !this.expiracion || !this.cvv) {
      this.errorMsg = 'Todos los campos son obligatorios';
      return;
    }
    if (!this.cardService.validarLuhn(this.numero)) {
      this.errorMsg = 'Número de tarjeta inválido';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.cardService.agregarTarjeta({
        numero: this.numero,
        titular: this.titular,
        expiracion: this.expiracion,
        cvv: this.cvv,
        franquicia: this.franquicia
      });
      this.router.navigate(['/home']);
    } catch (error) {
      this.errorMsg = 'Error al guardar la tarjeta';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}