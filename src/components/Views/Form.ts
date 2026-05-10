import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export interface IFormData {
    valid: boolean;
    errors: string;
}

export abstract class Form<T extends IFormData> extends Component<T> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(container);
        this.submitButton = ensureElement<HTMLButtonElement>('[type="submit"]', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(`${container.name}:submit`);
        });
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errors(value: string) {
        this.errorsElement.textContent = value;
    }
}
