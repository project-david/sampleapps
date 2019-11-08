const fetch = require('node-fetch');
require('dotenv').config();

class PDClient {
    constructor() {
        this.systemToken = process.env.PARTNER_SYSTEM_TOKEN;
        this.sessionToken = null;
        this.appId = process.env.PARTNER_APP_ID;
        this.superOrgId = process.env.PARTNER_SUPER_ORG_ID;
        this.headers = null;
        this.showMessages = false;
        this.inited = false;
    }
    async init() {
        this.headers = {
            Authorization: `Bearer ${this.systemToken}`,
            'X-PRAHARI-APPID': this.appId,
            'X-PRAHARI-ORGID': this.superOrgId,
            'Content-Type': 'application/json'
        };
        this.inited = true;
        return null;
    }
    listCustomers(callback, options) {
        const wc = []; // wc => where clause
        if (options.id) wc.push(`id=${options.id}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Customer` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, (json) => {
            if (json.error) {
                console.log('API Error:', json.error);
            } else {
                console.log(`${padL('customer id', 36)}  ${padL('Name', 16)}  ${padL('CC', 5)}  ${padL('ACH', 5)}  ${padL('Processor', 10)} `);
                console.log(`${repChar('-', 36)}  ${repChar('-', 16)}  ${repChar('-', 5)}  ${repChar('-', 5)}  ${repChar('-', 10)} `);
                for (const rec of json.result.records) {
                    console.log(`${padL(rec.id, 36)}  ${padL(rec.name, 16)}  ${padL(rec.ccEnabled, 5)}  ${padL(rec.achEnabled, 5)}  `
                        + `${padL(rec.processor, 10)} `);
                }
            }
            callback(null);
        }, this.showMessages));
    }

    listClients(callback, options) {
        const wc = []; // wc => where clause
        if (options.id) { wc.push(`id=${options.id}`); first = true; }
        if (options.customer) wc.push(`customer.id=${options.customer}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Client` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, (json) => {
            if (json.error) {
                console.log('API Error:', json.error);
            } else {
                console.log(`${padL('client id', 36)}  ${padL('name', 16)}  ${padL('email', 20)}  ${padL('status', 8)}  ${padL('customer name', 16)} `);
                console.log(`${repChar('-', 36)}  ${repChar('-', 16)}  ${repChar('-', 20)}  ${repChar('-', 8)}  ${repChar('-', 16)} `);
                for (const rec of json.result.records) {
                    console.log(`${padL(rec.id, 36)}  ${padL(rec.firstName + ' ' + rec.lastName, 16)}  ${padL(rec.email, 20)}  `
                        + `${padL(rec.status, 8)}  ${padL(rec.customer.name, 16)} `);
                }
            }
            callback(null);
        }, this.showMessages));
    }
    listMatters(callback, options) {
        const wc = []; // wc => where clause
        if (options.id) { wc.push(`id=${options.id}`); first = true; }
        if (options.client) wc.push(`client.id=${options.client}`);
        if (options.customer) wc.push(`client.customer.id=${options.customer}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Matter` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, (json) => {
            if (json.error) {
                console.log('API Error:', json.error);
            } else {
                console.log(`${padL('matter id', 36)}  ${padL('name', 20)}  ${padL('display id', 10)}  ${padL('status', 8)}  `
                    + `${padL('client name', 16)}  ${padL('customer name', 16)}`);
                console.log(`${repChar('-', 36)}  ${repChar('-', 20)}  ${repChar('-', 10)}  ${repChar('-', 8)}  ${repChar('-', 16)}  ${repChar('-', 16)}`);
                for (const rec of json.result.records) {
                    const clientName = rec.client.firstName + ' ' + rec.client.lastName;
                    console.log(`${padL(rec.id, 36)}  ${padL(rec.name, 20)}  ${padL(rec.displayId, 10)}  `
                        + `${padL(rec.status, 8)}  ${padL(clientName, 16)}  ${padL(rec.client.customer.name, 16)}`);
                }
            }
            callback(null);
        }, this.showMessages));
    }

    listPaylinks(callback, options) {
        const wc = []; // wc => where clause
        wc.push('select=customer,client');
        if (options.id) wc.push(`id=${options.id}`); 
        if (options.client) wc.push(`client.id=${options.client}`);
        if (options.customer) wc.push(`customer.id=${options.customer}`);
        if (options.matter) wc.push(`matter.id=${options.matter}`);
        if (options.externalId) wc.push(`externalId=${options.externalId}`);

        const url = `${process.env.PD_BASE_URL}/entities/Paylink` + (wc.length ? '?' + wc.join('&') : '');
        this.invoke(() => syncGet(url, this.headers, (json) => {
            if (json.error) {
                console.log('API Error:', json.error);
            } else {
                console.log(`${padL('paylink id', 36)}  ${padL('amt-outs', 10)}  ${padL('amt-paid', 10)}  ${padL('status', 12)}  `
                    + `${padL('customer name', 16)} `);
                console.log(`${repChar('-', 36)}  ${repChar('-', 10)}  ${repChar('-', 10)}  ${repChar('-', 12)}  ${repChar('-', 16)} `);
                for (const rec of json.result.records) {
                    console.log(`${padL(rec.id, 36)}  ${padL(rec.totalAmountToBePaid, 10)}  ${padL(rec.totalAmountPaid, 10)}  `
                        + `${padL(rec.status, 12)}  ${padL(rec.customer.name, 16)}`);
                }
            }
            callback(null);
        }, this.showMessages));
    }

    createCustomer(callback, options) {
        const body = options2Body(callback, options, ['name'], ['externalId']);
        if (!body) return;
        body.appId = this.appId;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Customer`, this.headers, body, (json) => {
            processCreateResponse('Customer', json, callback);
        }, this.showMessages));
    }

    onboardTestCustomer(callback, options) {
        const body = { ccEnabled: true, achEnabled: true, processor: "mock" };
        const customerId = options.id;

        this.invoke(() =>  syncPatch(`${process.env.PD_BASE_URL}/entities/Customer/${customerId}`, this.headers, body, (json) => {
            if (json.error) {
                console.log('API Error:', json.error); callback(null); return;
            }
            // Invoke entityOp insertTestAuthTokens with { customerId } as input body
            this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/AuthTokens/insertTestAuthTokens`, this.headers, { customerId }, (json) => {
                if (json && json.error) {
                    console.log('API Error:', json.error);
                } else {
                    console.log('Test customer onboarded and ready to accept payments');
                }
                callback(null);
            }, this.showMessages));
        }, this.showMessages));
    }

    createClient(callback, options) {
        const body = options2Body(callback, options, ['firstName', 'customer'], ['lastName', 'email', 'externalId']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Client`, this.headers, body, (json) => {
            processCreateResponse('Client', json, callback);
        }, this.showMessages));
    }

    createMatter(callback, options) {
        const body = options2Body(callback, options, ['name', 'client'], ['externalId']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Matter`, this.headers, body, (json) => {
            processCreateResponse('Matter', json, callback);
        }, this.showMessages));
    }

    createPaylink(callback, options) {
        const body = options2Body(callback, options, ['client', 'customer', 'amount'],
            ['trustAmount', 'matter', 'externalId', 'paymentTitle', 'paymentDescription']);
        if (!body) return;
        this.invoke(() =>  syncPost(`${process.env.PD_BASE_URL}/entities/Paylink`, this.headers, body, (json) => {
            processCreateResponse('Paylink', json, callback);
        }, this.showMessages));
    }
    invoke(fn) {
        this.inited ? fn() : this.init().then(response => fn());
    }
}

function syncGet(url, headers, processResponse, showMessages) {
    if (showMessages) showRequestMessage('GET', url, headers, null);
    fetch(url, { method: 'GET', headers })
        .then(res => { 
            if (showMessages) showResponseMessage(res);
            return res.json();
        })
        .then(json => processResponse(json))
        .catch(error => callback(null, error));
}

function syncPost(url, headers, body, processResponse, showMessages) {
    if (showMessages) showRequestMessage('POST', url, headers, body);
    fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
        .then(res => {
            if (showMessages) showResponseMessage(res);
            return res.json();
        })
        .then(json => processResponse(json))
        .catch(error => callback(null, error));
}

function syncPatch(url, headers, body, processResponse, showMessages) {
    if (showMessages) showRequestMessage('PATCH', url, headers, body);
    fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body) })
        .then(res => {
            if (showMessages) showResponseMessage(res);
            return res.json();
        })
        .then(json => processResponse(json))
        .catch(error => callback(null, error));
}

function showRequestMessage(method, url, headers, body) {
    console.log('\x1b[32m%s\x1b[0m', `> ${method} ${url}`);
    console.log('\x1b[32m%s\x1b[0m', Object.keys(headers).map(k => `> ${k}: ${headers[k]}`).join('\n'));
    console.log('\x1b[32m%s\x1b[0m', JSON.stringify(body, null, 2));
}

function showResponseMessage(res) {
    console.log();
    console.log('\x1b[35m%s\x1b[0m', `< ${res.status} ${res.statusText}`);
    const headers = res.headers.raw();
    console.log('\x1b[35m%s\x1b[0m', Object.keys(headers).map(k => `< ${k}=${headers[k]}`).join('\n'));
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

function processCreateResponse(entity, json, callback) {
    if (json) {
        if (json.error) {
            console.log('API Error:', json.error);
        } else {
            console.log(`${entity} created: `, json.result.id);
        }
    } else {
        console.log('Empty response. SOmething went wrong!!');
    }
    callback(null);
}

const blanks1 = '                                       ';
const blanks = blanks1 + blanks1 + blanks1 + blanks1; // sufficient for all padding.
function padL(arg, width) {
    if (typeof(arg) === 'boolean') {
        arg = arg ? 'YES' : 'NO';
    } else if (typeof(arg) === 'number') {
        arg = '' + arg;
    }
    return arg.length < width ? blanks.substring(0, width - arg.length) + arg : arg.substring(arg.length - width);
}

function repChar(ch, times) {
    const chars = [];
    for (let i = 0; i < times; i++) chars[i] = ch;
    return chars.join('');
}
module.exports = new PDClient();