import { namespace, State, Action, Mutation } from 'vuex-class'
import {
    VuexStore,
    VuexAction,
    VuexMutation,
    VuexModule
} from '../lib/utils/vuex'
import { Todo, FilterEnum } from './model/todo.model'

export const TodoState = namespace('todo', State)
export const TodoAction = namespace('todo', Action)
export const TodoMutation = namespace('todo', Mutation)

export type Actions = {
    'todo/newTodo': string
    'todo/removeTodo': Todo
}

export type Mutations = {
    'todo/addItem': Todo
    'todo/removeItem': Todo
    'todo/changeFilter': FilterEnum
}

@VuexModule()
export class TodoStore extends VuexStore<TodoStore, Actions, Mutations> {
    todos: Todo[] = [new Todo(0, 'Use Vuex')]
    filter: FilterEnum = FilterEnum.All

    get filteredTodos(): Todo[] {
        let filtered: Todo[] = []
        if (this.filter === FilterEnum.All) filtered = this.todos
        else if (this.filter === FilterEnum.Active)
            filtered = this.todos.filter(todo => !todo.done)
        else if (this.filter === FilterEnum.Complete)
            filtered = this.todos.filter(todo => todo.done)
        return filtered
    }

    get remainingTodos(): number {
        return this.todos.filter((todo: Todo) => !todo.done).length
    }

    get completedTodos(): number {
        return this.todos.filter((todo: Todo) => todo.done).length
    }

    @VuexMutation
    addItem(todo: Mutations['todo/addItem']) {
        this.todos.push(todo)
    }

    @VuexMutation
    removeItem(todo: Mutations['todo/removeItem']) {
        let indexOf = this.todos.indexOf(todo)
        if (indexOf > -1) this.todos.splice(indexOf, 1)
    }

    @VuexMutation
    clearCompletedItems() {
        this.todos = this.todos.filter(e => !e.done)
    }

    @VuexMutation
    changeFilter(filter: Mutations['todo/changeFilter']) {
        this.filter = filter
    }

    @VuexAction
    newTodo(text: Actions['todo/newTodo']) {
        text = text.trim()
        if (text.length === 0) return
        let lastId =
            this.todos && this.todos.length > 0
                ? this.todos[this.todos.length - 1].id
                : -1
        this.addItem(new Todo(++lastId, text))
    }

    @VuexAction
    removeTodo(todo: Actions['todo/removeTodo']) {
        this.removeItem(todo)
    }

    @VuexAction
    clearCompletedTodos() {
        this.clearCompletedItems()
    }
}
