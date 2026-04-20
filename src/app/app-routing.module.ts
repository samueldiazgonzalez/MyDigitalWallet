import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { AutoLoginGuard } from './core/guards/auto-login-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
  path: 'login',
  loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
  canActivate: [AutoLoginGuard]
},
{
  path: 'register',
  loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule),
  canActivate: [AutoLoginGuard]
},
  {
  path: 'home',
  loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
  canActivate: [AuthGuard]
},
  {
    path: 'add-card',
    loadChildren: () => import('./pages/add-card/add-card.module').then(m => m.AddCardPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then(m => m.PaymentPageModule),
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}