import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IProduct } from '../../types';

export type TCardData = Pick<IProduct, 'title' | 'category' | 'price' | 'image'>;

export interface ICardActions {
    onClick?: () => void;
}

export abstract class Card<T extends object> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
    }
}
