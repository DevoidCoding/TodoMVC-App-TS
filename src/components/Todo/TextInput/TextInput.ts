import { TodoAction, TodoStore } from '../../../store/todo'
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import View from '!view!./TextInput.html?style=./TextInput.styl'

@View
@Component
export default class TodoTextInput extends Vue {
    @Prop(String) placeholder: string
    @Prop(String) value: string
    @Prop(Boolean) clearAfterEnter: boolean
    @Prop(Function) enter?: Function
    @Prop(Function) blur?: Function

    onBlur(e: Event) {
        if (this.blur) this.blur((<HTMLTextAreaElement>e.target).value)
    }

    onEnter(e: Event) {
        if (this.enter) {
            const target = <HTMLTextAreaElement>e.target
            this.enter(target.value)
            if (this.clearAfterEnter) target.value = ''
        }
    }
}
