import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoRepository } from '../../domain';
import { Todo } from '../../domain';
import { TodoUseCaseService } from './todo-usecase.service';

describe('TodoUseCaseService', () => {
  let service: TodoUseCaseService;
  let todoRepositorySpy: jasmine.SpyObj<TodoRepository>;

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
    // Crear un spy object para TodoRepository
    const spy = jasmine.createSpyObj('TodoRepository', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TodoUseCaseService,
        { provide: TodoRepository, useValue: spy },
      ],
    });

    service = TestBed.inject(TodoUseCaseService);
    todoRepositorySpy = TestBed.inject(
      TodoRepository
    ) as jasmine.SpyObj<TodoRepository>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all todos from repository', (done) => {
      // Arrange
      todoRepositorySpy.getAll.and.returnValue(of(mockTodos));

      // Act
      service.getAll().subscribe((todos) => {
        // Assert
        expect(todos).toEqual(mockTodos);
        expect(todos.length).toBe(2);
        expect(todoRepositorySpy.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return empty array when no todos exist', (done) => {
      // Arrange
      todoRepositorySpy.getAll.and.returnValue(of([]));

      // Act
      service.getAll().subscribe((todos) => {
        // Assert
        expect(todos).toEqual([]);
        expect(todos.length).toBe(0);
        expect(todoRepositorySpy.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error from repository', (done) => {
      // Arrange
      const errorMessage = 'Database connection failed';
      todoRepositorySpy.getAll.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.getAll().subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoRepositorySpy.getAll).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });
  });

  describe('getById', () => {
    it('should return todo by id from repository', (done) => {
      // Arrange
      const todoId = '1';
      todoRepositorySpy.getById.and.returnValue(of(mockTodo));

      // Act
      service.getById(todoId).subscribe((todo) => {
        // Assert
        expect(todo).toEqual(mockTodo);
        expect(todoRepositorySpy.getById).toHaveBeenCalledWith(todoId);
        expect(todoRepositorySpy.getById).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return null when todo is not found', (done) => {
      // Arrange
      const todoId = 'non-existent-id';
      todoRepositorySpy.getById.and.returnValue(of(null));

      // Act
      service.getById(todoId).subscribe((todo) => {
        // Assert
        expect(todo).toBeNull();
        expect(todoRepositorySpy.getById).toHaveBeenCalledWith(todoId);
        expect(todoRepositorySpy.getById).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error when fetching todo by id', (done) => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Todo not found in database';
      todoRepositorySpy.getById.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.getById(todoId).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoRepositorySpy.getById).toHaveBeenCalledWith(todoId);
          done();
        },
      });
    });

    it('should handle empty string id', (done) => {
      // Arrange
      const todoId = '';
      todoRepositorySpy.getById.and.returnValue(of(null));

      // Act
      service.getById(todoId).subscribe((todo) => {
        // Assert
        expect(todo).toBeNull();
        expect(todoRepositorySpy.getById).toHaveBeenCalledWith(todoId);
        done();
      });
    });
  });

  describe('create', () => {
    it('should create todo successfully', (done) => {
      // Arrange
      todoRepositorySpy.create.and.returnValue(of(true));

      // Act
      service.create(mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoRepositorySpy.create).toHaveBeenCalledWith(mockTodo);
        expect(todoRepositorySpy.create).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false when creation fails', (done) => {
      // Arrange
      todoRepositorySpy.create.and.returnValue(of(false));

      // Act
      service.create(mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoRepositorySpy.create).toHaveBeenCalledWith(mockTodo);
        expect(todoRepositorySpy.create).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error during creation', (done) => {
      // Arrange
      const errorMessage = 'Failed to save todo to database';
      todoRepositorySpy.create.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.create(mockTodo).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoRepositorySpy.create).toHaveBeenCalledWith(mockTodo);
          done();
        },
      });
    });

    it('should handle creation with all required fields', (done) => {
      // Arrange
      const completeTodo: Todo = {
        id: '3',
        title: 'Complete Todo',
        completed: false,
        createdAt: new Date(),
      };
      todoRepositorySpy.create.and.returnValue(of(true));

      // Act
      service.create(completeTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoRepositorySpy.create).toHaveBeenCalledWith(completeTodo);
        done();
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
      todoRepositorySpy.update.and.returnValue(of(true));

      // Act
      service.update(todoId, updatedTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoRepositorySpy.update).toHaveBeenCalledWith(
          todoId,
          updatedTodo
        );
        expect(todoRepositorySpy.update).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false when update fails', (done) => {
      // Arrange
      const todoId = '1';
      todoRepositorySpy.update.and.returnValue(of(false));

      // Act
      service.update(todoId, mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoRepositorySpy.update).toHaveBeenCalledWith(todoId, mockTodo);
        expect(todoRepositorySpy.update).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error during update', (done) => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Failed to update todo in database';
      todoRepositorySpy.update.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.update(todoId, mockTodo).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoRepositorySpy.update).toHaveBeenCalledWith(
            todoId,
            mockTodo
          );
          done();
        },
      });
    });

    it('should handle update with non-existent id', (done) => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      todoRepositorySpy.update.and.returnValue(of(false));

      // Act
      service.update(nonExistentId, mockTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoRepositorySpy.update).toHaveBeenCalledWith(
          nonExistentId,
          mockTodo
        );
        done();
      });
    });

    it('should handle partial todo update', (done) => {
      // Arrange
      const todoId = '1';
      const partialTodo: Todo = { ...mockTodo, completed: true };
      todoRepositorySpy.update.and.returnValue(of(true));

      // Act
      service.update(todoId, partialTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoRepositorySpy.update).toHaveBeenCalledWith(
          todoId,
          partialTodo
        );
        done();
      });
    });
  });

  describe('delete', () => {
    it('should delete todo successfully', (done) => {
      // Arrange
      const todoId = '1';
      todoRepositorySpy.delete.and.returnValue(of(true));

      // Act
      service.delete(todoId).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoRepositorySpy.delete).toHaveBeenCalledWith(todoId);
        expect(todoRepositorySpy.delete).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false when deletion fails', (done) => {
      // Arrange
      const todoId = '1';
      todoRepositorySpy.delete.and.returnValue(of(false));

      // Act
      service.delete(todoId).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoRepositorySpy.delete).toHaveBeenCalledWith(todoId);
        expect(todoRepositorySpy.delete).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle error during deletion', (done) => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Failed to delete todo from database';
      todoRepositorySpy.delete.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act
      service.delete(todoId).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(todoRepositorySpy.delete).toHaveBeenCalledWith(todoId);
          done();
        },
      });
    });

    it('should handle deletion with non-existent id', (done) => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      todoRepositorySpy.delete.and.returnValue(of(false));

      // Act
      service.delete(nonExistentId).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoRepositorySpy.delete).toHaveBeenCalledWith(nonExistentId);
        done();
      });
    });

    it('should handle deletion with empty string id', (done) => {
      // Arrange
      const emptyId = '';
      todoRepositorySpy.delete.and.returnValue(of(false));

      // Act
      service.delete(emptyId).subscribe((result) => {
        // Assert
        expect(result).toBe(false);
        expect(todoRepositorySpy.delete).toHaveBeenCalledWith(emptyId);
        done();
      });
    });
  });

  describe('Business logic scenarios', () => {
    it('should handle complete CRUD workflow', (done) => {
      // Arrange
      const newTodo: Todo = {
        id: '3',
        title: 'New Todo',
        completed: false,
        createdAt: new Date(),
      };

      todoRepositorySpy.create.and.returnValue(of(true));
      todoRepositorySpy.getById.and.returnValue(of(newTodo));
      todoRepositorySpy.update.and.returnValue(of(true));
      todoRepositorySpy.delete.and.returnValue(of(true));

      // Act & Assert - Create
      service.create(newTodo).subscribe((createResult) => {
        expect(createResult).toBe(true);

        // Get the created todo
        service.getById('3').subscribe((retrievedTodo) => {
          expect(retrievedTodo).toEqual(newTodo);

          // Update the todo
          const updatedTodo = { ...newTodo, completed: true };
          service.update('3', updatedTodo).subscribe((updateResult) => {
            expect(updateResult).toBe(true);

            // Delete the todo
            service.delete('3').subscribe((deleteResult) => {
              expect(deleteResult).toBe(true);

              expect(todoRepositorySpy.create).toHaveBeenCalledWith(newTodo);
              expect(todoRepositorySpy.getById).toHaveBeenCalledWith('3');
              expect(todoRepositorySpy.update).toHaveBeenCalledWith(
                '3',
                updatedTodo
              );
              expect(todoRepositorySpy.delete).toHaveBeenCalledWith('3');
              done();
            });
          });
        });
      });
    });

    it('should handle concurrent operations', (done) => {
      // Arrange
      todoRepositorySpy.getAll.and.returnValue(of(mockTodos));
      todoRepositorySpy.getById.and.returnValue(of(mockTodo));

      let completedCalls = 0;
      const expectedCalls = 2;

      const checkCompletion = () => {
        completedCalls++;
        if (completedCalls === expectedCalls) {
          expect(todoRepositorySpy.getAll).toHaveBeenCalledTimes(1);
          expect(todoRepositorySpy.getById).toHaveBeenCalledTimes(1);
          done();
        }
      };

      // Act - Execute multiple operations simultaneously
      service.getAll().subscribe((todos) => {
        expect(todos).toEqual(mockTodos);
        checkCompletion();
      });

      service.getById('1').subscribe((todo) => {
        expect(todo).toEqual(mockTodo);
        checkCompletion();
      });
    });
  });

  describe('Data validation scenarios', () => {
    it('should pass through todo with all required properties', (done) => {
      // Arrange
      const validTodo: Todo = {
        id: 'valid-id',
        title: 'Valid Todo',
        completed: false,
        createdAt: new Date('2024-01-01'),
      };
      todoRepositorySpy.create.and.returnValue(of(true));

      // Act
      service.create(validTodo).subscribe((result) => {
        // Assert
        expect(result).toBe(true);
        expect(todoRepositorySpy.create).toHaveBeenCalledWith(validTodo);

        // Verify the exact object was passed through
        const passedTodo = todoRepositorySpy.create.calls.mostRecent().args[0];
        expect(passedTodo.id).toBe(validTodo.id);
        expect(passedTodo.title).toBe(validTodo.title);
        expect(passedTodo.completed).toBe(validTodo.completed);
        expect(passedTodo.createdAt).toBe(validTodo.createdAt);
        done();
      });
    });
  });
});
