import './scss/styles.scss';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/Api/WebLarekApi';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { Products } from './components/Models/Products';
import { API_URL } from './utils/constants';

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

const products = new Products();
const basket = new Basket();
const buyer = new Buyer();

webLarekApi
    .getProducts()
    .then((data) => {
        const items = data.items;

        // Товары
        products.setItems(items);
        console.log('Товары: список товаров', products.getItems());
        if (items.length > 0) {
            console.log('Товары: поиск по id', products.getById(items[0].id));
            products.setSelectedProduct(items[0]);
            console.log('Товары: выбранный товар', products.getSelectedProduct());
        }

        // Корзина
        console.log('Корзина: пустая корзина', basket.getItems());
        if (items.length > 0) {
            basket.addItem(items[0]);
        }

        const noPriceItem = items.find((item) => item.price === null);
        if (noPriceItem) {
            basket.addItem(noPriceItem);
        }

        console.log('Корзина: после добавления', basket.getItems());
        console.log('Корзина: общая сумма', basket.getTotal());
        console.log('Корзина: количество товаров', basket.getCount());
        if (items.length > 0) {
            console.log('Корзина: товар есть?', basket.has(items[0].id));
            basket.removeItem(items[0]);
        }
        console.log('Корзина: после удаления', basket.getItems());
        basket.clear();
        console.log('Корзина: после очистки', basket.getItems());

        // Покупатель
        console.log('Покупатель: ошибки при пустых полях', buyer.validate());
        buyer.setData({
            payment: 'card',
            address: 'Улица 1',
            email: 'a@b.ru',
            phone: '+70000000000',
        });
        console.log('Покупатель: данные после заполнения', buyer.getData());
        console.log('Покупатель: ошибки после заполнения', buyer.validate());
        buyer.clear();
        console.log('Покупатель: ошибки после очистки', buyer.validate());
    })
    .catch((error) => {
        console.error('Ошибка: не удалось загрузить товары', error);
    });
