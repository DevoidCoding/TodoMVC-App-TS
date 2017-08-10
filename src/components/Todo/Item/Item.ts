import TodoTextInput from '../TextInput/TextInput'
import { TodoAction, TodoStore } from '../../../store/todo'
import { Todo } from '../../../store/model/todo.model'
import Vue from 'vue'
import { Component, Prop, Provide } from 'vue-property-decorator'
import View from '!view!./Item.html?style=./Item.styl'

@View
@Component({
    components: {
        TodoTextInput
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
