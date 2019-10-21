# Project David Sample Apps

## pdclient

This  is a REPL (Read-Eval-Print-Loop) tool written in Javascript for Project David partners to explore its RESTful API. The API allows the partner software to create `Customer` entities, add `Client` and `Matter` entities and create `Paylink` entities. 

Please contact Project David Admin to get your Partner Account, API token and _Project David Partner API Guide_.

### Running The Tool

1. Make sure that you have a fairly recent version of Node (Node 8.10+ will do) on your local machine.
2. Clone the `sampleapps` Git repo and install dependencies:
   ```
   git clone git@github.com:project-david/sampleapps.git
   cd sampleapps/pdclient/js
   npm install
   ```
3. The code relies on `dotenv` module to store and access environment variables from `.env` file. Get this file containing values specific to your Partner account from Project David admin and place it unders `pdclient/js` directory.
4. Now run the tool. `help` lists the various commands supported by the tool and `help <cmd>` shows the options supported by the command. A typical `pdclient` session is shown below:
   ```
   node main.js
   pdclient> help
   ... snip ...
   pclient> help list-customers
   ... snip ...
   pdclient> list-customers
   ... snip ...
   pdclient> help create-client
   ... snip ...
   # replace <customerId> with a valid Id displayed in the list-customers output to create a Client entity
   pdclient> create-client -f John -l Doe -m john.doe@gmail.com -c <customerId>
   ... snip ...
   # now create a Paylink with $200 for operating account and $100 for the trust account
   pdclient> create-paylink -a 20000 -s 10000 -t <clientId> -c <customerId>
   ... snip ...
   # the output has the link that can be sent to the client for making payment via Credit Card, ACH or Check.
   pdclient> .exit
   ```
   There are many more commands to create and list Project David entities (_Note: commands to update and remove are coming soon_). The current implementation shows the JSON message returned by the API call. Refer to the codebase of request URLs and messages. (_Note: command to enable request and response messages coming soon_).