import { IProduct } from '../../types';
import { CardMedia } from './CardMedia';
import { ICardActions } from './Card';

export type TCardCatalog = Pick<IProduct, 'title' | 'price' | 'image' | 'category'>;

export class CardCatalog extends CardMedia<TCardCatalog> {
    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);
        if (actions?.onClick) {
            this.container.addEventListener('click', actions.onClick);
        }
    }
}
