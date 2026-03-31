import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.routes').then((m) => m.tabsRoutes),
  },
  {
    path: 'holding/:ticker',
    loadComponent: () =>
      import('./pages/holding-detail/holding-detail.page').then(
        (m) => m.HoldingDetailPage
      ),
  },
];
