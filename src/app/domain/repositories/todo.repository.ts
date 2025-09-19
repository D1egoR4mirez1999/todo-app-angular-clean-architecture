import { Observable } from 'rxjs';
import { Crud, Todo } from '..';

export abstract class TodoRepository implements Crud<Todo> {
  abstract getAll(): Observable<Todo[]>;
  abstract getById(id: string): Observable<Todo | null>;
  abstract create(todo: Todo): Observable<boolean>;
  abstract update(id: string, todo: Partial<Todo>): Observable<boolean>;
  abstract delete(id: string): Observable<boolean>;
}
