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
import { OrderForm } from './components/Views/OrderForm';
import { ContactsForm } from './components/Views/ContactsForm';
import { OrderSuccess } from './components/Views/OrderSuccess';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { BuyerFieldErrors, IProduct, TPayment } from './types';

// Инфраструктура

const events = new EventEmitter();
const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

// Модели

const products = new Products(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

// View - создаются один раз

const header = new Header(events, ensureElement<HTMLElement>('.header'));
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
const basketView = new BasketView(events, cloneTemplate('#basket'));
const orderForm = new OrderForm(events, cloneTemplate<HTMLFormElement>('#order'));
const contactsForm = new ContactsForm(events, cloneTemplate<HTMLFormElement>('#contacts'));
const successView = new OrderSuccess(events, cloneTemplate('#success'));

// Презентер: подписки на события

// Каталог загружен - отрисовать галерею
events.on<{ items: IProduct[] }>('products:changed', ({ items }) => {
    const cards = items.map((product) => {
        const card = new CardCatalog(cloneTemplate('#card-catalog'), {
            onClick: () => events.emit('card:select', { product }),
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

// Клик по карточке каталога - показать товар
events.on<{ product: IProduct }>('card:select', ({ product }) => {
    products.setSelectedProduct(product);
});

// Корзина изменилась - обновить счётчик и перерисовать корзину
events.on('basket:changed', () => {
    header.render({ counter: basket.getCount() });
    const cards = basket.getItems().map((product, index) => {
        const card = new CardBasket(cloneTemplate('#card-basket'), {
            onClick: () => events.emit('card:remove', { product }),
        });
        return card.render({ title: product.title, price: product.price, index: index + 1 });
    });
    basketView.render({ items: cards, total: basket.getTotal() });
});

// Товар выбран - открыть превью
events.on<{ product: IProduct }>('product:selected', ({ product }) => {
    const inBasket = basket.has(product.id);
    const unavailable = product.price === null;
    const card = new CardPreview(cloneTemplate('#card-preview'), {
        onClick: () => events.emit('card:toggle', { product }),
    });
    modal.render({
        content: card.render({
            title: product.title,
            category: product.category,
            price: product.price,
            image: product.image,
            description: product.description,
            buttonDisabled: unavailable,
            buttonText: unavailable ? 'Недоступно' : inBasket ? 'Убрать из корзины' : 'В корзину',
        }),
    });
    modal.open();
});

// Кнопка «В корзину»/«Убрать» в превью - добавить или убрать товар
events.on<{ product: IProduct }>('card:toggle', ({ product }) => {
    if (basket.has(product.id)) {
        basket.removeItem(product);
    } else {
        basket.addItem(product);
    }
    modal.close();
});

// Кнопка удаления в корзине - убрать товар
events.on<{ product: IProduct }>('card:remove', ({ product }) => {
    basket.removeItem(product);
});

// Открыть корзину - корзина уже актуальна из basket:changed, берём пустым рендером
events.on('basket:open', () => {
    modal.render({ content: basketView.render() });
    modal.open();
});

// Перейти к оформлению - форма обновится через buyer:changed после buyer.clear()
events.on('basket:checkout', () => {
    buyer.clear();
    modal.render({ content: orderForm.render() });
});

// Данные покупателя изменились - перерисовываем обе формы со всеми полями
events.on<{ payment: TPayment | null; address: string; email: string; phone: string; errors: BuyerFieldErrors }>(
    'buyer:changed',
    ({ payment, address, email, phone, errors }) => {
        orderForm.render({
            payment,
            address,
            valid: !errors.payment && !errors.address,
            errors: [errors.payment, errors.address].filter(Boolean).join(', '),
        });
        contactsForm.render({
            email,
            phone,
            valid: !errors.email && !errors.phone,
            errors: [errors.email, errors.phone].filter(Boolean).join(', '),
        });
    }
);

// Выбор способа оплаты - сохранить, форма обновится через buyer:changed
events.on<{ payment: TPayment }>('order:payment', ({ payment }) => {
    buyer.setData({ payment });
});

// Ввод адреса - сохранить, форма обновится через buyer:changed
events.on<{ field: string; value: string }>('order:input', ({ field, value }) => {
    buyer.setData({ [field]: value } as Parameters<typeof buyer.setData>[0]);
});

// Форма заказа отправлена - форма контактов уже актуальна, берём пустым рендером
events.on('order:submit', () => {
    modal.render({ content: contactsForm.render() });
});

// Ввод email/телефона - сохранить, форма обновится через buyer:changed
events.on<{ field: string; value: string }>('contacts:input', ({ field, value }) => {
    buyer.setData({ [field]: value } as Parameters<typeof buyer.setData>[0]);
});

// Отправка контактов - оформить заказ
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
            modal.render({ content: successView.render({ total }) });
        })
        .catch((error) => {
            console.error('Ошибка при оформлении заказа:', error);
        });
});

// Закрыть по кнопке «За новыми покупками»
events.on('success:close', () => {
    modal.close();
});

// Загрузка данных

webLarekApi
    .getProducts()
    .then((data) => {
        products.setItems(data.items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки товаров:', error);
    });
