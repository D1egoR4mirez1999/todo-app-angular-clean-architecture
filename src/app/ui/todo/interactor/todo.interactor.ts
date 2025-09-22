import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
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

  updateTodo(todoId: string, todo: Todo): void {
    this.todoService
      .update(todoId, todo)
      .pipe(take(1))
      .subscribe({
        next: (todoRS) => this.presenter.proccessUpdateTodoResponse(todoRS),
        error: (error) => console.log(error),
      });
  }

  deleteTodo(todoId: string): void {
    this.todoService
      .delete(todoId)
      .pipe(take(1))
      .subscribe({
        next: (todoRS) => this.presenter.processDeleteTodoResponse(todoRS),
        error: (error) => console.log(error),
      });
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

  getAllTodos(): void {
    this.todoService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (todoRS) => this.presenter.processGetAllResponse(todoRS),
        error: (error) => console.log(error``),
      });
  }
}
