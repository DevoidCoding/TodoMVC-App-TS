import View from '!view!./MainSection.html?style=./MainSection.styl'
import AppFooter from 'components/AppFooter/AppFooter'
import { Todo } from 'store/model/todo.model'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import {
    TodoAction,
    TodoMutation,
    TodoState,
    TodoStore
} from '../../store/todo'
import TodoItem from '../Todo/Item/Item'

@View
@Component({
    components: {
        TodoItem,
        AppFooter
    }
})
export default class MainSection extends Vue {
    @TodoState todos: TodoStore['todos']
    @TodoState filteredTodos: TodoStore['filteredTodos']
    @TodoState filter: TodoStore['filter']

    get allDone(): boolean {
        return this.todos.every((todo: Todo) => todo.done)
    }

    set allDone(value: boolean) {
        this.todos.forEach(e => (e.done = value))
    }
}
