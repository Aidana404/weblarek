import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { Form, IFormData } from './Form';

export interface IContactsForm extends IFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends Form<IContactsForm> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container);
        this.emailInput = ensureElement<HTMLInputElement>('[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('[name="phone"]', this.container);

        this.emailInput.addEventListener('input', () => {
            this.events.emit('contacts:input', { field: 'email', value: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit('contacts:input', { field: 'phone', value: this.phoneInput.value });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }
}
