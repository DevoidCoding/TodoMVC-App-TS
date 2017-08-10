import View from '!view!./AppFooter.html?style=./AppFooter.styl'
import { FilterEnum } from 'store/model/todo.model'
import { TodoAction, TodoMutation, TodoState, TodoStore } from 'store/todo'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@View
@Component
export default class AppFooter extends Vue {
    @TodoState remainingTodos: TodoStore['remainingTodos']
    @TodoState completedTodos: TodoStore['filteredTodos']
    @TodoState filter: TodoStore['filter']
    @TodoAction clearCompletedTodos: TodoStore['clearCompletedTodos']
    @TodoMutation changeFilter: TodoStore['changeFilter']

    get filters(): string[] {
        const objValues = Object.keys(FilterEnum).map(k => FilterEnum[k])
        return objValues.filter(v => typeof v === 'string') as string[]
    }
}
