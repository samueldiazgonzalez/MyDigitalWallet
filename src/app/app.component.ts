import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NotificationService } from './core/services/notification';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonicModule, RouterModule]
})
export class AppComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Inicializar push notifications cuando la app carga
    this.notificationService.initPush();
  }
}