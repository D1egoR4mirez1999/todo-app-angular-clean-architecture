import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from '../../domain';
import { LocalStorageTodoRepository } from './local-storage-todo.repository';

describe('LocalStorageTodoRepository', () => {
  let repository: LocalStorageTodoRepository;

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
    TestBed.configureTestingModule({
      providers: [LocalStorageTodoRepository]
    });

    // Mock localStorage
    let store: { [key: string]: string } = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return store[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });

    // Spy para console.error
    spyOn(console, 'error');

    repository = TestBed.inject(LocalStorageTodoRepository);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('loadFromStorage', () => {
    it('should load todos from localStorage on initialization', (done) => {
      // Arrange
      const storedTodos = JSON.stringify(mockTodos);
      localStorage.setItem('todos', storedTodos);

      // Act
      const newRepository = new LocalStorageTodoRepository();

      // Assert
      newRepository.getAll().subscribe(todos => {
        expect(todos.length).toBe(mockTodos.length);
        expect(todos[0].id).toBe(mockTodos[0].id);
        expect(todos[0].title).toBe(mockTodos[0].title);
        expect(todos[0].completed).toBe(mockTodos[0].completed);
        expect(localStorage.getItem).toHaveBeenCalledWith('todos');
        done();
      });
    });

    it('should return empty array when localStorage is empty', (done) => {
      // Arrange - localStorage is empty by default

      // Act
      const newRepository = new LocalStorageTodoRepository();

      // Assert
      newRepository.getAll().subscribe(todos => {
        expect(todos).toEqual([]);
        expect(localStorage.getItem).toHaveBeenCalledWith('todos');
        done();
      });
    });

    it('should return empty array when localStorage contains invalid JSON', (done) => {
      // Arrange
      localStorage.setItem('todos', 'invalid-json');

      // Act
      const newRepository = new LocalStorageTodoRepository();

      // Assert
      newRepository.getAll().subscribe(todos => {
        expect(todos).toEqual([]);
        expect(localStorage.getItem).toHaveBeenCalledWith('todos');
        done();
      });
    });

    it('should handle localStorage access errors gracefully', (done) => {
      // Arrange
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage access denied');

      // Act
      const newRepository = new LocalStorageTodoRepository();

      // Assert
      newRepository.getAll().subscribe(todos => {
        expect(todos).toEqual([]);
        done();
      });
    });
  });

  describe('getAll', () => {
    it('should return observable of all todos', (done) => {
      // Arrange
      const todosForStorage = mockTodos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString()
      }));
      localStorage.setItem('todos', JSON.stringify(todosForStorage));
      const newRepository = new LocalStorageTodoRepository();

      // Act
      newRepository.getAll().subscribe(todos => {
        // Assert
        expect(todos.length).toBe(2);
        expect(todos[0].id).toBe(mockTodos[0].id);
        expect(todos[0].title).toBe(mockTodos[0].title);
        expect(todos[0].completed).toBe(mockTodos[0].completed);
        done();
      });
    });

    it('should return observable of empty array when no todos exist', (done) => {
      // Act
      repository.getAll().subscribe(todos => {
        // Assert
        expect(todos).toEqual([]);
        expect(todos.length).toBe(0);
        done();
      });
    });

    it('should return updated todos after changes', (done) => {
      // Arrange
      let emissionCount = 0;
      const expectedEmissions = [[], [mockTodo]];

      // Act
      repository.getAll().subscribe(todos => {
        // Assert
        expect(todos).toEqual(expectedEmissions[emissionCount]);
        emissionCount++;
        
        if (emissionCount === 2) {
          done();
        }
      });

      // Trigger change after subscription
      setTimeout(() => {
        repository.create(mockTodo).subscribe();
      }, 0);
    });
  });

  describe('getById', () => {
    beforeEach((done) => {
      const todosForStorage = mockTodos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString()
      }));
      localStorage.setItem('todos', JSON.stringify(todosForStorage));
      repository = new LocalStorageTodoRepository();
      // Wait for initialization
      setTimeout(() => done(), 0);
    });

    it('should return todo by id', (done) => {
      // Act
      repository.getById('1').subscribe(todo => {
        // Assert
        expect(todo).toBeTruthy();
        expect(todo?.id).toBe('1');
        expect(todo?.title).toBe(mockTodo.title);
        expect(todo?.completed).toBe(mockTodo.completed);
        done();
      });
    });

    it('should return null when todo is not found', (done) => {
      // Act
      repository.getById('non-existent-id').subscribe(todo => {
        // Assert
        expect(todo).toBeNull();
        done();
      });
    });

    it('should return null for empty string id', (done) => {
      // Act
      repository.getById('').subscribe(todo => {
        // Assert
        expect(todo).toBeNull();
        done();
      });
    });

    it('should return null for undefined id', (done) => {
      // Act
      repository.getById(undefined as any).subscribe(todo => {
        // Assert
        expect(todo).toBeNull();
        done();
      });
    });
  });

  describe('create', () => {
    it('should create todo successfully', (done) => {
      // Act
      repository.create(mockTodo).subscribe(result => {
        // Assert
        expect(result).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify([mockTodo]));
        
        // Verify todo was added to the subject
        repository.getAll().subscribe(todos => {
          expect(todos).toContain(mockTodo);
          expect(todos.length).toBe(1);
          done();
        });
      });
    });

    it('should add todo to existing list', (done) => {
      // Arrange
      const firstTodoForStorage = {
        ...mockTodos[0],
        createdAt: mockTodos[0].createdAt.toISOString()
      };
      localStorage.setItem('todos', JSON.stringify([firstTodoForStorage]));
      repository = new LocalStorageTodoRepository();

      // Wait for initialization then create second todo
      setTimeout(() => {
        // Act
        repository.create(mockTodos[1]).subscribe(result => {
          // Assert
          expect(result).toBe(true);
          
          repository.getAll().subscribe(todos => {
            expect(todos.length).toBe(2);
            
            // Check first todo (loaded from storage)
            const firstTodo = todos.find(t => t.id === mockTodos[0].id);
            expect(firstTodo).toBeTruthy();
            expect(firstTodo?.title).toBe(mockTodos[0].title);
            expect(firstTodo?.completed).toBe(mockTodos[0].completed);
            
            // Check second todo (newly created)
            const secondTodo = todos.find(t => t.id === mockTodos[1].id);
            expect(secondTodo).toBeTruthy();
            expect(secondTodo?.title).toBe(mockTodos[1].title);
            expect(secondTodo?.completed).toBe(mockTodos[1].completed);
            
            done();
          });
        });
      }, 0);
    });

    it('should handle localStorage save errors gracefully', (done) => {
      // Arrange
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage quota exceeded');

      // Act
      repository.create(mockTodo).subscribe(result => {
        // Assert
        expect(result).toBe(true); // Still returns true as per implementation
        expect(console.error).toHaveBeenCalledWith('Error saving to localStorage:', jasmine.any(Error));
        done();
      });
    });

    it('should return true for valid todo object', (done) => {
      // Arrange
      const validTodo: Todo = {
        id: '3',
        title: 'Valid Todo',
        completed: false,
        createdAt: new Date()
      };

      // Act
      repository.create(validTodo).subscribe(result => {
        // Assert
        expect(result).toBe(true);
        done();
      });
    });

    it('should preserve todo properties exactly', (done) => {
      // Arrange
      const todoWithSpecialChars: Todo = {
        id: 'special-123',
        title: 'Todo with émojis 🚀 and special chars: @#$%',
        completed: false,
        createdAt: new Date('2024-01-01T10:30:00Z')
      };

      // Act
      repository.create(todoWithSpecialChars).subscribe(() => {
        repository.getById('special-123').subscribe(retrievedTodo => {
          // Assert
          expect(retrievedTodo?.id).toBe(todoWithSpecialChars.id);
          expect(retrievedTodo?.title).toBe(todoWithSpecialChars.title);
          expect(retrievedTodo?.completed).toBe(todoWithSpecialChars.completed);
          done();
        });
      });
    });
  });

  describe('update', () => {
    beforeEach((done) => {
      const todosForStorage = mockTodos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString()
      }));
      localStorage.setItem('todos', JSON.stringify(todosForStorage));
      repository = new LocalStorageTodoRepository();
      // Wait for initialization
      setTimeout(() => done(), 0);
    });

    it('should update todo successfully', (done) => {
      // Arrange
      const updates = { title: 'Updated Title', completed: true };

      // Act
      repository.update('1', updates).subscribe(result => {
        // Assert
        expect(result).toBe(true);
        
        repository.getById('1').subscribe(updatedTodo => {
          expect(updatedTodo?.title).toBe('Updated Title');
          expect(updatedTodo?.completed).toBe(true);
          expect(updatedTodo?.id).toBe('1'); // Should preserve original id
          done();
        });
      });
    });

    it('should update only specified fields', (done) => {
      // Arrange
      const updates = { completed: true };

      // Act
      repository.update('1', updates).subscribe(result => {
        // Assert
        expect(result).toBe(true);
        
        repository.getById('1').subscribe(updatedTodo => {
          expect(updatedTodo?.completed).toBe(true);
          expect(updatedTodo?.title).toBe(mockTodo.title); // Should preserve original title
          expect(updatedTodo?.id).toBe(mockTodo.id); // Should preserve original id
          done();
        });
      });
    });

    it('should throw error when todo is not found', (done) => {
      // Act
      repository.update('non-existent-id', { title: 'Updated' }).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          // Assert
          expect(error.message).toBe('Todo not found');
          done();
        }
      });
    });

    it('should save updated todos to localStorage', (done) => {
      // Arrange
      const updates = { title: 'Updated Title' };

      // Act
      repository.update('1', updates).subscribe(() => {
        // Assert
        expect(localStorage.setItem).toHaveBeenCalled();
        
        const savedData = (localStorage.setItem as jasmine.Spy).calls.mostRecent().args[1];
        const savedTodos: Todo[] = JSON.parse(savedData);
        const updatedTodo = savedTodos.find(t => t.id === '1');
        
        expect(updatedTodo?.title).toBe('Updated Title');
        done();
      });
    });

    it('should handle localStorage save errors during update', (done) => {
      // Arrange
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');

      // Act
      repository.update('1', { title: 'Updated' }).subscribe(result => {
        // Assert
        expect(result).toBe(true); // Still returns true as per implementation
        expect(console.error).toHaveBeenCalledWith('Error saving to localStorage:', jasmine.any(Error));
        done();
      });
    });

    it('should update todo and notify subscribers', (done) => {
      // Arrange
      let notificationCount = 0;
      const updates = { completed: true };

      repository.getAll().subscribe(todos => {
        notificationCount++;
        if (notificationCount === 2) { // Initial + after update
          const updatedTodo = todos.find(t => t.id === '1');
          expect(updatedTodo?.completed).toBe(true);
          done();
        }
      });

      // Act
      setTimeout(() => {
        repository.update('1', updates).subscribe();
      }, 0);
    });
  });

  describe('delete', () => {
    beforeEach((done) => {
      const todosForStorage = mockTodos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString()
      }));
      localStorage.setItem('todos', JSON.stringify(todosForStorage));
      repository = new LocalStorageTodoRepository();
      // Wait for initialization
      setTimeout(() => done(), 0);
    });

    it('should delete todo successfully', (done) => {
      // Act
      repository.delete('1').subscribe(result => {
        // Assert
        expect(result).toBe(true);
        
        repository.getAll().subscribe(todos => {
          expect(todos.length).toBe(1);
          expect(todos.find(t => t.id === '1')).toBeUndefined();
          expect(todos.find(t => t.id === '2')).toBeDefined();
          done();
        });
      });
    });

    it('should return true even when todo does not exist', (done) => {
      // Act
      repository.delete('non-existent-id').subscribe(result => {
        // Assert
        expect(result).toBe(true);
        
        repository.getAll().subscribe(todos => {
          expect(todos.length).toBe(2); // No change in count
          done();
        });
      });
    });

    it('should save updated list to localStorage after deletion', (done) => {
      // Act
      repository.delete('1').subscribe(() => {
        // Assert
        expect(localStorage.setItem).toHaveBeenCalled();
        
        const savedData = (localStorage.setItem as jasmine.Spy).calls.mostRecent().args[1];
        const savedTodos: Todo[] = JSON.parse(savedData);
        
        expect(savedTodos.length).toBe(1);
        expect(savedTodos.find(t => t.id === '1')).toBeUndefined();
        done();
      });
    });

    it('should handle localStorage save errors during deletion', (done) => {
      // Arrange
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');

      // Act
      repository.delete('1').subscribe(result => {
        // Assert
        expect(result).toBe(true); // Still returns true as per implementation
        expect(console.error).toHaveBeenCalledWith('Error saving to localStorage:', jasmine.any(Error));
        done();
      });
    });

    it('should delete todo and notify subscribers', (done) => {
      // Arrange
      let notificationCount = 0;

      repository.getAll().subscribe(todos => {
        notificationCount++;
        if (notificationCount === 2) { // Initial + after deletion
          expect(todos.length).toBe(1);
          expect(todos.find(t => t.id === '1')).toBeUndefined();
          done();
        }
      });

      // Act
      setTimeout(() => {
        repository.delete('1').subscribe();
      }, 0);
    });

    it('should delete all todos when called multiple times', (done) => {
      // Act
      repository.delete('1').subscribe(() => {
        repository.delete('2').subscribe(() => {
          // Assert
          repository.getAll().subscribe(todos => {
            expect(todos.length).toBe(0);
            done();
          });
        });
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete CRUD workflow with localStorage persistence', (done) => {
      // Arrange
      const newTodo: Todo = {
        id: '3',
        title: 'Integration Test Todo',
        completed: false,
        createdAt: new Date()
      };

      // Act & Assert - Create
      repository.create(newTodo).subscribe(createResult => {
        expect(createResult).toBe(true);
        
        // Read
        repository.getById('3').subscribe(retrievedTodo => {
          expect(retrievedTodo).toEqual(newTodo);
          
          // Update
          repository.update('3', { completed: true }).subscribe(updateResult => {
            expect(updateResult).toBe(true);
            
            // Verify update
            repository.getById('3').subscribe(updatedTodo => {
              expect(updatedTodo?.completed).toBe(true);
              
              // Delete
              repository.delete('3').subscribe(deleteResult => {
                expect(deleteResult).toBe(true);
                
                // Verify deletion
                repository.getById('3').subscribe(deletedTodo => {
                  expect(deletedTodo).toBeNull();
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should maintain data consistency across repository instances', (done) => {
      // Arrange
      const todosForStorage = mockTodos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString()
      }));
      localStorage.setItem('todos', JSON.stringify(todosForStorage));
      
      // Act
      const repository1 = new LocalStorageTodoRepository();
      const repository2 = new LocalStorageTodoRepository();

      // Assert
      repository1.getAll().subscribe(todos1 => {
        repository2.getAll().subscribe(todos2 => {
          expect(todos1.length).toBe(todos2.length);
          expect(todos1.length).toBe(2);
          done();
        });
      });
    });

    it('should handle rapid successive operations', (done) => {
      // Arrange
      const operations = [
        () => repository.create({ id: '10', title: 'Todo 10', completed: false, createdAt: new Date() }),
        () => repository.create({ id: '11', title: 'Todo 11', completed: false, createdAt: new Date() }),
        () => repository.update('10', { completed: true }),
        () => repository.delete('11')
      ];

      let completedOperations = 0;

      // Act
      operations.forEach(operation => {
        operation().subscribe(() => {
          completedOperations++;
          if (completedOperations === operations.length) {
            // Assert
            repository.getAll().subscribe(todos => {
              expect(todos.some(t => t.id === '10' && t.completed === true)).toBe(true);
              expect(todos.some(t => t.id === '11')).toBe(false);
              done();
            });
          }
        });
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extremely long todo titles', (done) => {
      // Arrange
      const longTitle = 'A'.repeat(10000);
      const todoWithLongTitle: Todo = {
        id: 'long-title-todo',
        title: longTitle,
        completed: false,
        createdAt: new Date()
      };

      // Act
      repository.create(todoWithLongTitle).subscribe(() => {
        repository.getById('long-title-todo').subscribe(retrievedTodo => {
          // Assert
          expect(retrievedTodo?.title).toBe(longTitle);
          expect(retrievedTodo?.title.length).toBe(10000);
          done();
        });
      });
    });

    it('should handle special characters in todo data', (done) => {
      // Arrange
      const specialTodo: Todo = {
        id: 'special-chars-€ñü',
        title: 'Special chars: 🎉 "quotes" \'apostrophes\' & <tags>',
        completed: false,
        createdAt: new Date()
      };

      // Act
      repository.create(specialTodo).subscribe(() => {
        repository.getById('special-chars-€ñü').subscribe(retrievedTodo => {
          // Assert
          expect(retrievedTodo?.id).toBe(specialTodo.id);
          expect(retrievedTodo?.title).toBe(specialTodo.title);
          expect(retrievedTodo?.completed).toBe(specialTodo.completed);
          done();
        });
      });
    });

    it('should handle Date objects in createdAt field', (done) => {
      // Arrange
      const specificDate = new Date('2024-12-25T15:30:00.000Z');
      const todoWithDate: Todo = {
        id: 'date-todo',
        title: 'Todo with specific date',
        completed: false,
        createdAt: specificDate
      };

      // Act
      repository.create(todoWithDate).subscribe(() => {
        repository.getById('date-todo').subscribe(retrievedTodo => {
          // Assert
          expect(retrievedTodo?.createdAt).toBeDefined();
          expect(retrievedTodo?.id).toBe('date-todo');
          expect(retrievedTodo?.title).toBe('Todo with specific date');
          done();
        });
      });
    });
  });
});