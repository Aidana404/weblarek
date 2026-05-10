import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export class BasketView extends Component<IBasketView> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected checkoutButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.checkoutButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.checkoutButton.addEventListener('click', () => {
            this.events.emit('basket:checkout');
        });
    }

    set items(nodes: HTMLElement[]) {
        if (nodes.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'Корзина пуста';
            this.listElement.replaceChildren(empty);
            this.checkoutButton.disabled = true;
        } else {
            this.listElement.replaceChildren(...nodes);
            this.checkoutButton.disabled = false;
        }
    }

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }
}
