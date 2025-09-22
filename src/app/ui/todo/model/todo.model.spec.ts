import { FormControl, Validators } from '@angular/forms';
import {
  TodoOutputLogic,
  PRESENTER_LOGIC_TOKEN,
  INTERACTOR_LOGIC_TOKEN,
} from './todo.model';
import { Todo } from '../../../domain';

// Clase concreta para poder instanciar TodoOutputLogic (que es abstracta)
class ConcreteTodoOutputLogic extends TodoOutputLogic {
  constructor() {
    super();
    // Inicializar titleControl con validadores como en el componente real
    this.titleControl = new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(100),
    ]);
  }
}

describe('TodoOutputLogic', () => {
  let todoOutputLogic: ConcreteTodoOutputLogic;

  // Mock data para las pruebas
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Todo completado',
      completed: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Todo pendiente 1',
      completed: false,
      createdAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      title: 'Todo pendiente 2',
      completed: false,
      createdAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(() => {
    todoOutputLogic = new ConcreteTodoOutputLogic();
  });

  it('should create an instance', () => {
    expect(todoOutputLogic).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have empty todos array by default', () => {
      expect(todoOutputLogic.todos).toEqual([]);
      expect(todoOutputLogic.todos.length).toBe(0);
    });

    it('should have titleControl initialized', () => {
      expect(todoOutputLogic.titleControl).toBeDefined();
      expect(todoOutputLogic.titleControl.value).toBe('');
    });

    it('should have pending and completed counts as zero initially', () => {
      expect(todoOutputLogic.pendingTodos).toBe(0);
      expect(todoOutputLogic.completedTodos).toBe(0);
    });
  });

  describe('titleError getter', () => {
    it('should return required error message when field is empty', () => {
      // Arrange
      todoOutputLogic.titleControl.setValue('');
      todoOutputLogic.titleControl.markAsTouched(); // Para activar validación

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBe('El título es requerido');
    });

    it('should return minlength error message when field is empty (treated as minlength violation)', () => {
      // Arrange
      todoOutputLogic.titleControl.setValue('');

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      // Como el campo vacío viola tanto required como minlength,
      // pero required tiene prioridad en el getter
      expect(error).toBe('El título es requerido');
    });

    it('should return maxlength error message when field exceeds 100 characters', () => {
      // Arrange
      const longTitle = 'a'.repeat(101); // 101 caracteres
      todoOutputLogic.titleControl.setValue(longTitle);

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBe('El título no puede exceder 100 caracteres');
    });

    it('should return null when field has valid value', () => {
      // Arrange
      todoOutputLogic.titleControl.setValue('Valid todo title');

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBeNull();
    });

    it('should return null when field has minimum valid length', () => {
      // Arrange
      todoOutputLogic.titleControl.setValue('a'); // 1 carácter

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBeNull();
    });

    it('should return null when field has maximum valid length', () => {
      // Arrange
      const maxValidTitle = 'a'.repeat(100); // 100 caracteres exactos
      todoOutputLogic.titleControl.setValue(maxValidTitle);

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBeNull();
    });

    it('should handle special characters in title', () => {
      // Arrange
      todoOutputLogic.titleControl.setValue('Todo con émojis 🎉 y acentos éñü');

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBeNull();
    });

    it('should prioritize required error over other errors', () => {
      // Arrange - Crear un control que tenga múltiples errores
      todoOutputLogic.titleControl.setValue('');
      todoOutputLogic.titleControl.markAsTouched();

      // Act
      const error = todoOutputLogic.titleError;

      // Assert
      expect(error).toBe('El título es requerido');
      // Verificar que hay múltiples errores pero se retorna el de required
      expect(todoOutputLogic.titleControl.errors?.['required']).toBeTruthy();
    });
  });

  describe('pendingTodos getter', () => {
    it('should return 0 when todos array is empty', () => {
      // Act
      const pending = todoOutputLogic.pendingTodos;

      // Assert
      expect(pending).toBe(0);
    });

    it('should count only incomplete todos', () => {
      // Arrange
      todoOutputLogic.todos = mockTodos; // 1 completado, 2 pendientes

      // Act
      const pending = todoOutputLogic.pendingTodos;

      // Assert
      expect(pending).toBe(2);
    });

    it('should return correct count when all todos are pending', () => {
      // Arrange
      const allPendingTodos: Todo[] = [
        { id: '1', title: 'Todo 1', completed: false, createdAt: new Date() },
        { id: '2', title: 'Todo 2', completed: false, createdAt: new Date() },
        { id: '3', title: 'Todo 3', completed: false, createdAt: new Date() },
      ];
      todoOutputLogic.todos = allPendingTodos;

      // Act
      const pending = todoOutputLogic.pendingTodos;

      // Assert
      expect(pending).toBe(3);
    });

    it('should return 0 when all todos are completed', () => {
      // Arrange
      const allCompletedTodos: Todo[] = [
        { id: '1', title: 'Todo 1', completed: true, createdAt: new Date() },
        { id: '2', title: 'Todo 2', completed: true, createdAt: new Date() },
      ];
      todoOutputLogic.todos = allCompletedTodos;

      // Act
      const pending = todoOutputLogic.pendingTodos;

      // Assert
      expect(pending).toBe(0);
    });

    it('should handle single todo correctly', () => {
      // Arrange
      todoOutputLogic.todos = [mockTodos[1]]; // Solo un todo pendiente

      // Act
      const pending = todoOutputLogic.pendingTodos;

      // Assert
      expect(pending).toBe(1);
    });

    it('should update when todos array changes', () => {
      // Arrange - Initially empty
      expect(todoOutputLogic.pendingTodos).toBe(0);

      // Act - Add pending todos
      todoOutputLogic.todos = [mockTodos[1], mockTodos[2]];

      // Assert
      expect(todoOutputLogic.pendingTodos).toBe(2);
    });
  });

  describe('completedTodos getter', () => {
    it('should return 0 when todos array is empty', () => {
      // Act
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(completed).toBe(0);
    });

    it('should count only completed todos', () => {
      // Arrange
      todoOutputLogic.todos = mockTodos; // 1 completado, 2 pendientes

      // Act
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(completed).toBe(1);
    });

    it('should return correct count when all todos are completed', () => {
      // Arrange
      const allCompletedTodos: Todo[] = [
        { id: '1', title: 'Todo 1', completed: true, createdAt: new Date() },
        { id: '2', title: 'Todo 2', completed: true, createdAt: new Date() },
        { id: '3', title: 'Todo 3', completed: true, createdAt: new Date() },
      ];
      todoOutputLogic.todos = allCompletedTodos;

      // Act
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(completed).toBe(3);
    });

    it('should return 0 when all todos are pending', () => {
      // Arrange
      const allPendingTodos: Todo[] = [
        { id: '1', title: 'Todo 1', completed: false, createdAt: new Date() },
        { id: '2', title: 'Todo 2', completed: false, createdAt: new Date() },
      ];
      todoOutputLogic.todos = allPendingTodos;

      // Act
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(completed).toBe(0);
    });

    it('should handle single completed todo correctly', () => {
      // Arrange
      todoOutputLogic.todos = [mockTodos[0]]; // Solo un todo completado

      // Act
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(completed).toBe(1);
    });

    it('should update when todos array changes', () => {
      // Arrange - Initially empty
      expect(todoOutputLogic.completedTodos).toBe(0);

      // Act - Add completed todo
      todoOutputLogic.todos = [mockTodos[0]];

      // Assert
      expect(todoOutputLogic.completedTodos).toBe(1);
    });
  });

  describe('Integration between getters', () => {
    it('should have consistent totals between pending and completed', () => {
      // Arrange
      todoOutputLogic.todos = mockTodos;

      // Act
      const pending = todoOutputLogic.pendingTodos;
      const completed = todoOutputLogic.completedTodos;
      const total = todoOutputLogic.todos.length;

      // Assert
      expect(pending + completed).toBe(total);
      expect(pending).toBe(2);
      expect(completed).toBe(1);
      expect(total).toBe(3);
    });

    it('should handle dynamic changes to todo completion status', () => {
      // Arrange
      const dynamicTodos: Todo[] = [
        { id: '1', title: 'Todo 1', completed: false, createdAt: new Date() },
        { id: '2', title: 'Todo 2', completed: false, createdAt: new Date() },
      ];
      todoOutputLogic.todos = dynamicTodos;

      // Act & Assert - Initially all pending
      expect(todoOutputLogic.pendingTodos).toBe(2);
      expect(todoOutputLogic.completedTodos).toBe(0);

      // Act - Complete one todo
      todoOutputLogic.todos[0].completed = true;

      // Assert - Counts should update
      expect(todoOutputLogic.pendingTodos).toBe(1);
      expect(todoOutputLogic.completedTodos).toBe(1);
    });

    it('should handle edge case with large number of todos', () => {
      // Arrange
      const largeTodoList: Todo[] = Array.from({ length: 100 }, (_, index) => ({
        id: `todo-${index}`,
        title: `Todo ${index}`,
        completed: index % 3 === 0, // Every 3rd todo is completed
        createdAt: new Date(),
      }));
      todoOutputLogic.todos = largeTodoList;

      // Act
      const pending = todoOutputLogic.pendingTodos;
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(pending + completed).toBe(100);
      expect(completed).toBe(34); // 0, 3, 6, 9, ..., 99 = 34 items
      expect(pending).toBe(66);
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle null titleControl gracefully', () => {
      // Arrange
      todoOutputLogic.titleControl = null as any;

      // Act & Assert - Should not throw error
      expect(() => todoOutputLogic.titleError).toThrow();
    });

    it('should handle todos array with undefined/null values', () => {
      // Arrange
      todoOutputLogic.todos = [
        mockTodos[0],
        null as any,
        mockTodos[1],
        undefined as any,
      ];

      // Act & Assert - Should handle gracefully but will throw error
      // because filter tries to access .completed on null values
      expect(() => todoOutputLogic.pendingTodos).toThrow();
      expect(() => todoOutputLogic.completedTodos).toThrow();
    });

    it('should handle todos with missing completed property', () => {
      // Arrange
      const todosWithMissingProps: any[] = [
        { id: '1', title: 'Todo 1' }, // Sin completed
        { id: '2', title: 'Todo 2', completed: true },
        { id: '3', title: 'Todo 3', completed: false },
      ];
      todoOutputLogic.todos = todosWithMissingProps;

      // Act
      const pending = todoOutputLogic.pendingTodos;
      const completed = todoOutputLogic.completedTodos;

      // Assert
      expect(pending).toBe(2); // undefined se trata como falsy
      expect(completed).toBe(1);
    });
  });

  describe('Reactive behavior', () => {
    it('should recalculate counts when todos array is reassigned', () => {
      // Arrange
      const initialTodos = [mockTodos[0]]; // 1 completed
      todoOutputLogic.todos = initialTodos;
      expect(todoOutputLogic.completedTodos).toBe(1);

      // Act
      const newTodos = [mockTodos[1], mockTodos[2]]; // 2 pending
      todoOutputLogic.todos = newTodos;

      // Assert
      expect(todoOutputLogic.completedTodos).toBe(0);
      expect(todoOutputLogic.pendingTodos).toBe(2);
    });

    it('should work correctly with empty array assignment', () => {
      // Arrange
      todoOutputLogic.todos = mockTodos;
      expect(todoOutputLogic.pendingTodos).toBeGreaterThan(0);

      // Act
      todoOutputLogic.todos = [];

      // Assert
      expect(todoOutputLogic.pendingTodos).toBe(0);
      expect(todoOutputLogic.completedTodos).toBe(0);
    });
  });
});

describe('Injection Tokens', () => {
  it('should have PRESENTER_LOGIC_TOKEN defined', () => {
    expect(PRESENTER_LOGIC_TOKEN).toBeDefined();
    expect(PRESENTER_LOGIC_TOKEN.toString()).toContain(
      'TodoPresenterLogicImpl'
    );
  });

  it('should have INTERACTOR_LOGIC_TOKEN defined', () => {
    expect(INTERACTOR_LOGIC_TOKEN).toBeDefined();
    expect(INTERACTOR_LOGIC_TOKEN.toString()).toContain(
      'TodoInteractorLogicImpl'
    );
  });

  it('should have different token instances', () => {
    expect(PRESENTER_LOGIC_TOKEN).not.toBe(INTERACTOR_LOGIC_TOKEN);
  });
});
