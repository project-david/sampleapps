const repl = require('repl');
const pdClient = require('./PDClient');
const program = require('commander');

let callback = null;
program.version('0.1.0');

program
    .command('help [cmdName]') // don't exit on help
    .description(`Prints help message.`)
    .action((cmdName) => {
        if (cmdName) {
            const commands = program.commands.filter(c => c._name === cmdName);
            if (commands.length) {
                commands[0].outputHelp();
                callback(null);
                return;
            } else {
                console.log('No such command: ', cmdName);
            }
        }
        program.outputHelp();
        callback(null);
    });
/*
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

program
    .command('sleep <secs>')
    .description('sleeps for <secs> seconds')
    .action(function(secs, options){
        const ms = Number(secs)*1000;
        const p = sleep(ms);
        p.then(response => callback(null, response)).catch(error => console.log('error: ', error));;
    });
*/
program
    .command('list-customers')
    .description('lists Project David Customer entities')
    .option('-i, --id [customerId]', 'customer id (in Project David)')
    .option('-e, --externalId [externalId]', 'customer id (in local system)')
    .action(function(options){
        pdClient.listCustomers(callback, options);
    });

program
    .command('list-clients')
    .description('lists Project David Client entities')
    .option('-c, --customer [customerId]', 'customer id (in Project David)')
    .option('-i, --id [clientId]', 'client id (in Project David)')
    .option('-e, --externalId [externalId]', 'client id (in local system)')
    .action(function(options){
        pdClient.listClients(callback, options);
    });

program
    .command('list-matters')
    .description('lists Project David Matter entities')
    .option('-c, --customer [customerId]', 'customer id (in Project David)')
    .option('-t, --client [clientId]', 'client id (in Project David)')
    .option('-i, --id [matterId]', 'matter id (in Project David)')
    .option('-e, --externalId [externalId]', 'matter id (in local system)')
    .action(function(options){
        pdClient.listMatters(callback, options);
    });

program
    .command('list-invoices')
    .description('lists Project David Invoices entities')
    .option('-c, --customer [customerId]', 'customer id (in Project David)')
    .option('-t, --client [clientId]', 'client id (in Project David)')
    .option('-i, --id [invoiceId]', 'invoice id (in Project David)')
    .option('-e, --externalId [externalId]', 'matter id (in local system)')
    .action(function(options){
        pdClient.listInvoices(callback, options);
    });

program
    .command('list-paylinks')
    .description('lists Project David Paylink entities')
    .option('-c, --customer [customerId]', 'customer id (in Project David)')
    .option('-i, --id [paylinkId]', 'paylink id (in Project David)')
    .option('-e, --externalId [externalId]', 'reference id (in local system)')
    .option('-t, --client [clientId]', 'client id (in Project David)')
    .option('-m, --matter [matterId]', 'matter id (in Project David)')
    .action(function(options){
        pdClient.listPaylinks(callback, options);
    });

program
    .command('create-customer')
    .description('creates Customer entity in Project David')
    .option('-n, --name <name>', 'customer name')
    .option('-e, --externalId [externalId]', 'customer id in Partner s/w')
    .action(function(options) {
        pdClient.createCustomer(callback, options);
    });

program
    .command('create-client')
    .description('creates Client entity in Project David')
    .option('-f, --firstName <firstName>', 'first name')
    .option('-l, --lastName [lastName]', 'last name')
    .option('-m, --email [email]', 'email')
    .option('-c, --customer <customerId>', 'customer id (in Project David)')
    .option('-e, --externalId [externalId]', 'client id in Partner s/w')
    .action(function(options) {
        pdClient.createClient(callback, options);
    });

program
    .command('create-matter')
    .description('creates Client entity in Project David')
    .option('-n, --name <name>', 'matter name')
    .option('-t, --client <clientId>', 'client id (in Project David)')
    .option('-e, --externalId [externalId]', 'matter id in Partner s/w')
    .action(function(options) {
        pdClient.createMatter(callback, options);
    });

program
    .command('create-invoice')
    .description('creates Invoice entity in Project David')
    .option('-n, --name <name>', 'invoice name')
    .option('-t, --client <clientId>', 'client id (in Project David)')
    .option('-m, --matter <matterId>', 'matter id (in Project David)')
    .option('-e, --externalId [externalId]', 'invoice id in Partner s/w')
    .action(function(options){
        pdClient.createInvoice(callback, options);
    });

program
    .command('create-paylink')
    .description('creates Paylink entity in Project David')
    .option('-t, --client <clientId>', 'client id (in Project David)')
    .option('-c, --customer <customerId>', 'customer id (in Project David)')
    .option('-a, --amount <amount>', 'Amount (in cents)', parseInt)
    .option('-s, --trustAmount [amount]', 'Trust Account amount (in cents)', parseInt)
    .option('-m, --matter [matterId]', 'matter id (in Project David)')
    .option('-e, --externalId [externalId]', 'reference id in Partner s/w')
    .option('-l, --paymentTitle [title]', 'Title for payment page')
    .option('-d, --paymentDescription [desc]', 'Description for payment page')
    .action(function(options){
        pdClient.createPaylink(callback, options);
    });

program
    .on('command:*', function () {
        console.error('Invalid command: %s\nUse command "help" for a list of available commands.', program.args.join(' '));
        callback(null);
    });

function myEval(input, ctx, filename, cb) {
    let terms = input.match(/[0-9a-zA-Z-]+|"(?:\\"|[^"])+"/g); // treat double-quoted phrase as single term
    terms = terms.map(term => term.replace(/\"/g, '')); // get rid of double-quotes
    terms = ['ignore', 'pdclient>'].concat(terms); // to keep commander happy

    callback = function(arg1, arg2) { // save the callback for use in action handlers
        resetOptions(program); // commander doesn't clear option values. We do the hammer approach
        cb(arg1, arg2);
    }
    program.parse(terms);
}

const r = repl.start({ prompt: 'pdclient> ', eval: myEval });

function resetOptions(program) {
    for (const command of program.commands) {
        const optionNames = command.options.map(opt => opt.long.substr(2));
        for (const optionName of optionNames) {
            if (command[optionName] && typeof(command[optionName]) === 'string') {
                delete command[optionName];
            }
        }
    }
}