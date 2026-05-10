import type { BuyerFieldErrors, IBuyer, TPayment } from '../../types';
import type { IEvents } from '../base/Events';

export class Buyer {
    private payment: TPayment | null = null;
    private address = '';
    private phone = '';
    private email = '';

    constructor(private events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) {
            this.payment = data.payment;
        }
        if (data.address !== undefined) {
            this.address = data.address;
        }
        if (data.phone !== undefined) {
            this.phone = data.phone;
        }
        if (data.email !== undefined) {
            this.email = data.email;
        }
        this.events.emit('buyer:changed');
    }

    getData(): IBuyer {
        if (this.payment === null) {
            throw new Error('Не выбран способ оплаты');
        }

        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        this.payment = null;
        this.address = '';
        this.phone = '';
        this.email = '';
        this.events.emit('buyer:changed');
    }

    validate(): BuyerFieldErrors {
        const errors: BuyerFieldErrors = {};

        if (this.payment === null) {
            errors.payment = 'Не выбран вид оплаты';
        }
        if (this.address.trim() === '') {
            errors.address = 'Укажите адрес доставки';
        }
        if (this.email.trim() === '') {
            errors.email = 'Укажите email';
        }
        if (this.phone.trim() === '') {
            errors.phone = 'Укажите телефон';
        }

        return errors;
    }
}
