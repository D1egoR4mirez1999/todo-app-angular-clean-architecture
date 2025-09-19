import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Todo } from '../entities/todo.entity';
import { TodoRepository } from '../repositories/todo.repository';

@Injectable()
export class TodoUseCaseService {
  constructor(private todoRepository: TodoRepository) {}

  getAll(): Observable<Todo[]> {
    return this.todoRepository.getAll();
  }

  getById(todoId: string): Observable<Todo | null> {
    return this.todoRepository.getById(todoId);
  }

  create(todo: Todo): Observable<boolean> {
    return this.todoRepository.create(todo);
  }

  update(todoId: string, todo: Todo): Observable<boolean> {
    return this.todoRepository.update(todoId, todo);
  }

  delete(todoId: string): Observable<boolean> {
    return this.todoRepository.delete(todoId);
  }
}
