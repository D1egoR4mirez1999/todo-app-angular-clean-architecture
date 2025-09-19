import { Observable } from 'rxjs';

export interface Crud<TEntity> {
  getAll(): Observable<TEntity[]>;
  getById(...args: any[]): Observable<TEntity | null>;
  create(payload: TEntity): Observable<boolean>;
  update(...args: any[]): Observable<boolean>;
  delete(...args: any[]): Observable<boolean>;
}
