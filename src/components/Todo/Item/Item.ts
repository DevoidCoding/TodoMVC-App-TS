import View from '!view!./Item.html?style=./Item.styl'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { Todo } from '../../../store/model/todo.model'
import { Focus } from '../../../directives/Focus'
import { TodoAction, TodoStore } from '../../../store/todo'
import TodoTextInput from '../TextInput/TextInput'

@View
@Component({
    components: {
        TodoTextInput
    },
    directives: {
        Focus
    }
})
export default class TodoItem extends Vue {
    @TodoAction removeTodo: TodoStore['removeTodo']

    editing: boolean = false
    @Prop(Todo) todo: Todo

    onBlur() {
        this.editing = false
    }
}
