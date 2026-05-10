import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Basket {
    private items: IProduct[] = [];

    constructor(private events: IEvents) {}

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        if (product.price !== null) {
            this.items.push(product);
            this.events.emit('basket:changed');
        }
    }

    removeItem(product: IProduct): void {
        this.items = this.items.filter((item) => item.id !== product.id);
        this.events.emit('basket:changed');
    }

    clear(): void {
        this.items = [];
        this.events.emit('basket:changed');
    }

    getTotal(): number {
        let total = 0;
        for (const item of this.items) {
            if (item.price !== null) {
                total = total + item.price;
            }
        }
        return total;
    }

    getCount(): number {
        return this.items.length;
    }

    has(id: string): boolean {
        for (const item of this.items) {
            if (item.id === id) {
                return true;
            }
        }
        return false;
    }
}
