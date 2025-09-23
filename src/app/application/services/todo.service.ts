import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo, TodoRepository } from '../../domain';
import { TodoUseCase } from '../use-cases';

@Injectable({
  providedIn: 'root',
})
export class TodoService implements TodoRepository {
  constructor(private todoUseCase: TodoUseCase) {}

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
