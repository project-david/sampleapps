const fetch = require('node-fetch');
require('dotenv').config();

class PDClient {
    constructor() {
        this.systemToken = process.env.PARTNER_SYSTEM_TOKEN;
        this.sessionToken = null;
        this.appId = process.env.PARTNER_APP_ID;
        this.superOrgId = process.env.PARTNER_SUPER_ORG_ID;
        this.headers = null;
        this.showHeaders = false;
        this.inited = false;
    }
    init() {
        // get session token
        const url = `${process.env.PRAHARI_BASE_URL}/entities/SystemToken/sessionToken`;
        const headers = {
            Authorization: `Bearer ${this.systemToken}`,
            'X-PRAHARI-APPID': this.appId,
            'X-PRAHARI-ORGID': this.superOrgId,
            'Content-Type': 'application/json'
        };
        return fetch(url, { method: 'POST', headers, body: `{"token": "${this.systemToken}"}`})
            .then(res => res.json())
            .then(json => {
                this.sessionToken = json.result.sessionToken;
                this.headers = { ...headers, Authorization: `Bearer ${this.sessionToken}` };
                this.inited = true;
                return true;
            });
    }
    listCustomers(callback, options) {
        let first = false;
        const wc = []; // wc => where clause
        if (options.id) wc.push(`id=${options.id}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Customer` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, callback, first, this.showHeaders));
    }

    listClients(callback, options) {
        let first = false;
        const wc = []; // wc => where clause
        if (options.id) { wc.push(`id=${options.id}`); first = true; }
        if (options.customer) wc.push(`customer.id=${options.customer}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Client` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, callback, first, this.showHeaders));
    }
    listMatters(callback, options) {
        let first = false;
        const wc = []; // wc => where clause
        if (options.id) { wc.push(`id=${options.id}`); first = true; }
        if (options.client) wc.push(`client.id=${options.client}`);
        if (options.customer) wc.push(`client.customer.id=${options.customer}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Matter` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, callback, first, this.showHeaders));
    }

    listInvoices(callback, options) {
        let first = false;
        const wc = []; // wc => where clause
        if (options.id) { wc.push(`id=${options.id}`); first = true; }
        if (options.client) wc.push(`client.id=${options.client}`);
        if (options.customer) wc.push(`client.customer.id=${options.customer}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Invoice` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, callback, first, this.showHeaders));
    }

    listPaylinks(callback, options) {
        let first = false;
        const wc = []; // wc => where clause
        if (options.id) {
            first= true; 
            wc.push(`id=${options.id}`); 
            wc.push('select=paymentTxns,customer,client');
        }
        if (options.client) wc.push(`client.id=${options.client}`);
        if (options.customer) wc.push(`client.customer.id=${options.customer}`);
        if (options.matter) wc.push(`invoice.matter.id=${options.matter}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Paylink` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, callback, first, this.showHeaders));
    }

    createCustomer(callback, options) {
        const body = options2Body(callback, options, ['name'], ['externalId']);
        if (!body) return;
        body.appId = this.appId;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Customer`, this.headers, body, callback, this.showHeaders));
    }

    createClient(callback, options) {
        const body = options2Body(callback, options, ['firstName', 'customer'], ['lastName', 'email', 'externalId']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Client`, this.headers, body, callback, this.showHeaders));
    }

    createMatter(callback, options) {
        const body = options2Body(callback, options, ['name', 'client'], ['externalId']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Matter`, this.headers, body, callback, this.showHeaders));
    }

    createInvoice(callback, options) {
        const body = options2Body(callback, options, ['name', 'client'], ['matter', 'externalId']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Invoice`, this.headers, body, callback, this.showHeaders));
    }

    createPaylink(callback, options) {
        const body = options2Body(callback, options, ['client', 'customer', 'amount'],
            ['trustAmount', 'matter', 'externalId', 'paymentTitle', 'paymentDescription']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Paylink`, this.headers, body, callback, this.showHeaders));
    }
    invoke(fn) {
        this.inited ? fn() : this.init().then(response => fn());
    }
}

function syncGet(url, headers, callback, first, showHeaders) {
    if (showHeaders) {
        console.log('\x1b[32m%s\x1b[0m', `> GET ${url}`);
        console.log('\x1b[32m%s\x1b[0m', Object.keys(headers).map(k => `> ${k}: ${headers[k]}`).join('\n'));
    }
    fetch(url, { method: 'GET', headers })
        .then(res => { 
            if (showHeaders) {
                console.log();
                console.log('\x1b[35m%s\x1b[0m', `< ${res.status} ${res.statusText}`);
                const headers = res.headers.raw();
                console.log('\x1b[35m%s\x1b[0m', Object.keys(headers).map(k => `< ${k}=${headers[k]}`).join('\n'));
            }
            return res.json();
        })
        .then(json => json.result ? callback(null, first ? json.result.records[0] : json.result) : callback(null, `PDError:: ${json.error}`))
        .catch(error => callback(null, error));
}
function syncPost(url, headers, body, callback, showHeaders) {
    if (showHeaders) {
        console.log('\x1b[32m%s\x1b[0m', `> POST ${url}`);
        console.log('\x1b[32m%s\x1b[0m', Object.keys(headers).map(k => `> ${k}: ${headers[k]}`).join('\n'));
        console.log('\x1b[32m%s\x1b[0m', JSON.stringify(body, null, 2));
    }
    fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
        .then(res => {
            if (showHeaders) {
                console.log();
                console.log('\x1b[35m%s\x1b[0m', `< ${res.status} ${res.statusText}`);
                const headers = res.headers.raw();
                console.log('\x1b[35m%s\x1b[0m', Object.keys(headers).map(k => `< ${k}=${headers[k]}`).join('\n'));
            }
            return res.json();
        })
        .then(json => json.result ? callback(null, json.result) : callback(null, `PDError:: ${json.error}`))
        .catch(error => callback(null, error));
}

function options2Body(callback, options, mandatoryProps, optionalProps) {
    const body = {};
    for (const prop of mandatoryProps) {
        if (!options[prop]) {
            callback(null, `Error:: Missing mandatory option: ${prop}`);
            return null;
        }
        body[mapOptionName2Prop(prop)] = options[prop];
    }
    for (const prop of optionalProps) {
        if (options[prop]) {
            body[mapOptionName2Prop(prop)] = options[prop];
        }
    }
    return body;
}

function mapOptionName2Prop(optionName) {
    switch (optionName) {
        case 'amount':
            return 'mainAmountToBePaid';
        case 'trustAmount':
            return 'secondaryAmountToBePaid';
        default:
    }
    return optionName;
}
module.exports = new PDClient();