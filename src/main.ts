import './scss/styles.scss';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/base/WebLarekApi';
import { Buyer } from './components/Models/Buyer';
import { Products } from './components/Models/Products';
import { API_URL } from './utils/constants';

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

const products = new Products();
const buyer = new Buyer();

webLarekApi.getProducts().then((data) => {
    const items = data.items;
    products.setItems(items);
    console.log(products.getItems());
});

console.log(buyer.validate());

buyer.setData({
    payment: 'card',
    address: 'Улица 1',
    email: 'a@b.ru',
    phone: '+70000000000',
});

console.log(buyer.getData());
console.log(buyer.validate());
