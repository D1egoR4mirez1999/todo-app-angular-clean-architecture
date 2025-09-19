import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TodoUseCaseService } from '../../domain/use-cases/todo-usecase.service';
import { Todo } from '../../domain/entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(private todoUseCase: TodoUseCaseService) {}

  getAll(): Observable<Todo[]> {
    return this.todoUseCase.getAll();
  }

  getById(todoId: string): Observable<Todo | null> {
    return this.todoUseCase.getById(todoId);
  }

  create(todo: Todo): Observable<boolean> {
    return this.todoUseCase.create(todo);
  }

  update(todoId: string, todo: Todo): Observable<boolean> {
    return this.todoUseCase.update(todoId, todo);
  }

  delete(todoId: string): Observable<boolean> {
    return this.todoUseCase.delete(todoId);
  }
}
