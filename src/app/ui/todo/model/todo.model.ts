import { InjectionToken } from '@angular/core';
import { Interactor, Presenter, Todo } from '../../../domain';

export abstract class TodoOutputLogic {
  todo: Todo[] = [];
}

export interface TodoInputLogic extends Presenter<TodoOutputLogic> {
  createTodo(todo: Todo): void;
  processCreateResponse(todoRS: boolean): void;
  removeTodo(): void;
}

export interface TodoInteractorLogic extends Interactor<TodoInputLogic> {
  createTodo(todo: Todo): void;
}

export const PRESENTER_LOGIC_TOKEN = new InjectionToken<TodoInputLogic>(
  'TodoPresenterLogicImpl'
);
export const INTERACTOR_LOGIC_TOKEN = new InjectionToken<TodoInteractorLogic>(
  'TodoInteractorLogicImpl'
);
