import {
    VuexAction,
    VuexModule,
    VuexMutation,
    VuexStore
} from '../lib/utils/vuex'
import {
    Actions as TodoActions,
    Mutations as TodoMutations,
    TodoStore
} from './todo'

export type Actions = TodoMutations & {}

export type Mutations = TodoActions & {}

const modules: any = {
    todo: new TodoStore()
}

@VuexModule({
    store: true,
    modules: modules
})
export class Store extends VuexStore<Store, Actions, Mutations> {
    todo: TodoStore
}

const store = new Store()
export default store
