import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Interactor, Presenter, Todo } from '../../../domain';
import { FormControl } from '@angular/forms';

export abstract class TodoOutputLogic {
  todos: Todo[] = [];
  titleControl!: FormControl<string | null>;
  get titleError(): string | null {
    if (this.titleControl.errors?.['required']) {
      return 'El título es requerido';
    }
    if (this.titleControl.errors?.['minlength']) {
      return 'El título debe tener al menos 1 carácter';
    }
    if (this.titleControl.errors?.['maxlength']) {
      return 'El título no puede exceder 100 caracteres';
    }
    return null;
  }
}

export interface TodoInputLogic extends Presenter<TodoOutputLogic> {
  createTodo(todo: Todo): void;
  processCreateResponse(todoRS: boolean): void;
  getAllTodos(): void;
  processGetAllResponse(todos: Todo[]): void;
  deleteTodo(todoId: string): void;
  processDeleteTodoResponse(todoRS: boolean): void;
  updateTodo(todoId: string, todo: Todo): void;
  proccessUpdateTodoResponse(todoRS: boolean): void;
}

export interface TodoInteractorLogic extends Interactor<TodoInputLogic> {
  createTodo(todos: Todo): void;
  getAllTodos(): void;
  deleteTodo(todoId: string): void;
  updateTodo(todoId: string, todo: Todo): void;
}

export const PRESENTER_LOGIC_TOKEN = new InjectionToken<TodoInputLogic>(
  'TodoPresenterLogicImpl'
);
export const INTERACTOR_LOGIC_TOKEN = new InjectionToken<TodoInteractorLogic>(
  'TodoInteractorLogicImpl'
);
