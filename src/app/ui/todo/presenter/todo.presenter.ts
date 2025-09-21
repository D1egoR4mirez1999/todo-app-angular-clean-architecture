import { inject, Injectable } from '@angular/core';

import { Todo } from '../../../domain';
import { TodoInteractorLogicImpl } from '../interactor/todo.interactor';
import {
  TodoInputLogic,
  TodoInteractorLogic,
  TodoOutputLogic,
} from '../model/todo.model';

@Injectable()
export class TodoPresenterLogicImpl implements TodoInputLogic {
  private view!: TodoOutputLogic;
  private todoInteractor: TodoInteractorLogic = inject(TodoInteractorLogicImpl);

  setView(view: TodoOutputLogic): void {
    this.view = view;
  }

  createTodo(todo: Todo): void {
    this.todoInteractor.createTodo(todo);
  }

  processCreateResponse(todoRS: boolean): void {
    console.log(todoRS);
  }

  removeTodo(): void {
    throw new Error('Method not implemented.');
  }
}
