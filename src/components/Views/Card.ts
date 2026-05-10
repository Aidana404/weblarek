import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { categoryMap, CDN_URL } from '../../utils/constants';

export { categoryMap };
export type CategoryKey = keyof typeof categoryMap;

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

// Промежуточный класс для карточек с изображением и категорией (каталог и превью)
export abstract class CardMedia<T extends object> extends Card<T> {
    protected imageElement: HTMLImageElement;
    protected categoryElement: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
    }

    set category(value: string) {
        this.categoryElement.textContent = value;
        for (const key in categoryMap) {
            this.categoryElement.classList.toggle(
                categoryMap[key as CategoryKey],
                key === value
            );
        }
    }

    set image(value: string) {
        this.setImage(this.imageElement, CDN_URL + value, this.titleElement.textContent ?? '');
    }
}
