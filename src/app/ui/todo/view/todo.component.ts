import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Todo } from '../../../domain';
import {
  PRESENTER_LOGIC_TOKEN,
  TodoInputLogic,
  TodoOutputLogic,
} from '../model/todo.model';

@Component({
  selector: 'app-todo',
  imports: [ReactiveFormsModule],
  templateUrl: './todo.component.html',
})
export class TodoComponent extends TodoOutputLogic implements OnInit {
  constructor(
    @Inject(PRESENTER_LOGIC_TOKEN) private presenter: TodoInputLogic,
    private fb: FormBuilder
  ) {
    super();
    this.presenter.setView(this);
    this.initializeForm();
  }

  private initializeForm(): void {
    this.titleControl = this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(100),
    ]);
  }

  ngOnInit(): void {
    this.presenter.getAllTodos();
  }

  createTodo(): void {
    if (this.titleControl.valid && this.titleControl.value?.trim()) {
      const todo: Todo = {
        id: this.generateId(),
        title: this.titleControl.value.trim(),
        completed: false,
        createdAt: new Date(),
      };

      this.presenter.createTodo(todo);
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.titleControl.reset();
  }

  private generateId(): string {
    return Date.now().toString();
  }

  deleteTodo(todoId: string): void {
    this.presenter.deleteTodo(todoId);
  }
}
