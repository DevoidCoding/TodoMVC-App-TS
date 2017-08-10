// vue-template-loader (@see https://github.com/ktsn/vue-template-loader)
/* tslint:disable:interface-name no-duplicate-imports */
declare module '!view*' {
  import Vue from 'vue'
  interface WithRender {
    <V extends Vue>(options: Vue.ComponentOptions<V>): Vue.ComponentOptions<V>
    <V extends typeof Vue>(component: V): V
  }
  const withRender: WithRender
  export = withRender
}