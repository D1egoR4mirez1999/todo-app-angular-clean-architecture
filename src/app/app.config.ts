import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { TodoRepository } from './domain/repositories/todo.repository';
import { LocalStorageTodoRepository } from './infrastructure/repositories/local-storage-todo.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: TodoRepository, useClass: LocalStorageTodoRepository },
  ],
};
