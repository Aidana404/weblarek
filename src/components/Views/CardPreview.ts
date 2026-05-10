import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { CardMedia } from './CardMedia';
import { ICardActions } from './Card';

export interface ICardPreview extends Pick<IProduct, 'title' | 'price' | 'image' | 'category' | 'description'> {
    buttonText: string;
    buttonDisabled: boolean;
}

export class CardPreview extends CardMedia<ICardPreview> {
    protected descriptionElement: HTMLElement;
    protected actionButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.actionButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

        if (actions?.onClick) {
            this.actionButton.addEventListener('click', actions.onClick);
        }
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set buttonText(value: string) {
        this.actionButton.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.actionButton.disabled = value;
    }
}
