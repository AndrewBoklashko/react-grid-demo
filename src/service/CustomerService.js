
export class CustomerService {

    getCustomersSmall() {
        return fetch('data/customers-small.json').then(res => res.json())
                .then(d => d.data);
    }

    getCustomersMedium() {
        return fetch('data/customers-medium.json').then(res => res.json())
                .then(d => d.data);
    }

    getCustomersLarge() {
        return fetch('data/customers-large.json').then(res => res.json())
                .then(d => {
                    let id = 0;
                    const size = 5_000;
                    const result = []
                    while (result.length < size) {
                        const mapped = d.data.map(x => ({
                            ...x,
                            id: id++,
                            formattedDate: x.date
                        }));
                        result.push(...mapped);
                    }
                    result.length = size;
                    console.log(result[0])
                    return result;
                });
    }

    getCustomersXLarge() {
        return fetch('data/customers-xlarge.json').then(res => res.json())
                .then(d => d.data);
    }

    getCustomers(params) {
        const queryParams = params ? Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&') : '';
        return fetch('https://www.primefaces.org/data/customers?' + queryParams).then(res => res.json())
    }
}
    