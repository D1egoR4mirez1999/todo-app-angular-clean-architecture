import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: '',
  loadComponent: () => import('./ui/todo/view/todo.component').then((c) => c.TodoComponent)
}];
