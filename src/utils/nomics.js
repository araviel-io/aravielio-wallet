import axios from 'axios';

export function wngetSafePrice() {
    const ApiUrl = 'https://api.nomics.com/v1/currencies/ticker?key=601eff44ab249d337b38cbb045d7b62d&ids=SAFECOIN&interval=1h&convert=USD&per-page=5&page=1';
    const promise = axios.get(ApiUrl)
    // using .then, create a new promise which extracts the data
    const dataPromise = promise.then((response) => response.data[0].price);
    return dataPromise
}
