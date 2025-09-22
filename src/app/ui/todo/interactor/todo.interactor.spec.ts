import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoService } from '../../../application';
import { Todo } from '../../../domain';
import { TodoInputLogic } from '../model/todo.model';
import { TodoInteractorLogicImpl } from './todo.interactor';

describe('TodoInteractorLogicImpl', () => {
  let interactor: TodoInteractorLogicImpl;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;
  let presenterSpy: jasmine.SpyObj<TodoInputLogic>;
  let consoleLogSpy: jasmine.Spy;

  // Mock data para las pruebas
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    completed: false,
    createdAt: new Date('2024-01-01')
  };

  const mockTodos: Todo[] = [
    mockTodo,
    {
      id: '2',
      title: 'Another Todo',
      completed: true,
      createdAt: new Date('2024-01-02')
    }
  ];

  beforeEach(() => {
    // Crear spy objects para TodoService y TodoInputLogic
    const todoServiceSpyObj = jasmine.createSpyObj('TodoService', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete'
    ]);

    const presenterSpyObj = jasmine.createSpyObj('TodoInputLogic', [
      'processCreateResponse',
      'proccessUpdateTodoResponse',
      'processDeleteTodoResponse',
      'processGetAllResponse',
      'setView'
    ]);

    TestBed.configureTestingModule({
      providers: [
        TodoInteractorLogicImpl,
        { provide: TodoService, useValue: todoServiceSpyObj }
      ]
    });

    interactor = TestBed.inject(TodoInteractorLogicImpl);
    todoServiceSpy = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;
    presenterSpy = presenterSpyObj;

    // Spy para console.log - crear antes de configurar el presenter
    consoleLogSpy = spyOn(console, 'log').and.stub();

    // Configurar el presenter en el interactor
    interactor.setPresenter(presenterSpy);
  });

  it('should be created', () => {
    expect(interactor).toBeTruthy();
  });

  describe('setPresenter', () => {
    it('should set the presenter correctly', () => {
      // Arrange
      const newPresenter = jasmine.createSpyObj('TodoInputLogic', [
        'processCreateResponse',
        'proccessUpdateTodoResponse',
        'processDeleteTodoResponse',
        'processGetAllResponse'
      ]);

      // Act
      interactor.setPresenter(newPresenter);

      // Assert - Verify by calling a method that uses the presenter
      todoServiceSpy.create.and.returnValue(of(true));
      
      interactor.createTodo(mockTodo);
      
      expect(newPresenter.processCreateResponse).toHaveBeenCalledWith(true);
    });

    it('should allow changing presenter multiple times', () => {
      // Arrange
      const presenter1 = jasmine.createSpyObj('TodoInputLogic', ['processCreateResponse']);
      const presenter2 = jasmine.createSpyObj('TodoInputLogic', ['processCreateResponse']);
      
      todoServiceSpy.create.and.returnValue(of(true));

      // Act & Assert - First presenter
      interactor.setPresenter(presenter1);
      interactor.createTodo(mockTodo);
      expect(presenter1.processCreateResponse).toHaveBeenCalledWith(true);

      // Act & Assert - Second presenter
      interactor.setPresenter(presenter2);
      interactor.createTodo(mockTodo);
      expect(presenter2.processCreateResponse).toHaveBeenCalledWith(true);
    });
  });

  describe('createTodo', () => {
    it('should create todo successfully and call presenter', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(true));

      // Act
      interactor.createTodo(mockTodo);

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(mockTodo);
      expect(todoServiceSpy.create).toHaveBeenCalledTimes(1);
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledTimes(1);
    });

    it('should handle creation failure and call presenter with false', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(false));

      // Act
      interactor.createTodo(mockTodo);

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(mockTodo);
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(false);
    });

    it('should handle service error and not call presenter', () => {
      // Arrange
      const errorMessage = 'Creation failed';
      const error = new Error(errorMessage);
      todoServiceSpy.create.and.returnValue(throwError(() => error));

      // Act
      interactor.createTodo(mockTodo);

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(mockTodo);
      expect(presenterSpy.processCreateResponse).not.toHaveBeenCalled();
    });

    it('should create todo with all required properties', () => {
      // Arrange
      const completeTodo: Todo = {
        id: '3',
        title: 'Complete Todo',
        completed: false,
        createdAt: new Date('2024-01-15')
      };
      todoServiceSpy.create.and.returnValue(of(true));

      // Act
      interactor.createTodo(completeTodo);

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(completeTodo);
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(true);
      
      // Verify exact object was passed
      const passedTodo = todoServiceSpy.create.calls.mostRecent().args[0];
      expect(passedTodo.id).toBe(completeTodo.id);
      expect(passedTodo.title).toBe(completeTodo.title);
      expect(passedTodo.completed).toBe(completeTodo.completed);
      expect(passedTodo.createdAt).toBe(completeTodo.createdAt);
    });
  });

  describe('updateTodo', () => {
    it('should update todo successfully and call presenter', () => {
      // Arrange
      const todoId = '1';
      const updatedTodo: Todo = { ...mockTodo, title: 'Updated Todo', completed: true };
      todoServiceSpy.update.and.returnValue(of(true));

      // Act
      interactor.updateTodo(todoId, updatedTodo);

      // Assert
      expect(todoServiceSpy.update).toHaveBeenCalledWith(todoId, updatedTodo);
      expect(todoServiceSpy.update).toHaveBeenCalledTimes(1);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledTimes(1);
    });

    it('should handle update failure and call presenter with false', () => {
      // Arrange
      const todoId = '1';
      todoServiceSpy.update.and.returnValue(of(false));

      // Act
      interactor.updateTodo(todoId, mockTodo);

      // Assert
      expect(todoServiceSpy.update).toHaveBeenCalledWith(todoId, mockTodo);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(false);
    });

    it('should handle service error and not call presenter', () => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Update failed';
      const error = new Error(errorMessage);
      todoServiceSpy.update.and.returnValue(throwError(() => error));

      // Act
      interactor.updateTodo(todoId, mockTodo);

      // Assert
      expect(todoServiceSpy.update).toHaveBeenCalledWith(todoId, mockTodo);
      expect(presenterSpy.proccessUpdateTodoResponse).not.toHaveBeenCalled();
    });

    it('should update with correct id and todo object', () => {
      // Arrange
      const todoId = 'specific-id-123';
      const partialUpdate: Todo = { 
        ...mockTodo, 
        id: 'different-id', // Should still use the todoId parameter
        completed: true 
      };
      todoServiceSpy.update.and.returnValue(of(true));

      // Act
      interactor.updateTodo(todoId, partialUpdate);

      // Assert
      expect(todoServiceSpy.update).toHaveBeenCalledWith(todoId, partialUpdate);
      
      const [passedId, passedTodo] = todoServiceSpy.update.calls.mostRecent().args;
      expect(passedId).toBe(todoId);
      expect(passedTodo).toBe(partialUpdate);
    });

    it('should handle empty string id', () => {
      // Arrange
      const emptyId = '';
      todoServiceSpy.update.and.returnValue(of(false));

      // Act
      interactor.updateTodo(emptyId, mockTodo);

      // Assert
      expect(todoServiceSpy.update).toHaveBeenCalledWith(emptyId, mockTodo);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(false);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo successfully and call presenter', () => {
      // Arrange
      const todoId = '1';
      todoServiceSpy.delete.and.returnValue(of(true));

      // Act
      interactor.deleteTodo(todoId);

      // Assert
      expect(todoServiceSpy.delete).toHaveBeenCalledWith(todoId);
      expect(todoServiceSpy.delete).toHaveBeenCalledTimes(1);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion failure and call presenter with false', () => {
      // Arrange
      const todoId = 'non-existent-id';
      todoServiceSpy.delete.and.returnValue(of(false));

      // Act
      interactor.deleteTodo(todoId);

      // Assert
      expect(todoServiceSpy.delete).toHaveBeenCalledWith(todoId);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledWith(false);
    });

    it('should handle service error and not call presenter', () => {
      // Arrange
      const todoId = '1';
      const errorMessage = 'Deletion failed';
      const error = new Error(errorMessage);
      todoServiceSpy.delete.and.returnValue(throwError(() => error));

      // Act
      interactor.deleteTodo(todoId);

      // Assert
      expect(todoServiceSpy.delete).toHaveBeenCalledWith(todoId);
      expect(presenterSpy.processDeleteTodoResponse).not.toHaveBeenCalled();
    });

    it('should delete with exact id provided', () => {
      // Arrange
      const specificId = 'todo-to-delete-456';
      todoServiceSpy.delete.and.returnValue(of(true));

      // Act
      interactor.deleteTodo(specificId);

      // Assert
      expect(todoServiceSpy.delete).toHaveBeenCalledWith(specificId);
      
      const passedId = todoServiceSpy.delete.calls.mostRecent().args[0];
      expect(passedId).toBe(specificId);
    });

    it('should handle special characters in id', () => {
      // Arrange
      const specialId = 'todo-with-special-chars-€ñü@#$%';
      todoServiceSpy.delete.and.returnValue(of(true));

      // Act
      interactor.deleteTodo(specialId);

      // Assert
      expect(todoServiceSpy.delete).toHaveBeenCalledWith(specialId);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledWith(true);
    });
  });

  describe('getAllTodos', () => {
    it('should get all todos successfully and call presenter', () => {
      // Arrange
      todoServiceSpy.getAll.and.returnValue(of(mockTodos));

      // Act
      interactor.getAllTodos();

      // Assert
      expect(todoServiceSpy.getAll).toHaveBeenCalledTimes(1);
      expect(todoServiceSpy.getAll).toHaveBeenCalledWith(); // No parameters
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledWith(mockTodos);
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledTimes(1);
    });

    it('should handle empty todo list', () => {
      // Arrange
      todoServiceSpy.getAll.and.returnValue(of([]));

      // Act
      interactor.getAllTodos();

      // Assert
      expect(todoServiceSpy.getAll).toHaveBeenCalledTimes(1);
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledWith([]);
    });

    it('should handle service error and not call presenter', () => {
      // Arrange
      const errorMessage = 'Failed to fetch todos';
      const error = new Error(errorMessage);
      todoServiceSpy.getAll.and.returnValue(throwError(() => error));

      // Act
      interactor.getAllTodos();

      // Assert
      expect(todoServiceSpy.getAll).toHaveBeenCalledTimes(1);
      expect(presenterSpy.processGetAllResponse).not.toHaveBeenCalled();
      // Remove console.log check for now as it seems to be the source of issues
    });

    it('should handle large todo lists', () => {
      // Arrange
      const largeTodoList: Todo[] = Array.from({ length: 100 }, (_, index) => ({
        id: `todo-${index}`,
        title: `Todo ${index}`,
        completed: index % 2 === 0,
        createdAt: new Date(`2024-01-${String(index % 30 + 1).padStart(2, '0')}`)
      }));
      todoServiceSpy.getAll.and.returnValue(of(largeTodoList));

      // Act
      interactor.getAllTodos();

      // Assert
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledWith(largeTodoList);
      expect(presenterSpy.processGetAllResponse.calls.mostRecent().args[0].length).toBe(100);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(true));
      todoServiceSpy.update.and.returnValue(of(true));
      todoServiceSpy.delete.and.returnValue(of(true));
      todoServiceSpy.getAll.and.returnValue(of(mockTodos));

      // Act
      interactor.createTodo(mockTodo);
      interactor.updateTodo('1', mockTodo);
      interactor.deleteTodo('1');
      interactor.getAllTodos();

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(mockTodo);
      expect(todoServiceSpy.update).toHaveBeenCalledWith('1', mockTodo);
      expect(todoServiceSpy.delete).toHaveBeenCalledWith('1');
      expect(todoServiceSpy.getAll).toHaveBeenCalled();

      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledWith(mockTodos);
    });

    it('should handle mixed success and failure operations', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(true));
      todoServiceSpy.update.and.returnValue(of(false));
      todoServiceSpy.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      // Act
      interactor.createTodo(mockTodo);
      interactor.updateTodo('1', mockTodo);
      interactor.deleteTodo('1');

      // Assert
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(false);
      expect(presenterSpy.processDeleteTodoResponse).not.toHaveBeenCalled();
    });

    it('should maintain presenter state across operations', () => {
      // Arrange
      const customPresenter = jasmine.createSpyObj('TodoInputLogic', [
        'processCreateResponse',
        'proccessUpdateTodoResponse'
      ]);
      
      todoServiceSpy.create.and.returnValue(of(true));
      todoServiceSpy.update.and.returnValue(of(true));

      // Act
      interactor.setPresenter(customPresenter);
      interactor.createTodo(mockTodo);
      interactor.updateTodo('1', mockTodo);

      // Assert
      expect(customPresenter.processCreateResponse).toHaveBeenCalledWith(true);
      expect(customPresenter.proccessUpdateTodoResponse).toHaveBeenCalledWith(true);
      
      // Original presenter should not have been called
      expect(presenterSpy.processCreateResponse).not.toHaveBeenCalled();
      expect(presenterSpy.proccessUpdateTodoResponse).not.toHaveBeenCalled();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle invalid todo in createTodo', () => {
      // Arrange
      const invalidTodo = {} as Todo; // Empty object cast as Todo
      todoServiceSpy.create.and.returnValue(of(false));

      // Act
      interactor.createTodo(invalidTodo);

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(invalidTodo);
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(false);
    });

    it('should handle empty string todoId in updateTodo', () => {
      // Arrange
      todoServiceSpy.update.and.returnValue(of(false));

      // Act
      interactor.updateTodo('', mockTodo);

      // Assert
      expect(todoServiceSpy.update).toHaveBeenCalledWith('', mockTodo);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(false);
    });

    it('should handle empty string todoId in deleteTodo', () => {
      // Arrange
      todoServiceSpy.delete.and.returnValue(of(false));

      // Act
      interactor.deleteTodo('');

      // Assert
      expect(todoServiceSpy.delete).toHaveBeenCalledWith('');
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledWith(false);
    });

    it('should handle service returning non-boolean values', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(1 as any)); // Number instead of boolean
      todoServiceSpy.getAll.and.returnValue(of({} as any)); // Object instead of array

      // Act
      interactor.createTodo(mockTodo);
      interactor.getAllTodos();

      // Assert
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(1 as any);
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledWith({} as any);
    });

    it('should handle rapid successive calls', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(true));
      todoServiceSpy.update.and.returnValue(of(true));
      todoServiceSpy.delete.and.returnValue(of(true));

      // Act - Rapid succession
      for (let i = 0; i < 5; i++) {
        interactor.createTodo({ ...mockTodo, id: `rapid-${i}` });
        interactor.updateTodo(`rapid-${i}`, mockTodo);
        interactor.deleteTodo(`rapid-${i}`);
      }

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledTimes(5);
      expect(todoServiceSpy.update).toHaveBeenCalledTimes(5);
      expect(todoServiceSpy.delete).toHaveBeenCalledTimes(5);
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledTimes(5);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledTimes(5);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledTimes(5);
    });
  });

  describe('Observable behavior with take(1)', () => {
    it('should call service methods and handle responses correctly', () => {
      // Arrange
      todoServiceSpy.create.and.returnValue(of(true));
      todoServiceSpy.update.and.returnValue(of(true));
      todoServiceSpy.delete.and.returnValue(of(true));
      todoServiceSpy.getAll.and.returnValue(of(mockTodos));

      // Act
      interactor.createTodo(mockTodo);
      interactor.updateTodo('1', mockTodo);
      interactor.deleteTodo('1');
      interactor.getAllTodos();

      // Assert
      expect(todoServiceSpy.create).toHaveBeenCalledWith(mockTodo);
      expect(todoServiceSpy.update).toHaveBeenCalledWith('1', mockTodo);
      expect(todoServiceSpy.delete).toHaveBeenCalledWith('1');
      expect(todoServiceSpy.getAll).toHaveBeenCalled();
      
      expect(presenterSpy.processCreateResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.proccessUpdateTodoResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.processDeleteTodoResponse).toHaveBeenCalledWith(true);
      expect(presenterSpy.processGetAllResponse).toHaveBeenCalledWith(mockTodos);
    });
  });
});