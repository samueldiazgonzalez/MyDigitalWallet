import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  userName = '';
  saldo = 0;
  mostrarSaldo = true;
  tarjetas: any[] = [];
  transacciones: any[] = [];
  uid = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.uid = user.uid;
      this.authService.getUserProfile(user.uid).subscribe((perfil: any) => {
        if (perfil) {
          this.userName = perfil.nombre;
          this.saldo = perfil.saldo || 0;
        }
      });
    });
  }

  toggleSaldo() {
    this.mostrarSaldo = !this.mostrarSaldo;
  }

  goToAddCard() {
    this.router.navigate(['/add-card']);
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }

  async logout() {
    await this.authService.logout();
  }
}