import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-chat',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>AI Assistant</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p style="padding: var(--spacing-5)">Chat content coming soon.</p>
    </ion-content>
  `,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class ChatPage {}
