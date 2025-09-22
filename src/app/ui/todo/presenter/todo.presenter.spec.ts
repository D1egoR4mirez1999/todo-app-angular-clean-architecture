import { TestBed } from '@angular/core/testing';
import { Todo } from '../../../domain';
import {
  INTERACTOR_LOGIC_TOKEN,
  TodoInteractorLogic,
  TodoOutputLogic,
} from '../model/todo.model';
import { TodoPresenterLogicImpl } from './todo.presenter';

describe('TodoPresenterLogicImpl', () => {
  let presenter: TodoPresenterLogicImpl;
  let interactorSpy: jasmine.SpyObj<TodoInteractorLogic>;
  let viewSpy: jasmine.SpyObj<TodoOutputLogic>;

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
    // Crear spy objects para TodoInteractorLogic y TodoOutputLogic
    const interactorSpyObj = jasmine.createSpyObj('TodoInteractorLogic', [
      'setPresenter',
      'createTodo',
      'updateTodo',
      'deleteTodo',
      'getAllTodos',
    ]);

    // Crear un objeto spy más simple para TodoOutputLogic
    viewSpy = {
      todos: [],
    } as any;

    TestBed.configureTestingModule({
      providers: [
        TodoPresenterLogicImpl,
        { provide: INTERACTOR_LOGIC_TOKEN, useValue: interactorSpyObj },
      ],
    });

    presenter = TestBed.inject(TodoPresenterLogicImpl);
    interactorSpy = TestBed.inject(
      INTERACTOR_LOGIC_TOKEN
    ) as jasmine.SpyObj<TodoInteractorLogic>;

    // Configurar la view en el presenter
    presenter.setView(viewSpy);
  });

  it('should be created', () => {
    expect(presenter).toBeTruthy();
  });

  it('should set presenter on interactor during construction', () => {
    expect(interactorSpy.setPresenter).toHaveBeenCalledWith(presenter);
  });

  describe('setView', () => {
    it('should set the view correctly', () => {
      // Arrange
      const newView = { todos: [] } as any;

      // Act
      presenter.setView(newView);

      // Assert - Verificar indirectamente que la view se estableció
      presenter.processGetAllResponse(mockTodos);
      expect(newView.todos).toEqual(mockTodos);
    });

    it('should allow changing view multiple times', () => {
      // Arrange
      const view1 = { todos: [] } as any;
      const view2 = { todos: [] } as any;

      // Act & Assert - Primera view
      presenter.setView(view1);
      presenter.processGetAllResponse([mockTodo]);
      expect(view1.todos).toEqual([mockTodo]);

      // Act & Assert - Segunda view
      presenter.setView(view2);
      presenter.processGetAllResponse(mockTodos);
      expect(view2.todos).toEqual(mockTodos);
    });
  });

  describe('createTodo', () => {
    it('should delegate to interactor', () => {
      // Act
      presenter.createTodo(mockTodo);

      // Assert
      expect(interactorSpy.createTodo).toHaveBeenCalledWith(mockTodo);
      expect(interactorSpy.createTodo).toHaveBeenCalledTimes(1);
    });

    it('should create todo with all properties', () => {
      // Arrange
      const completeTodo: Todo = {
        id: '3',
        title: 'Complete Todo',
        completed: false,
        createdAt: new Date('2024-01-15'),
      };

      // Act
      presenter.createTodo(completeTodo);

      // Assert
      expect(interactorSpy.createTodo).toHaveBeenCalledWith(completeTodo);

      // Verify exact object was passed
      const passedTodo = interactorSpy.createTodo.calls.mostRecent().args[0];
      expect(passedTodo.id).toBe(completeTodo.id);
      expect(passedTodo.title).toBe(completeTodo.title);
      expect(passedTodo.completed).toBe(completeTodo.completed);
      expect(passedTodo.createdAt).toBe(completeTodo.createdAt);
    });

    it('should handle empty todo object', () => {
      // Arrange
      const emptyTodo = {} as Todo;

      // Act
      presenter.createTodo(emptyTodo);

      // Assert
      expect(interactorSpy.createTodo).toHaveBeenCalledWith(emptyTodo);
    });
  });

  describe('processCreateResponse', () => {
    it('should call getAllTodos when response is true', () => {
      // Act
      presenter.processCreateResponse(true);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('should not call getAllTodos when response is false', () => {
      // Act
      presenter.processCreateResponse(false);

      // Assert
      expect(interactorSpy.getAllTodos).not.toHaveBeenCalled();
    });

    it('should handle multiple successful responses', () => {
      // Act
      presenter.processCreateResponse(true);
      presenter.processCreateResponse(true);
      presenter.processCreateResponse(true);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure responses', () => {
      // Act
      presenter.processCreateResponse(true);
      presenter.processCreateResponse(false);
      presenter.processCreateResponse(true);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateTodo', () => {
    it('should delegate to interactor with correct parameters', () => {
      // Arrange
      const todoId = '1';
      const updatedTodo: Todo = {
        ...mockTodo,
        title: 'Updated Todo',
        completed: true,
      };

      // Act
      presenter.updateTodo(todoId, updatedTodo);

      // Assert
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith(
        todoId,
        updatedTodo
      );
      expect(interactorSpy.updateTodo).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string id', () => {
      // Arrange
      const emptyId = '';

      // Act
      presenter.updateTodo(emptyId, mockTodo);

      // Assert
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith(emptyId, mockTodo);
    });

    it('should handle partial todo updates', () => {
      // Arrange
      const todoId = '1';
      const partialTodo: Todo = { ...mockTodo, completed: true };

      // Act
      presenter.updateTodo(todoId, partialTodo);

      // Assert
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith(
        todoId,
        partialTodo
      );

      const [passedId, passedTodo] =
        interactorSpy.updateTodo.calls.mostRecent().args;
      expect(passedId).toBe(todoId);
      expect(passedTodo.completed).toBe(true);
    });

    it('should handle special characters in id', () => {
      // Arrange
      const specialId = 'todo-with-special-chars-€ñü@#$%';

      // Act
      presenter.updateTodo(specialId, mockTodo);

      // Assert
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith(
        specialId,
        mockTodo
      );
    });
  });

  describe('proccessUpdateTodoResponse', () => {
    it('should call getAllTodos when response is true', () => {
      // Act
      presenter.proccessUpdateTodoResponse(true);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('should not call getAllTodos when response is false', () => {
      // Act
      presenter.proccessUpdateTodoResponse(false);

      // Assert
      expect(interactorSpy.getAllTodos).not.toHaveBeenCalled();
    });

    it('should handle multiple update responses', () => {
      // Act
      presenter.proccessUpdateTodoResponse(true);
      presenter.proccessUpdateTodoResponse(false);
      presenter.proccessUpdateTodoResponse(true);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteTodo', () => {
    it('should delegate to interactor with correct id', () => {
      // Arrange
      const todoId = '1';

      // Act
      presenter.deleteTodo(todoId);

      // Assert
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith(todoId);
      expect(interactorSpy.deleteTodo).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string id', () => {
      // Arrange
      const emptyId = '';

      // Act
      presenter.deleteTodo(emptyId);

      // Assert
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith(emptyId);
    });

    it('should handle special characters in id', () => {
      // Arrange
      const specialId = 'todo-delete-€ñü@#$%';

      // Act
      presenter.deleteTodo(specialId);

      // Assert
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith(specialId);
    });

    it('should handle multiple delete operations', () => {
      // Act
      presenter.deleteTodo('1');
      presenter.deleteTodo('2');
      presenter.deleteTodo('3');

      // Assert
      expect(interactorSpy.deleteTodo).toHaveBeenCalledTimes(3);
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith('1');
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith('2');
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith('3');
    });
  });

  describe('processDeleteTodoResponse', () => {
    it('should call getAllTodos when response is true', () => {
      // Act
      presenter.processDeleteTodoResponse(true);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('should not call getAllTodos when response is false', () => {
      // Act
      presenter.processDeleteTodoResponse(false);

      // Assert
      expect(interactorSpy.getAllTodos).not.toHaveBeenCalled();
    });

    it('should handle multiple delete responses', () => {
      // Act
      presenter.processDeleteTodoResponse(true);
      presenter.processDeleteTodoResponse(true);
      presenter.processDeleteTodoResponse(false);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllTodos', () => {
    it('should delegate to interactor', () => {
      // Act
      presenter.getAllTodos();

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(1);
      expect(interactorSpy.getAllTodos).toHaveBeenCalledWith();
    });

    it('should handle multiple calls', () => {
      // Act
      presenter.getAllTodos();
      presenter.getAllTodos();
      presenter.getAllTodos();

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(3);
    });
  });

  describe('processGetAllResponse', () => {
    it('should update view todos with received data', () => {
      // Act
      presenter.processGetAllResponse(mockTodos);

      // Assert
      expect(viewSpy.todos).toEqual(mockTodos);
    });

    it('should handle empty todos array', () => {
      // Act
      presenter.processGetAllResponse([]);

      // Assert
      expect(viewSpy.todos).toEqual([]);
    });

    it('should handle single todo', () => {
      // Arrange
      const singleTodo = [mockTodo];

      // Act
      presenter.processGetAllResponse(singleTodo);

      // Assert
      expect(viewSpy.todos).toEqual(singleTodo);
      expect(viewSpy.todos.length).toBe(1);
    });

    it('should handle large todo lists', () => {
      // Arrange
      const largeTodoList: Todo[] = Array.from({ length: 5 }, (_, index) => ({
        id: `todo-${index}`,
        title: `Todo ${index}`,
        completed: index % 2 === 0,
        createdAt: new Date('2024-01-01'),
      }));

      // Act
      presenter.processGetAllResponse(largeTodoList);

      // Assert
      expect(viewSpy.todos).toEqual(largeTodoList);
      expect(viewSpy.todos.length).toBe(5);
    });

    it('should overwrite previous todos data', () => {
      // Arrange - Set initial data
      presenter.processGetAllResponse([mockTodo]);
      expect(viewSpy.todos).toEqual([mockTodo]);

      // Act - Set new data
      presenter.processGetAllResponse(mockTodos);

      // Assert
      expect(viewSpy.todos).toEqual(mockTodos);
      expect(viewSpy.todos.length).toBe(2);
    });

    it('should maintain todo object properties', () => {
      // Arrange
      const todoWithSpecialProps: Todo = {
        id: 'special-123',
        title: 'Todo with special chars: éñü',
        completed: true,
        createdAt: new Date('2024-01-01'),
      };

      // Act
      presenter.processGetAllResponse([todoWithSpecialProps]);

      // Assert
      expect(viewSpy.todos[0]).toEqual(todoWithSpecialProps);
      expect(viewSpy.todos[0].title).toContain('éñü');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete CRUD workflow', () => {
      // Arrange
      const newTodo: Todo = {
        id: '3',
        title: 'Integration Test Todo',
        completed: false,
        createdAt: new Date(),
      };

      // Act - Create
      presenter.createTodo(newTodo);
      presenter.processCreateResponse(true);

      // Act - Update
      presenter.updateTodo('3', { ...newTodo, completed: true });
      presenter.proccessUpdateTodoResponse(true);

      // Act - Delete
      presenter.deleteTodo('3');
      presenter.processDeleteTodoResponse(true);

      // Act - Get All
      presenter.getAllTodos();
      presenter.processGetAllResponse(mockTodos);

      // Assert
      expect(interactorSpy.createTodo).toHaveBeenCalledWith(newTodo);
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith(
        '3',
        jasmine.objectContaining({
          id: '3',
          completed: true,
        })
      );
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith('3');
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(4); // 3 from responses + 1 direct call
      expect(viewSpy.todos).toEqual(mockTodos);
    });

    it('should handle mixed success and failure responses', () => {
      // Act
      presenter.processCreateResponse(true);
      presenter.processCreateResponse(false);
      presenter.proccessUpdateTodoResponse(true);
      presenter.proccessUpdateTodoResponse(false);
      presenter.processDeleteTodoResponse(true);
      presenter.processDeleteTodoResponse(false);

      // Assert
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(3); // Only successful responses
    });

    it('should maintain state between operations', () => {
      // Arrange - Set initial state
      presenter.processGetAllResponse([mockTodo]);
      expect(viewSpy.todos).toEqual([mockTodo]);

      // Act - Perform operations
      presenter.createTodo(mockTodos[1]);
      presenter.updateTodo('1', mockTodo);
      presenter.deleteTodo('2');

      // Act - Update state
      presenter.processGetAllResponse(mockTodos);

      // Assert
      expect(viewSpy.todos).toEqual(mockTodos);
      expect(interactorSpy.createTodo).toHaveBeenCalledWith(mockTodos[1]);
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith('1', mockTodo);
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith('2');
    });

    it('should handle rapid successive operations', () => {
      // Act - Rapid operations
      for (let i = 0; i < 5; i++) {
        presenter.createTodo({ ...mockTodo, id: `rapid-${i}` });
        presenter.processCreateResponse(i % 2 === 0); // Alternate success/failure
      }

      // Assert
      expect(interactorSpy.createTodo).toHaveBeenCalledTimes(5);
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(3); // Only successful responses (0, 2, 4)
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle falsy responses', () => {
      // Act & Assert - These should not trigger getAllTodos
      presenter.processCreateResponse(false);
      presenter.proccessUpdateTodoResponse(false);
      presenter.processDeleteTodoResponse(false);

      expect(interactorSpy.getAllTodos).not.toHaveBeenCalled();
    });

    it('should handle truthy responses', () => {
      // Act
      presenter.processCreateResponse(true);
      presenter.proccessUpdateTodoResponse(true);
      presenter.processDeleteTodoResponse(true);

      // Assert - Truthy values should trigger getAllTodos
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(3);
    });

    it('should handle null/undefined in processGetAllResponse', () => {
      // Act & Assert - Should not throw errors
      presenter.processGetAllResponse(null as any);
      expect(viewSpy.todos).toBeNull();

      presenter.processGetAllResponse(undefined as any);
      expect(viewSpy.todos).toBeUndefined();
    });

    it('should handle concurrent operations without conflicts', () => {
      // Arrange
      const operations = [
        () => presenter.createTodo(mockTodo),
        () => presenter.updateTodo('1', mockTodo),
        () => presenter.deleteTodo('1'),
        () => presenter.getAllTodos(),
        () => presenter.processCreateResponse(true),
        () => presenter.proccessUpdateTodoResponse(true),
        () => presenter.processDeleteTodoResponse(true),
        () => presenter.processGetAllResponse(mockTodos),
      ];

      // Act - Execute all operations
      operations.forEach((operation) => operation());

      // Assert
      expect(interactorSpy.createTodo).toHaveBeenCalledWith(mockTodo);
      expect(interactorSpy.updateTodo).toHaveBeenCalledWith('1', mockTodo);
      expect(interactorSpy.deleteTodo).toHaveBeenCalledWith('1');
      expect(interactorSpy.getAllTodos).toHaveBeenCalledTimes(4); // 1 direct + 3 from responses
      expect(viewSpy.todos).toEqual(mockTodos);
    });
  });

  describe('Constructor behavior', () => {
    it('should inject interactor correctly', () => {
      // The interactor should be injected and setPresenter should be called during construction
      expect(interactorSpy.setPresenter).toHaveBeenCalledWith(presenter);
    });

    it('should be ready to use after construction', () => {
      // Verify presenter is functional immediately after construction
      presenter.getAllTodos();
      expect(interactorSpy.getAllTodos).toHaveBeenCalled();
    });
  });
});
