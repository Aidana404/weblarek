import type { IProduct } from '../../types';

export class Products {
    private items: IProduct[] = [];
    private selectedProduct: IProduct | null = null;

    setItems(items: IProduct[]): void {
        this.items = items;
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
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}
