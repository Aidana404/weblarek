import './scss/styles.scss';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekApi } from './components/Api/WebLarekApi';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { Products } from './components/Models/Products';
import { Header } from './components/Views/Header';
import { Gallery } from './components/Views/Gallery';
import { Modal } from './components/Views/Modal';
import { CardCatalog } from './components/Views/CardCatalog';
import { CardPreview } from './components/Views/CardPreview';
import { CardBasket } from './components/Views/CardBasket';
import { BasketView } from './components/Views/BasketView';
import { OrderForm, ContactsForm } from './components/Views/Form';
import { OrderSuccess } from './components/Views/OrderSuccess';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IProduct } from './types';

// ── Инфраструктура ──────────────────────────────────────────────────────────

const events = new EventEmitter();
const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

// ── Модели ───────────────────────────────────────────────────────────────────

const products = new Products(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

// ── Постоянные View ───────────────────────────────────────────────────────────

const header = new Header(events, ensureElement<HTMLElement>('.header'));
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));

// ── Презентер: подписки на события ───────────────────────────────────────────

// Каталог загружен — отрисовать галерею и счётчик
events.on<{ items: IProduct[] }>('products:changed', ({ items }) => {
    const cards = items.map((product) => {
        const card = new CardCatalog(cloneTemplate('#card-catalog'), {
            onClick: () => products.setSelectedProduct(product),
        });
        return card.render({
            title: product.title,
            category: product.category,
            price: product.price,
            image: product.image,
        });
    });
    gallery.render({ catalog: cards });
});

// Корзина изменилась — обновить счётчик и перерисовать корзину если она открыта
events.on('basket:changed', () => {
    header.render({ counter: basket.getCount() });
    if (activeBasketView) {
        const cards = basket.getItems().map((product, index) => {
            const card = new CardBasket(cloneTemplate('#card-basket'), {
                onClick: () => basket.removeItem(product),
            });
            return card.render({ title: product.title, price: product.price, index: index + 1 });
        });
        activeBasketView.render({ items: cards, total: basket.getTotal() });
    }
});

// Клик на карточку в каталоге — открыть превью
events.on<{ product: IProduct }>('product:selected', ({ product }) => {
    const card = new CardPreview(cloneTemplate('#card-preview'), {
        onClick: () => {
            if (basket.has(product.id)) {
                basket.removeItem(product);
            } else {
                basket.addItem(product);
            }
            modal.close();
        },
    });
    modal.render({
        content: card.render({
            title: product.title,
            category: product.category,
            price: product.price,
            image: product.image,
            description: product.description,
            inBasket: basket.has(product.id),
        }),
    });
    modal.open();
});

// Открыть корзину
events.on('basket:open', () => {
    activeBasketView = new BasketView(events, cloneTemplate('#basket'));
    const cards = basket.getItems().map((product, index) => {
        const card = new CardBasket(cloneTemplate('#card-basket'), {
            onClick: () => basket.removeItem(product),
        });
        return card.render({ title: product.title, price: product.price, index: index + 1 });
    });
    modal.render({
        content: activeBasketView.render({ items: cards, total: basket.getTotal() }),
    });
    modal.open();
});

// Ссылки на активные компоненты для обновления после событий
let activeBasketView: BasketView | null = null;
let activeOrderForm: OrderForm | null = null;
let activeContactsForm: ContactsForm | null = null;
let selectedPayment: 'card' | 'cash' | null = null;

// Перейти к оформлению — открытие модального окна
events.on('basket:checkout', () => {
    buyer.clear();
    selectedPayment = null;
    activeOrderForm = new OrderForm(events, cloneTemplate<HTMLFormElement>('#order'));
    modal.render({
        content: activeOrderForm.render({
            valid: false,
            errors: 'Выберите способ оплаты и укажите адрес',
            payment: null,
            address: '',
        }),
    });
});

// Выбор способа оплаты — только сохраняем данные, ререндер будет в buyer:changed
events.on<{ payment: 'card' | 'cash' }>('order:payment', ({ payment }) => {
    selectedPayment = payment;
    buyer.setData({ payment });
});

// Ввод адреса — только сохраняем данные, ререндер будет в buyer:changed
events.on<{ field: string; value: string }>('order:input', ({ field, value }) => {
    buyer.setData({ [field]: value } as Parameters<typeof buyer.setData>[0]);
});

// Данные покупателя изменились — перерисовываем активную форму
events.on('buyer:changed', () => {
    const errors = buyer.validate();
    if (activeOrderForm) {
        activeOrderForm.render({
            payment: selectedPayment,
            valid: !errors.payment && !errors.address,
            errors: [errors.payment, errors.address].filter(Boolean).join(', '),
        });
    }
    if (activeContactsForm) {
        activeContactsForm.render({
            valid: !errors.email && !errors.phone,
            errors: [errors.email, errors.phone].filter(Boolean).join(', '),
        });
    }
});

// Отправка формы заказа — открытие модального окна с формой контактов
events.on('order:submit', () => {
    activeContactsForm = new ContactsForm(events, cloneTemplate<HTMLFormElement>('#contacts'));
    modal.render({
        content: activeContactsForm.render({
            valid: false,
            errors: 'Укажите email и телефон',
            email: '',
            phone: '',
        }),
    });
});

// Ввод email/телефона — только сохраняем данные, ререндер будет в buyer:changed
events.on<{ field: string; value: string }>('contacts:input', ({ field, value }) => {
    buyer.setData({ [field]: value } as Parameters<typeof buyer.setData>[0]);
});

// Отправка контактов — оформить заказ
events.on('contacts:submit', () => {
    const buyerData = buyer.getData();
    const order = {
        ...buyerData,
        total: basket.getTotal(),
        items: basket.getItems().map((p) => p.id),
    };

    webLarekApi
        .createOrder(order)
        .then(({ total }) => {
            basket.clear();
            buyer.clear();
            const success = new OrderSuccess(events, cloneTemplate('#success'));
            modal.render({ content: success.render({ total }) });
        })
        .catch((error) => {
            console.error('Ошибка при оформлении заказа:', error);
        });
});

// Закрыть модальное окно — сбросить ссылки на активные компоненты
events.on('modal:close', () => {
    modal.close();
    activeBasketView = null;
    activeOrderForm = null;
    activeContactsForm = null;
});

// Закрыть по кнопке «За новыми покупками»
events.on('success:close', () => {
    modal.close();
});

// ── Загрузка данных ───────────────────────────────────────────────────────────

webLarekApi
    .getProducts()
    .then((data) => {
        products.setItems(data.items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки товаров:', error);
    });
