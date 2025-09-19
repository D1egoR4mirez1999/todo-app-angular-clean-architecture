import { Observable } from 'rxjs';
import { Todo } from '../entities/todo.entity';
import { Crud } from '../models/crud.interface';

export abstract class TodoRepository implements Crud<Todo> {
  abstract getAll(): Observable<Todo[]>;
  abstract getById(id: string): Observable<Todo | null>;
  abstract create(todo: Todo): Observable<boolean>;
  abstract update(id: string, todo: Partial<Todo>): Observable<boolean>;
  abstract delete(id: string): Observable<boolean>;
}
