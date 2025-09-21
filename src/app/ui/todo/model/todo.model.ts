import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Interactor, Presenter, Todo } from '../../../domain';
import { FormControl } from '@angular/forms';

export abstract class TodoOutputLogic {
  todos: Todo[] = [];
  titleControl!: FormControl<string | null>;
}

export interface TodoInputLogic extends Presenter<TodoOutputLogic> {
  createTodo(todo: Todo): void;
  processCreateResponse(todoRS: boolean): void;
  getAllTodos(): void;
  processGetAllResponse(todos: Todo[]): void;
  removeTodo(): void;
}

export interface TodoInteractorLogic extends Interactor<TodoInputLogic> {
  createTodo(todos: Todo): void;
  getAllTodos(): void;
}

export const PRESENTER_LOGIC_TOKEN = new InjectionToken<TodoInputLogic>(
  'TodoPresenterLogicImpl'
);
export const INTERACTOR_LOGIC_TOKEN = new InjectionToken<TodoInteractorLogic>(
  'TodoInteractorLogicImpl'
);
