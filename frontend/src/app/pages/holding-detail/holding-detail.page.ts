import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-holding-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ ticker }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p style="padding: var(--spacing-5)">Holding detail for {{ ticker }} coming soon.</p>
    </ion-content>
  `,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton],
})
export class HoldingDetailPage {
  ticker = '';

  constructor(private route: ActivatedRoute) {
    this.ticker = this.route.snapshot.paramMap.get('ticker')?.toUpperCase() ?? '';
  }
}
