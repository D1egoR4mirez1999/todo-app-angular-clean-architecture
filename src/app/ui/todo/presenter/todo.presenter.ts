import { Inject, inject, Injectable } from '@angular/core';

import { Todo } from '../../../domain';
import {
  INTERACTOR_LOGIC_TOKEN,
  TodoInputLogic,
  TodoInteractorLogic,
  TodoOutputLogic,
} from '../model/todo.model';

@Injectable()
export class TodoPresenterLogicImpl implements TodoInputLogic {
  private view!: TodoOutputLogic;

  constructor(
    @Inject(INTERACTOR_LOGIC_TOKEN) private interactor: TodoInteractorLogic
  ) {
    this.interactor.setPresenter(this);
  }

  setView(view: TodoOutputLogic): void {
    this.view = view;
  }

  createTodo(todo: Todo): void {
    this.interactor.createTodo(todo);
  }

  processCreateResponse(todoRS: boolean): void {
    console.log(todoRS);
  }

  removeTodo(): void {
    throw new Error('Method not implemented.');
  }
}
