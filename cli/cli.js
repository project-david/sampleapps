const program = require('commander');
const fetch = require('node-fetch');
require('dotenv').config();

program.version('0.0.1');

const REQD_ENV_VARS = [
    'ENV_URL',
    'PRAHARI_BASE_URL', 
    'SYSTEM_TOKEN',
    'APP_ID',
    'ORG_ID'
]
const GlobalOptions = {
    envUrl: process.env.ENV_URL,
    prahariBaseUrl: process.env.PRAHARI_BASE_URL,
    showMessages: process.env.SHOW_MESSAGES ? true : false,
    headers: {
        Authorization: `Bearer ${process.env.SYSTEM_TOKEN}`,
        'X-PRAHARI-APPID': process.env.APP_ID,
        'X-PRAHARI-ORGID': process.env.ORG_ID,
        'Content-Type': 'application/json'
    }
};

program
    .name('node cli.js')
    .description('Gravity Legal command line interface tool')

program
    .command('get <entity>')
    .option('-i, --id [id]', 'entity Id')
    .option('-s, --select [cspns]', 'comma separate property names')
    .option('-q, --query [where_clause]', 'where clause expression')
    .description('retrieve entity by id or query expr.')
    .action(wrap(getHandler));

program
    .command('create <entity>')
    .option('-b, --body <body>', 'entity body')
    .description('create entity')
    .action(wrap(createHandler));

program
    .command('update <entity>')
    .option('-i, --id <id>', 'entity Id')
    .option('-b, --body <body>', 'entity body')
    .description('update entity')
    .action(wrap(updateHandler));

program
    .command('eop <entity>')
    .option('-o, --op <op>', 'operation')
    .option('-b, --body <body>', 'entity op body')
    .description('invoke entity op')
    .action(wrap(entityOpHandler));

program
    .command('iop <entity>')
    .option('-i, --id <id>', 'entity Id')
    .option('-o, --op <op>', 'operation')
    .option('-b, --body <body>', 'instance op body')
    .description('invoke instance op')
    .action(wrap(instanceOpHandler));

program
    .command('sop <operation>')
    .option('-b, --body <body>', 'op body')
    .description('invoke standalone operation')
    .action(wrap(standaloneOpHandler));


program.parse(process.argv);
if (program.args.length === 0) {
    program.help();
}
// Helper classes and functions
async function http(method, url, body) {
    if (GlobalOptions.showMessages) showRequestMessage(method, url, GlobalOptions.headers, body);
    const payload = { method, headers: GlobalOptions.headers };
    if (body) payload.body = body;
    const res = await fetch(url, payload);
    if (GlobalOptions.showMessages) showResponseMessage(res);
    const json = await res.json();
    return json;
}

function showRequestMessage(method, url, headers, body) {
    console.log('\x1b[32m%s\x1b[0m', `> ${method} ${url}`);
    console.log('\x1b[32m%s\x1b[0m', Object.keys(headers).map(k => `> ${k}: ${headers[k]}`).join('\n'));
    if (body) console.log('\x1b[32m%s\x1b[0m', JSON.stringify(body, null, 2));
}

function showResponseMessage(res) {
    console.log();
    console.log('\x1b[35m%s\x1b[0m', `< ${res.status} ${res.statusText}`);
    const headers = res.headers.raw();
    console.log('\x1b[35m%s\x1b[0m', Object.keys(headers).map(k => `< ${k}=${headers[k]}`).join('\n'));
}

function show(result) {
    console.log(JSON.stringify(result, null, 2));
}

function wrap(handler) {
    return async function(entity, options) {
        try {
            await handler.call(null, entity, options);
        } catch (err) {
            console.log('Error:', err.message);
        }
    }
}

function checkEnv() {
    for (const envVar of REQD_ENV_VARS) {
        if (!process.env[envVar]) {
            console.log('Env. var. not found:', envVar);
        }
    }
}
// Handlers
async function getHandler(entity, options) {
    let url = `${GlobalOptions.envUrl}/entities/${entity}`;
    if (options.id) {
        url = `${url}/${options.id}`;
        if (options.select) url = `${url}?select=${options.select}`;
    } else {
        if (options.select) {
            url = `${url}?select=${options.select}`;
            if (options.query) url = `${url}&${options.query}`;
        } else {
            if (options.query) url = `${url}?${options.query}`;
        }
    }

    const result = await http('GET', url);
    show(result);
}

async function createHandler(entity, options) {
    let url = `${GlobalOptions.envUrl}/entities/${entity}`;
    const body = options.body ? options.body : '{}';

    const result = await http('POST', url, body);
    show(result);
}

async function updateHandler(entity, options) {
}

async function instanceOpHandler(entity, options) {
    let url = `${GlobalOptions.envUrl}/entities/${entity}/${options.id}/${options.op}`;
    const body = options.body ? options.body : '{}';

    const result = await http('POST', url, body);
    show(result);
}

async function entityOpHandler(entity, options) {
    let url = `${GlobalOptions.envUrl}/entities/${entity}/${options.op}`;
    const body = options.body ? options.body : '{}';

    const result = await http('POST', url, body);
    show(result);
}

async function standaloneOpHandler(operation, options) {
    let url = `${GlobalOptions.envUrl}/operations/${operation}`;
    const body = options.body ? options.body : '{}';

    const result = await http('POST', url, body);
    show(result);
}
