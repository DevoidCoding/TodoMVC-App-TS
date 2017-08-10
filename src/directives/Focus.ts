import Vue from 'vue'

export const Focus: Vue.DirectiveOptions = {
    inserted: (el: HTMLElement) => {
        el.focus()
    }
}
