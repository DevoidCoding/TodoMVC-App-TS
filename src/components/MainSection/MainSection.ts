import TodoItem from '../Todo/Item/Item'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import View from '!view!./MainSection.html?style=./MainSection.styl'
import {
    TodoState,
    TodoAction,
    TodoMutation,
    TodoStore
} from '../../store/todo'
import AppFooter from 'components/AppFooter/AppFooter'
import { Todo } from 'store/model/todo.model'

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
