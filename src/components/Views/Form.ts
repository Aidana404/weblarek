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

// ---------- OrderForm ----------

export interface IOrderForm extends IFormData {
    payment: 'card' | 'cash' | null;
    address: string;
}

export class OrderForm extends Form<IOrderForm> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container);
        this.cardButton = ensureElement<HTMLButtonElement>('[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('[name="cash"]', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            this.events.emit('order:payment', { payment: 'card' });
        });

        this.cashButton.addEventListener('click', () => {
            this.events.emit('order:payment', { payment: 'cash' });
        });

        this.addressInput.addEventListener('input', () => {
            this.events.emit('order:input', { field: 'address', value: this.addressInput.value });
        });
    }

    set payment(value: 'card' | 'cash' | null) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this.addressInput.value = value;
    }
}

// ---------- ContactsForm ----------

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
