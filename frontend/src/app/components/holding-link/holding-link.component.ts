import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { IonChip, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-holding-link',
  template: `
    <ion-chip class="holding-chip" (click)="navigate()">
      <ion-label>{{ ticker() }}</ion-label>
    </ion-chip>
  `,
  styles: [`
    .holding-chip {
      --background: var(--app-surface-low);
      --color: var(--ion-color-primary);
      font-weight: 600;
      font-size: 0.75rem;
      letter-spacing: 0.05rem;
      text-transform: uppercase;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      margin: 0 2px;
      vertical-align: baseline;
    }
  `],
  imports: [IonChip, IonLabel],
})
export class HoldingLinkComponent {
  readonly ticker = input.required<string>();

  private readonly router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  navigate(): void {
    this.router.navigate(['/holding', this.ticker()]);
  }
}
