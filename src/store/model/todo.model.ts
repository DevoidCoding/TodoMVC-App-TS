export class Todo {
    constructor(
        public id: number,
        public text: string,
        public done: boolean = false
    ) {}
}

export enum FilterEnum {
    All = 'all',
    Active = 'active',
    Complete = 'complete'
}
