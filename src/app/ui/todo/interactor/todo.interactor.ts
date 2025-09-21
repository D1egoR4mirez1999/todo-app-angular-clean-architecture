import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { Todo } from '../../../domain';
import { TodoService } from '../../../application';

import { TodoInputLogic, TodoInteractorLogic } from '../model/todo.model';

@Injectable()
export class TodoInteractorLogicImpl implements TodoInteractorLogic {
  private presenter!: TodoInputLogic;

  constructor(private todoService: TodoService) {}

  setPresenter(presenter: TodoInputLogic): void {
    this.presenter = presenter;
  }

  createTodo(todo: Todo): void {
    this.todoService
      .create(todo)
      .pipe(take(1))
      .subscribe({
        next: (todoRS) => this.presenter.processCreateResponse(todoRS),
        error: (error) => console.log(error),
      });
  }
}
