import Vue from 'vue'
import { WatchOptions } from 'vue'
import Vuex from 'vuex'
import { Module, Payload } from 'vuex/types'

Vue.use(Vuex)

export type VuexDispatch<P> = <T extends keyof P>(
    type: T,
    value?: P[T]
) => Promise<any[]>
export type VuexCommit<P> = <T extends keyof P>(type: T, value?: P[T]) => void

export type VuexWatch<S> = <T>(
    getter: (state: S) => T,
    cb: (value: T, oldValue: T) => void,
    options?: WatchOptions
) => void

export abstract class VuexStore<S = any, A = any, M = any> {
    readonly state: S
    readonly getters: any

    replaceState: (state: S) => void
    getServerState: () => any

    dispatch: VuexDispatch<A>
    commit: VuexCommit<M>

    subscribe: <P extends Payload>(
        fn: (mutation: P, state: S) => any
    ) => () => void
    watch: VuexWatch<S>

    registerModule: <T>(path: string | string[], module: Module<T, S>) => void
    unregisterModule: (path: string | string[]) => void

    hotUpdate: any
}

const storeInstance = new Vuex.Store({})

interface QueuedDecoratorCallback {
    (store: any): void
}

let queuedDecorators: QueuedDecoratorCallback[] = []

interface VuexModuleOptions {
    store?: boolean
    modules?: Vuex.ModuleTree<any>
    namespaced?: boolean
}

export function VuexModule(options: VuexModuleOptions = {}) {
    const decorators = queuedDecorators
    queuedDecorators = []

    // A function that returns a function. Will be used as a constructor
    // function.
    return (target: any): any => () => {
        const state: any = {}

        // These are private helpers. Don't want them to show in vue-devtools.
        Object.defineProperties(state, {
            __vuexGetters: { enumerable: false, writable: true, value: [] },
            __vuexArgGetters: { enumerable: false, writable: true, value: [] },
            __vuexMutations: { enumerable: false, writable: true, value: [] },
            __vuexActions: { enumerable: false, writable: true, value: [] },
            __vuexGetterScope: { enumerable: false, writable: true },
            __vuexActionScope: { enumerable: false, writable: true },
            __vuexMutationScope: { enumerable: false, writable: true }
        })

        const storeOptions: Vuex.Module<any, any> = {
            modules: options.modules || {},
            namespaced: !options.store,
            state,
            actions: {},
            mutations: {}
        }

        // Copy over state.
        const instance = new target()
        for (const key of Object.getOwnPropertyNames(instance)) {
            if (!(key in storeInstance)) {
                state[key] = instance[key]
            }
        }

        // Copy over getters.
        for (const key of Object.getOwnPropertyNames(target.prototype)) {
            if (key in Vuex.Store.prototype) {
                continue
            }

            const desc = Object.getOwnPropertyDescriptor(target.prototype, key)
            const getter = desc.get
            if (!getter) {
                continue
            }

            // We define getters on the state. We don't put them into vuex
            // getters. This way they're available from any scope for any other
            // getter, action, mutation, etc. Vuex getters are a bit mad to work
            // with and can only be used in certain vuex scopes so they have
            // limited usefulness.
            Object.defineProperty(state, key, {
                enumerable: true,
                get: () => {
                    const scope = getGetterScope(state)
                    return getter.apply(scope)
                }
            })

            state.__vuexGetters.push(key)
        }

        // Apply the mutation and action decorators.
        for (const cb of decorators) {
            cb(storeOptions)
        }

        // Create the store instance. If it's the main store, we create it, if
        // it's not the main store we just use our options object.
        if (!options.store) {
            return storeOptions
        } else {
            const _instance = new Vuex.Store(storeOptions) as VuexStore

            // Overload this so that we do our own replace state handler.
            _instance.replaceState = (newState: any) =>
                replaceState(_instance, newState, _instance.state)

            _instance.getServerState = () => getServerState(_instance)

            return _instance
        }
    }
}

function isModule(store: any, key: string) {
    return key in store._modules.root._children
}

function replaceState(store: any, newState: any, currentState: any) {
    for (const k in newState) {
        if (currentState.__vuexGetters.indexOf(k) !== -1) {
            // Don't overwrite getters when setting new state.
            continue
        } else if (isModule(store, k)) {
            // Recurse into submodules.
            replaceState(store, newState[k], currentState[k])
        } else {
            currentState[k] = newState[k]
        }
    }
}

function getServerState(store: any) {
    const serverState = Object.assign({}, store.state)

    // We remove any dynamic modules. They are always used for
    // routes and we would rather bootstrap the route modules
    // from the raw payload data.
    const childModules = store._modules.root._children
    for (const childModuleName in childModules) {
        const childModule = childModules[childModuleName]
        if (childModule.runtime) {
            delete serverState[childModuleName]
        }
    }

    return serverState
}

/**
 * Creates a getter function that can take parameters. Will be accessible in
 * getters, actions, and mutations. Can't modify the state in any way, though.
 */
export function VuexGetter(target: any, name: string) {
    const method = target[name]
    queuedDecorators.push(store => {
        store.state.__vuexArgGetters.push(name)

        // We set this as non-enumerable so that it doesn't show up in
        // vue-devtools and similar state freezing events.
        Object.defineProperty(store.state, name, {
            enumerable: false,
            get: () => (...args: any[]) => {
                const scope = getGetterScope(store.state)
                return method.apply(scope, args)
            }
        })
    })
}

export function VuexMutation(target: any, name: string) {
    const method = target[name]
    queuedDecorators.push(store => {
        store.state.__vuexMutations.push(name)
        store.mutations![name] = (state: any, ...args: any[]) => {
            const scope = getMutationScope(state)
            return method.apply(scope, args)
        }
    })
}

export function VuexAction(target: any, name: string) {
    const method = target[name]
    queuedDecorators.push(store => {
        store.state.__vuexActions.push(name)
        store.actions[name] = (storeContext: any, ...args: any[]) => {
            const scope = getActionScope(storeContext)
            return method.apply(scope, args)
        }
    })
}

function getGetterScope(state: any) {
    if (!state.__vuexGetterScope) {
        const scope: any = {}
        scopeNoStateChange('getter', scope, state)
        scopeNoCallers('getter', scope, state)

        state.__vuexGetterScope = scope
    }

    return state.__vuexGetterScope
}

function getActionScope(store: any) {
    if (!store.state.__vuexActionScope) {
        const scope: any = {}
        scopeNoStateChange('action', scope, store.state)

        // Mutations and actions will just funnel off to theire
        // store.(commit/dispatch) equivalents so that we continue to funnel
        // through vuex.
        for (const key of store.state.__vuexMutations) {
            scope[key] = (...args: any[]) => store.commit(key, ...args)
        }

        for (const key of store.state.__vuexActions) {
            scope[key] = (...args: any[]) => store.dispatch(key, ...args)
        }

        // Pull these into the scope so that parent modules can call into their
        // nested namespaced modules.
        scope.commit = (...args: any[]) => store.commit(...args)
        scope.dispatch = (...args: any[]) => store.dispatch(...args)

        store.state.__vuexActionScope = scope
    }

    return store.state.__vuexActionScope
}

function getMutationScope(state: any) {
    if (!state.__vuexMutationScope) {
        const scope: any = {}
        scopeState('mutation', scope, state)
        scopeNoCallers('mutation', scope, state)

        state.__vuexMutationScope = scope
    }

    return state.__vuexMutationScope
}

/**
 * Sets up the scope so that you can access and modify state.
 */
function scopeState(_caller: string, scope: any, state: any) {
    for (const key of Object.getOwnPropertyNames(state)) {
        Object.defineProperty(scope, key, {
            enumerable: true,
            get: () => state[key],
            set: (val: any) => (state[key] = val)
        })
    }
}

/**
 * Sets up the scope so that you can't modify state.
 */
function scopeNoStateChange(caller: string, scope: any, state: any) {
    // Make a passthrough for all state to get. This allows us to throw an error
    // when they try setting within the action.
    for (const key of Object.getOwnPropertyNames(state)) {
        Object.defineProperty(scope, key, {
            get: () => state[key],
            set: () => stateMutateError(caller, key)
        })
    }
}

/**
 * Sets up the scope so that you can't call mutations/actions on it.
 */
function scopeNoCallers(caller: string, scope: any, state: any) {
    // Define these as properties so that we don't ovewrite the prototype's data
    // for these methods.
    for (const key of state.__vuexMutations) {
        Object.defineProperty(scope, key, {
            get: () => () => mutationError(caller, key)
        })
    }

    for (const key of state.__vuexActions) {
        Object.defineProperty(scope, key, {
            get: () => () => actionError(caller, key)
        })
    }

    return scope
}

function stateMutateError(caller: string, field: string) {
    throwError(
        `Couldn't modify field ${field}. You can't modify state within a ${caller}.`
    )
}

function mutationError(caller: string, mutation: string) {
    throwError(
        `Couldn't commit ${mutation}. You can't call mutations within a ${caller}.`
    )
}

function actionError(caller: string, action: string) {
    throwError(
        `Couldn't dispatch ${action}. You can't call actions within a ${caller}.`
    )
}

/**
 * Not all errors will be caught. This ensures that they see the error even if
 * it's not caught and shown.
 */
function throwError(msg: string) {
    const error = new Error(msg)
    console.error(error)
    throw error
}
