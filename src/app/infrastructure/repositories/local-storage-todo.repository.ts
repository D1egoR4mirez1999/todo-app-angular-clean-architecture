// src/app/infrastructure/repositories/local-storage-todo.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoRepository } from '../../domain/repositories/todo.repository';

@Injectable()
export class LocalStorageTodoRepository extends TodoRepository {
  private readonly STORAGE_KEY = 'todos';
  private todosSubject = new BehaviorSubject<Todo[]>(this.loadFromStorage());

  getAll(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  getById(id: string): Observable<Todo | null> {
    const todos = this.todosSubject.value;
    const todo = todos.find((t) => t.id === id) || null;
    return of(todo);
  }

  create(todo: Todo): Observable<boolean> {
    const todos = this.todosSubject.value;
    const newTodos = [...todos, todo];
    this.saveToStorage(newTodos);
    this.todosSubject.next(newTodos);
    return of(!!todo);
  }

  update(id: string, updates: Partial<Todo>): Observable<boolean> {
    const todos = this.todosSubject.value;
    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return throwError(() => new Error('Todo not found'));
    }

    const updatedTodo = { ...todos[index], ...updates };
    const newTodos = [...todos];
    newTodos[index] = updatedTodo;

    this.saveToStorage(newTodos);
    this.todosSubject.next(newTodos);
    return of(!!updatedTodo);
  }

  delete(id: string): Observable<boolean> {
    const todos = this.todosSubject.value;
    const newTodos = todos.filter((t) => t.id !== id);
    this.saveToStorage(newTodos);
    this.todosSubject.next(newTodos);
    return of(Boolean(void 0));
  }

  private loadFromStorage(): Todo[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(todos: Todo[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}
