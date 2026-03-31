import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p style="padding: var(--spacing-5)">Dashboard content coming soon.</p>
    </ion-content>
  `,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class DashboardPage {}
