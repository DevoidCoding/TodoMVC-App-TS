import AppHeader from './components/AppHeader/AppHeader'
import Vue from 'vue'
import Component from 'vue-class-component'
import View from '!view!./App.html?style=./App.styl'
import MainSection from 'components/MainSection/MainSection'

@View
@Component({
    components: {
        MainSection,
        AppHeader
    }
})
export default class App extends Vue {}
