import { Component, signal } from '@angular/core';
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
      @if (prefillPrompt()) {
        <p class="prefill-debug" style="padding: var(--spacing-5); color: var(--ion-color-medium)">
          Pre-filled: {{ prefillPrompt() }}
        </p>
      }
    </ion-content>
  `,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class ChatPage {
  readonly prefillPrompt = signal<string | null>(null);

  constructor() {
    const state = history.state;
    if (state?.prefillPrompt) {
      this.prefillPrompt.set(state.prefillPrompt);
    }
  }
}
