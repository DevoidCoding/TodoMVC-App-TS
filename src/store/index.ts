import {
    VuexStore,
    VuexModule,
    VuexAction,
    VuexMutation
} from '../lib/utils/vuex'
import {
    TodoStore,
    Mutations as TodoMutations,
    Actions as TodoActions
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
