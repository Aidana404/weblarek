import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Products {
    private items: IProduct[] = [];
    private selectedProduct: IProduct | null = null;

    constructor(private events: IEvents) {}

    setItems(items: IProduct[]): void {
        this.items = items;
        this.events.emit('products:changed', { items: this.items });
    }

    getItems(): IProduct[] {
        return this.items;
    }

    getById(id: string): IProduct | undefined {
        for (const item of this.items) {
            if (item.id === id) {
                return item;
            }
        }
        return undefined;
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.events.emit('product:selected', { product });
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}
