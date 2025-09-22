import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoService } from './todo.service';
import { TodoUseCaseService } from '../use-cases';
import { Todo } from '../../domain';

describe('TodoService', () => {
  let service: TodoService;
  let todoUseCaseServiceSpy: jasmine.SpyObj<TodoUseCaseService>;

  // Mock data para las pruebas
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    completed: false,
    createdAt: new Date('2024-01-01'),
  };

  const mockTodos: Todo[] = [
    mockTodo,
    {
      id: '2',
      title: 'Another Todo',
      completed: true,
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    // Crear un spy object para TodoUseCaseService
    const spy = jasmine.createSpyObj('TodoUseCaseService', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [TodoService, { provide: TodoUseCaseService, useValue: spy }],
    });

    service = TestBed.inject(TodoService);
    todoUseCaseServiceSpy = TestBed.inject(
      TodoUseCaseService
    ) as jasmine.SpyObj<TodoUseCaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all todos from use case service', (done) => {
      // Arrange
      todoUseCaseServiceSpy.getAll.and.returnValue(of(mockTodos));

      // Act
      service.getAll().subscribe((todos) => {
        // Assert
        expect(todos).toEqual(mockTodos);
        expect(todos.length).toBe(2);
        expect(todoUseCaseServiceSpy.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return empty array when no todos exist', (done) => {
      // Arrange
      todoUseCaseServiceSpy.getAll.and.returnValue(of([]));

      // Act
      service.getAll().subscribe((todos) => {
        // Assert
        expect(todos).toEqual([]);
        expect(todos.length).toBe(0);
        expect(todoUseCaseServiceSpy.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error from use case service', (done) => {
      // Arrange
      const errorMessage = 'Failed to fetch todos';
      todoUseCaseServiceSpy.getAll.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.getAll().subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoUseCaseServiceSpy.getAll).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });
  });

  describe('getById', () => {
    it('should return todo by id from use case service', (done) => {
      // Arrange
      const todoId = '1';
      todoUseCaseServiceSpy.getById.and.returnValue(of(mockTodo));

      // Act
      service.getById(todoId).subscribe((todo) => {
        // Assert
        expect(todo).toEqual(mockTodo);
        expect(todoUseCaseServiceSpy.getById).toHaveBeenCalledWith(todoId);
        expect(todoUseCaseServiceSpy.getById).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return null when todo is not found', (done) => {
      // Arrange
      const todoId = 'non-existent-id';
      todoUseCaseServiceSpy.getById.and.returnValue(of(null));

      // Act
      service.getById(todoId).subscribe((todo) => {
        // Assert
        expect(todo).toBeNull();
        expect(todoUseCaseServiceSpy.getById).toHaveBeenCalledWith(todoId);
        expect(todoUseCaseServiceSpy.getById).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error when fetching todo by id', (done) => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Failed to fetch todo';
      todoUseCaseServiceSpy.getById.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.getById(todoId).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoUseCaseServiceSpy.getById).toHaveBeenCalledWith(todoId);
          done();
        },
      });
    });
  });

  describe('create', () => {
    it('should create todo successfully', (done) => {
      // Arrange
      todoUseCaseServiceSpy.create.and.returnValue(of(true));

      // Act
      service.create(mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoUseCaseServiceSpy.create).toHaveBeenCalledWith(mockTodo);
        expect(todoUseCaseServiceSpy.create).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false when creation fails', (done) => {
      // Arrange
      todoUseCaseServiceSpy.create.and.returnValue(of(false));

      // Act
      service.create(mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoUseCaseServiceSpy.create).toHaveBeenCalledWith(mockTodo);
        expect(todoUseCaseServiceSpy.create).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error during creation', (done) => {
      // Arrange
      const errorMessage = 'Failed to create todo';
      todoUseCaseServiceSpy.create.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.create(mockTodo).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoUseCaseServiceSpy.create).toHaveBeenCalledWith(mockTodo);
          done();
        },
      });
    });
  });

  describe('update', () => {
    it('should update todo successfully', (done) => {
      // Arrange
      const todoId = '1';
      const updatedTodo: Todo = {
        ...mockTodo,
        title: 'Updated Todo',
        completed: true,
      };
      todoUseCaseServiceSpy.update.and.returnValue(of(true));

      // Act
      service.update(todoId, updatedTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoUseCaseServiceSpy.update).toHaveBeenCalledWith(
          todoId,
          updatedTodo
        );
        expect(todoUseCaseServiceSpy.update).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false when update fails', (done) => {
      // Arrange
      const todoId = '1';
      todoUseCaseServiceSpy.update.and.returnValue(of(false));

      // Act
      service.update(todoId, mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoUseCaseServiceSpy.update).toHaveBeenCalledWith(
          todoId,
          mockTodo
        );
        expect(todoUseCaseServiceSpy.update).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error during update', (done) => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Failed to update todo';
      todoUseCaseServiceSpy.update.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.update(todoId, mockTodo).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoUseCaseServiceSpy.update).toHaveBeenCalledWith(
            todoId,
            mockTodo
          );
          done();
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete todo successfully', (done) => {
      // Arrange
      const todoId = '1';
      todoUseCaseServiceSpy.delete.and.returnValue(of(true));

      // Act
      service.delete(todoId).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoUseCaseServiceSpy.delete).toHaveBeenCalledWith(todoId);
        expect(todoUseCaseServiceSpy.delete).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false when deletion fails', (done) => {
      // Arrange
      const todoId = '1';
      todoUseCaseServiceSpy.delete.and.returnValue(of(false));

      // Act
      service.delete(todoId).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoUseCaseServiceSpy.delete).toHaveBeenCalledWith(todoId);
        expect(todoUseCaseServiceSpy.delete).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error during deletion', (done) => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Failed to delete todo';
      todoUseCaseServiceSpy.delete.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.delete(todoId).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoUseCaseServiceSpy.delete).toHaveBeenCalledWith(todoId);
          done();
        },
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple operations in sequence', (done) => {
      // Arrange
      todoUseCaseServiceSpy.create.and.returnValue(of(true));
      todoUseCaseServiceSpy.getById.and.returnValue(of(mockTodo));
      todoUseCaseServiceSpy.update.and.returnValue(of(true));
      todoUseCaseServiceSpy.delete.and.returnValue(of(true));

      // Act & Assert
      service.create(mockTodo).subscribe((createResult) => {
        expect(createResult).toBe(true);

        service.getById('1').subscribe((todo) => {
          expect(todo).toEqual(mockTodo);

          service.update('1', mockTodo).subscribe((updateResult) => {
            expect(updateResult).toBe(true);

            service.delete('1').subscribe((deleteResult) => {
              expect(deleteResult).toBe(true);
              done();
            });
          });
        });
      });
    });
  });
});
