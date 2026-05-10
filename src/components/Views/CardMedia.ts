import { ensureElement } from '../../utils/utils';
import { Card } from './Card';
import { categoryMap, CDN_URL } from '../../utils/constants';

export type CategoryKey = keyof typeof categoryMap;

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
