import { Component, Inject, inject } from '@angular/core';

import { Todo } from '../../../domain';
import {
  PRESENTER_LOGIC_TOKEN,
  TodoInputLogic,
  TodoOutputLogic,
} from '../model/todo.model';
import { TodoPresenterLogicImpl } from '../presenter/todo.presenter';

@Component({
  selector: 'app-todo',
  imports: [],
  templateUrl: './todo.component.html',
})
export class TodoComponent extends TodoOutputLogic {
  constructor(
    @Inject(PRESENTER_LOGIC_TOKEN) private presenter: TodoInputLogic
  ) {
    super();
    this.presenter.setView(this);
  }

  createTodo(): void {
    const todo: Todo = {
      id: '1',
      title: 'Test',
      completed: false,
      createdAt: new Date(),
    };

    this.presenter.createTodo(todo);
  }
}
