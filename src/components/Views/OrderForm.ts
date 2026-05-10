import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { TPayment } from '../../types';
import { Form, IFormData } from './Form';

export interface IOrderForm extends IFormData {
    payment: TPayment | null;
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

    set payment(value: TPayment | null) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this.addressInput.value = value;
    }
}
