import { TodoAction, TodoStore } from '../../store/todo'
import Vue from 'vue'
import { Component, Provide } from 'vue-property-decorator'
import View from '!view!./AppHeader.html?style=./AppHeader.styl'
import TodoTextInput from 'components/Todo/TextInput/TextInput'

@View
@Component({
    components: {
        TodoTextInput
    }
})
export default class AppHeader extends Vue {
    @TodoAction newTodo: TodoStore['newTodo']
}
