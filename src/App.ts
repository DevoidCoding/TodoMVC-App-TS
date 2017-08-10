import View from '!view!./App.html?style=./App.styl'
import MainSection from 'components/MainSection/MainSection'
import Vue from 'vue'
import Component from 'vue-class-component'

import AppHeader from './components/AppHeader/AppHeader'

@View
@Component({
    components: {
        MainSection,
        AppHeader
    }
})
export default class App extends Vue {}
