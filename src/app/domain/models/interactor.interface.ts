export interface Interactor<T> {
  setPresenter(presenter: T): void;
}
