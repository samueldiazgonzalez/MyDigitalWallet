import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private apiUrl = 'https://sendnotificationfirebase-production.up.railway.app';
  private jwtToken = '';
  fcmToken = '';

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    // Escuchar cambios de autenticación
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // Cuando hay usuario, hacer login en el backend de notificaciones
        this.authenticateWithBackend(user.email || '', user.uid);
      }
    });
  }

  /**
   * Autenticar con el backend de notificaciones usando el email del usuario
   */
  private async authenticateWithBackend(email: string, uid: string) {
    try {
      const res: any = await this.http.post(`${this.apiUrl}/user/login`, {
        email,
        uid
      }).toPromise();
      
      if (res && res.token) {
        this.jwtToken = res.token;
        console.log('✅ Autenticación con backend de notificaciones exitosa');
      }
    } catch (error) {
      console.warn('⚠️ Error autenticando con backend de notificaciones:', error);
    }
  }

  async initPush() {
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        console.warn('Permiso de notificaciones denegado');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async token => {
        this.fcmToken = token.value;
        console.log('📱 FCM Token obtenido:', token.value);
        
        const user = await this.afAuth.currentUser;
        if (user) {
          await this.firestore.firestore
            .collection('users')
            .doc(user.uid)
            .update({ fcmToken: token.value });
          console.log('✅ FCM Token guardado en Firestore');
        }
      });

      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('📬 Notificación recibida:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', action => {
        console.log('👆 Notificación accionada:', action);
      });
    } catch (error) {
      console.warn('⚠️ Error inicializando push notifications:', error);
    }
  }

  /**
   * Enviar notificación al usuario
   */
  async enviarNotificacion(titulo: string, cuerpo: string, data: any = {}) {
    if (!this.fcmToken) {
      console.warn('❌ No hay FCM token disponible');
      return;
    }
    
    if (!this.jwtToken) {
      console.warn('❌ No hay JWT token disponible. No se puede enviar notificación');
      return;
    }

    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${this.jwtToken}`,
      'Content-Type': 'application/json'
    });
    
    try {
      const payload = {
        token: this.fcmToken,
        notification: { 
          title: titulo, 
          body: cuerpo 
        },
        android: { 
          priority: 'high', 
          data: data 
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: titulo,
                body: cuerpo
              },
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      console.log('📤 Enviando notificación:', payload);
      const response: any = await this.http.post(`${this.apiUrl}/notifications/`, payload, { headers }).toPromise();
      console.log('✅ Notificación enviada exitosamente:', response);
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }

  /**
   * Obtener estado de conexión con el backend
   */
  getStatus() {
    return {
      fcmToken: !!this.fcmToken,
      jwtToken: !!this.jwtToken,
      conectado: !!(this.fcmToken && this.jwtToken)
    };
  }
}