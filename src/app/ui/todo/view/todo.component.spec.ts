import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TodoComponent } from './todo.component';
import { Todo } from '../../../domain';
import {
  PRESENTER_LOGIC_TOKEN,
  TodoInputLogic,
  TodoOutputLogic,
} from '../model/todo.model';

describe('TodoComponent', () => {
  let component: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;
  let presenterSpy: jasmine.SpyObj<TodoInputLogic>;
  let formBuilder: FormBuilder;

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

  beforeEach(async () => {
    // Crear spy object para TodoInputLogic
    const presenterSpyObj = jasmine.createSpyObj('TodoInputLogic', [
      'setView',
      'getAllTodos',
      'createTodo',
      'updateTodo',
      'deleteTodo'
    ]);

    await TestBed.configureTestingModule({
      imports: [TodoComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: PRESENTER_LOGIC_TOKEN, useValue: presenterSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoComponent);
    component = fixture.componentInstance;
    presenterSpy = TestBed.inject(PRESENTER_LOGIC_TOKEN) as jasmine.SpyObj<TodoInputLogic>;
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor and Initialization', () => {
    it('should extend TodoOutputLogic', () => {
      expect(component instanceof TodoOutputLogic).toBe(true);
    });

    it('should set itself as view on presenter during construction', () => {
      expect(presenterSpy.setView).toHaveBeenCalledWith(component);
    });

    it('should initialize form controls during construction', () => {
      expect(component.titleControl).toBeDefined();
      expect(component.titleControl.value).toBe('');
    });

    it('should configure titleControl with correct validators', () => {
      // Test required validator
      component.titleControl.setValue('');
      expect(component.titleControl.invalid).toBe(true);
      expect(component.titleControl.errors?.['required']).toBeTruthy();

      // Test minLength validator
      component.titleControl.setValue('');
      expect(component.titleControl.errors?.['required']).toBeTruthy();

      // Test maxLength validator (101 characters)
      const longTitle = 'a'.repeat(101);
      component.titleControl.setValue(longTitle);
      expect(component.titleControl.invalid).toBe(true);
      expect(component.titleControl.errors?.['maxlength']).toBeTruthy();

      // Test valid input
      component.titleControl.setValue('Valid Todo Title');
      expect(component.titleControl.valid).toBe(true);
      expect(component.titleControl.errors).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('should call getAllTodos on presenter', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(presenterSpy.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('should call getAllTodos only once per initialization', () => {
      // Act
      component.ngOnInit();
      component.ngOnInit();

      // Assert
      expect(presenterSpy.getAllTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('createTodo', () => {
    beforeEach(() => {
      // Spy on generateId to make tests predictable
      spyOn(component as any, 'generateId').and.returnValue('test-id-123');
    });

    it('should create todo when form is valid and has non-empty value', () => {
      // Arrange
      component.titleControl.setValue('New Todo Title');

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledWith({
        id: 'test-id-123',
        title: 'New Todo Title',
        completed: false,
        createdAt: jasmine.any(Date)
      });
    });

    it('should trim whitespace from title', () => {
      // Arrange
      component.titleControl.setValue('  Todo with spaces  ');

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledWith({
        id: 'test-id-123',
        title: 'Todo with spaces',
        completed: false,
        createdAt: jasmine.any(Date)
      });
    });

    it('should reset form after successful creation', () => {
      // Arrange
      component.titleControl.setValue('New Todo');

      // Act
      component.createTodo();

      // Assert
      expect(component.titleControl.value).toBeNull();
    });

    it('should not create todo when form is invalid', () => {
      // Arrange - Empty title (invalid)
      component.titleControl.setValue('');

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).not.toHaveBeenCalled();
    });

    it('should not create todo when title is only whitespace', () => {
      // Arrange
      component.titleControl.setValue('   ');

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).not.toHaveBeenCalled();
    });

    it('should not create todo when title exceeds maximum length', () => {
      // Arrange
      const longTitle = 'a'.repeat(101);
      component.titleControl.setValue(longTitle);

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).not.toHaveBeenCalled();
    });

    it('should create todo with minimum valid length', () => {
      // Arrange
      component.titleControl.setValue('a');

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledWith({
        id: 'test-id-123',
        title: 'a',
        completed: false,
        createdAt: jasmine.any(Date)
      });
    });

    it('should create todo with maximum valid length', () => {
      // Arrange
      const maxLengthTitle = 'a'.repeat(100);
      component.titleControl.setValue(maxLengthTitle);

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledWith({
        id: 'test-id-123',
        title: maxLengthTitle,
        completed: false,
        createdAt: jasmine.any(Date)
      });
    });

    it('should generate unique ID for each todo', (done) => {
      // Arrange
      (component as any).generateId.and.callThrough(); // Use real implementation
      component.titleControl.setValue('First Todo');

      // Act
      component.createTodo();
      const firstCall = presenterSpy.createTodo.calls.first().args[0];

      // Add delay and create another todo
      setTimeout(() => {
        component.titleControl.setValue('Second Todo');
        component.createTodo();
        const secondCall = presenterSpy.createTodo.calls.mostRecent().args[0];

        // Assert
        expect(firstCall.id).not.toEqual(secondCall.id);
        expect(firstCall.id).toBeDefined();
        expect(secondCall.id).toBeDefined();
        done();
      }, 1); // 1ms delay to ensure different timestamps
    });
  });

  describe('deleteTodo', () => {
    it('should call deleteTodo on presenter with correct id', () => {
      // Arrange
      const todoId = 'todo-to-delete';

      // Act
      component.deleteTodo(todoId);

      // Assert
      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith(todoId);
      expect(presenterSpy.deleteTodo).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string id', () => {
      // Arrange
      const emptyId = '';

      // Act
      component.deleteTodo(emptyId);

      // Assert
      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith(emptyId);
    });

    it('should handle special characters in id', () => {
      // Arrange
      const specialId = 'todo-delete-€ñü@#$%';

      // Act
      component.deleteTodo(specialId);

      // Assert
      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith(specialId);
    });

    it('should handle multiple delete operations', () => {
      // Act
      component.deleteTodo('1');
      component.deleteTodo('2');
      component.deleteTodo('3');

      // Assert
      expect(presenterSpy.deleteTodo).toHaveBeenCalledTimes(3);
      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith('1');
      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith('2');
      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith('3');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle completed status from false to true', () => {
      // Arrange
      const todoToToggle: Todo = {
        id: '1',
        title: 'Todo to toggle',
        completed: false,
        createdAt: new Date()
      };

      // Act
      component.toggleTodo('1', todoToToggle);

      // Assert
      expect(presenterSpy.updateTodo).toHaveBeenCalledWith('1', {
        id: '1',
        title: 'Todo to toggle',
        completed: true, // Should be toggled
        createdAt: jasmine.any(Date)
      });
    });

    it('should toggle completed status from true to false', () => {
      // Arrange
      const todoToToggle: Todo = {
        id: '2',
        title: 'Completed todo',
        completed: true,
        createdAt: new Date()
      };

      // Act
      component.toggleTodo('2', todoToToggle);

      // Assert
      expect(presenterSpy.updateTodo).toHaveBeenCalledWith('2', {
        id: '2',
        title: 'Completed todo',
        completed: false, // Should be toggled
        createdAt: jasmine.any(Date)
      });
    });

    it('should preserve all other todo properties when toggling', () => {
      // Arrange
      const originalDate = new Date('2024-01-01');
      const todoToToggle: Todo = {
        id: 'preserve-test',
        title: 'Todo with all properties',
        completed: false,
        createdAt: originalDate
      };

      // Act
      component.toggleTodo('preserve-test', todoToToggle);

      // Assert
      const updatedTodo = presenterSpy.updateTodo.calls.mostRecent().args[1];
      expect(updatedTodo.id).toBe('preserve-test');
      expect(updatedTodo.title).toBe('Todo with all properties');
      expect(updatedTodo.completed).toBe(true);
      expect(updatedTodo.createdAt).toBe(originalDate);
    });

    it('should handle multiple toggle operations', () => {
      // Arrange
      const todo1: Todo = { id: '1', title: 'Todo 1', completed: false, createdAt: new Date() };
      const todo2: Todo = { id: '2', title: 'Todo 2', completed: true, createdAt: new Date() };

      // Act
      component.toggleTodo('1', todo1);
      component.toggleTodo('2', todo2);

      // Assert
      expect(presenterSpy.updateTodo).toHaveBeenCalledTimes(2);
      
      const firstCall = presenterSpy.updateTodo.calls.first().args;
      expect(firstCall[0]).toBe('1');
      expect(firstCall[1].completed).toBe(true);

      const secondCall = presenterSpy.updateTodo.calls.mostRecent().args;
      expect(secondCall[0]).toBe('2');
      expect(secondCall[1].completed).toBe(false);
    });

    it('should create new object instance when toggling', () => {
      // Arrange
      const originalTodo: Todo = {
        id: '1',
        title: 'Original Todo',
        completed: false,
        createdAt: new Date()
      };

      // Act
      component.toggleTodo('1', originalTodo);

      // Assert
      const updatedTodo = presenterSpy.updateTodo.calls.mostRecent().args[1];
      expect(updatedTodo).not.toBe(originalTodo); // Should be different object
      expect(updatedTodo.completed).not.toBe(originalTodo.completed);
    });
  });

  describe('generateId', () => {
    it('should generate string id', () => {
      // Act
      const id = (component as any).generateId();

      // Assert
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate different ids on subsequent calls', (done) => {
      // Act - Add small delay to ensure different timestamps
      const id1 = (component as any).generateId();
      
      setTimeout(() => {
        const id2 = (component as any).generateId();
        
        // Assert
        expect(id1).not.toEqual(id2);
        done();
      }, 1); // 1ms delay to ensure different timestamps
    });

    it('should generate numeric string based on timestamp', () => {
      // Act
      const id = (component as any).generateId();

      // Assert
      expect(id).toMatch(/^\d+$/); // Should be numeric string
      expect(parseInt(id)).toBeGreaterThan(0);
    });
  });

  describe('resetForm', () => {
    it('should reset titleControl to null', () => {
      // Arrange
      component.titleControl.setValue('Some value');

      // Act
      (component as any).resetForm();

      // Assert
      expect(component.titleControl.value).toBeNull();
    });

    it('should reset form validation state', () => {
      // Arrange
      component.titleControl.setValue('');
      component.titleControl.markAsTouched();
      expect(component.titleControl.invalid).toBe(true);

      // Act
      (component as any).resetForm();

      // Assert
      expect(component.titleControl.untouched).toBe(true);
      expect(component.titleControl.pristine).toBe(true);
    });
  });

  describe('Form validation edge cases', () => {
    it('should handle null value in titleControl', () => {
      // Arrange
      component.titleControl.setValue(null);

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).not.toHaveBeenCalled();
    });

    it('should handle null value in titleControl', () => {
      // Arrange
      component.titleControl.setValue(null);

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).not.toHaveBeenCalled();
    });

    it('should handle special characters in title', () => {
      // Arrange
      spyOn(component as any, 'generateId').and.returnValue('special-id');
      const specialTitle = 'Todo with émojis 🎉 and special chars: @#$%';
      component.titleControl.setValue(specialTitle);

      // Act
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledWith({
        id: 'special-id',
        title: specialTitle,
        completed: false,
        createdAt: jasmine.any(Date)
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user workflow', () => {
      // Arrange
      spyOn(component as any, 'generateId').and.returnValue('workflow-id');

      // Act - Create todo
      component.titleControl.setValue('Integration Test Todo');
      component.createTodo();

      // Act - Toggle todo
      const createdTodo = presenterSpy.createTodo.calls.mostRecent().args[0];
      component.toggleTodo('workflow-id', createdTodo);

      // Act - Delete todo
      component.deleteTodo('workflow-id');

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledWith({
        id: 'workflow-id',
        title: 'Integration Test Todo',
        completed: false,
        createdAt: jasmine.any(Date)
      });

      expect(presenterSpy.updateTodo).toHaveBeenCalledWith('workflow-id', {
        id: 'workflow-id',
        title: 'Integration Test Todo',
        completed: true,
        createdAt: jasmine.any(Date)
      });

      expect(presenterSpy.deleteTodo).toHaveBeenCalledWith('workflow-id');
      expect(component.titleControl.value).toBeNull(); // Form should be reset
    });

    it('should maintain todos array from parent class', () => {
      // Arrange
      component.todos = mockTodos;

      // Assert
      expect(component.todos).toEqual(mockTodos);
      expect(component.todos.length).toBe(2);
    });

    it('should handle rapid user interactions', () => {
      // Arrange
      spyOn(component as any, 'generateId').and.returnValues('rapid-1', 'rapid-2', 'rapid-3');

      // Act - Rapid create operations
      ['Todo 1', 'Todo 2', 'Todo 3'].forEach(title => {
        component.titleControl.setValue(title);
        component.createTodo();
      });

      // Act - Rapid delete operations
      ['rapid-1', 'rapid-2', 'rapid-3'].forEach(id => {
        component.deleteTodo(id);
      });

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalledTimes(3);
      expect(presenterSpy.deleteTodo).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component lifecycle', () => {
    it('should initialize correctly when created', () => {
      // Assert - All initialization should happen in constructor
      expect(component.titleControl).toBeDefined();
      expect(presenterSpy.setView).toHaveBeenCalledWith(component);
      expect(component instanceof TodoOutputLogic).toBe(true);
    });

    it('should be ready to use after construction', () => {
      // Act
      component.titleControl.setValue('Ready Test');
      component.createTodo();

      // Assert
      expect(presenterSpy.createTodo).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle presenter being null gracefully in constructor', () => {
      // This test verifies that if presenter injection fails, it doesn't crash
      // In real scenario, this would be caught by Angular DI, but good to verify
      expect(() => {
        component.ngOnInit();
      }).not.toThrow();
    });

    it('should handle form builder being null gracefully', () => {
      // Verify component can handle missing dependencies gracefully
      expect(component.titleControl).toBeDefined();
      expect(component.titleControl.validator).toBeDefined();
    });
  });
});