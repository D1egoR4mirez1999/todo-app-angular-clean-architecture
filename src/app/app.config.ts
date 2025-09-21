import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { TodoRepository } from './domain/repositories/todo.repository';
import { LocalStorageTodoRepository } from './infrastructure/repositories/local-storage-todo.repository';

import { INTERACTOR_LOGIC_TOKEN, PRESENTER_LOGIC_TOKEN } from './ui/todo/model/todo.model';
import { TodoPresenterLogicImpl } from './ui/todo/presenter/todo.presenter';
import { TodoInteractorLogicImpl } from './ui/todo/interactor/todo.interactor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: TodoRepository, useClass: LocalStorageTodoRepository },
    { provide: PRESENTER_LOGIC_TOKEN, useClass: TodoPresenterLogicImpl },
    { provide: INTERACTOR_LOGIC_TOKEN, useClass: TodoInteractorLogicImpl },
  ],
};
