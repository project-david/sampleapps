# Gravity Legal `cli`

This is command line tool written in Javascript to explore Gravity Legal APIs. It supports sub-commands like `get`, `create`, `update` etc. on Gravity Legal entities that send HTTP requests to the corresponding endpoints and perform specified operations. More about these entities and operations can be found in _Gravity Legal Partner API Guide_.

Please contact Gravity Legal Admin at <admins@gravity-legal.com> to get this guide and a partner account in the Gravity Legal sandbox environment. You would need access to this account to be able to run the `cli` tool.

*Standard Discalimer: The source code is made available on AS IS basis for understanding purposes only and is not be construed as a recommendation to use a particular architecture, programming language, or library.*

## Getting Familiar with the Tool

1. Make sure that you have a fairly recent version of Node (Node 8.10+ will do) on your local machine.

2. Clone the `sampleapps` Git repo, change to the base directory of the tool and install dependencies:
   <pre><code>
   $ <b>git clone git@github.com:project-david/sampleapps.git</b>
   $ <b>cd sampleapps/cli</b>
   $ <b>npm install</b>
   </code></pre>

3. The code relies on [`dotenv` npm module](https://www.npmjs.com/package/dotenv) to store and access environment variables from `.env` file. Login to your Partner Admin account, click on the `Settings` menu item in the left navigation bar, select `API Settings`, generate a new API token if none is there and download the corresponding `.env` file. Place it in your `cli` directory.

4. Now run the tool. `help` lists the various commands supported by the tool and `help <cmd>` shows the options supported by the command. A typical `pdclient` session is shown below (actual output may vary as the tool evolves):
   
   <pre><code>
   $ <b>node cli.js -h</b>
   Usage: node cli.js [options] [command]

   Gravity Legal command line interface tool<br>
   Options:
     -V, --version              output the version number
     -h, --help                 output usage information<br>
   Commands:
     get [options] &lt;entity&gt;     retrieve entity by id or query expr.
     create [options] &lt;entity&gt;  create entity
     update [options] &lt;entity&gt;  update entity
     eop [options] &lt;entity&gt;     invoke entity op
     iop [options] &lt;entity&gt;     invoke instance op
     sop [options] &lt;operation&gt;  invoke standalone operation
   </code></pre>

5. Get help on a specific command:
   <pre><code>
   $ <b>node cli.js get -h</b>
   Usage: node cli.js get [options] &lt;entity&gt;

   retrieve entities<br>
   Options:
     -i, --id [id]               entity Id
     -s, --select [cspns]        comma separate property names
     -q, --query [where_clause]  where clause expression
     -h, --help                  output usage information
   </code></pre>

6. Run a command:
   <pre><code>
   $ <b>node cli.js get Customer</b>
   {
     "result": {
       "records": [
         ... snip ...
       ]
     }
   }
   </code></pre>
7. Run a command while displaying request and response headers and messages:
   <pre><code>
   $ <b>SHOW_MESSAGES=yes node cli.js get Customer</b>
   > GET https://api-lambda.dev.project-david.net/pd/v1/entities/Customer
   > Authorization: Bearer eyJhbG...GXuLu6Y
   > X-PRAHARI-APPID: tpartnr
   > X-PRAHARI-ORGID: 01157290-ac52-48ec-ae12-f6b2a2d7d7c3
   > Content-Type: application/json

   < 200 OK
   < content-type=application/json; charset=utf-8
   < content-length=5718
   < connection=close
   < date=Sat, 07 Dec 2019 18:32:07 GMT
   ...
   </code></pre>
## Getting Things Done

### Listing Firms

Recall that a Firm is represented by `Customer` entity within Gravity Legal.

We already saw in the previous section that the command <b><code>node cli.js get Customer</code></b> lists the customers of the partner.

Shown below are commands to get `Customer`s with different options. Commands for other entities are very similar.

1. Get a specific `Customer` instance by id:
   <pre><code>
   $ <b>node cli.js get Customer -i bb8c380d-19b9-4e11-b893-482fd3206eda</b>
   </code></pre>

2. Get `Customer`s by name:
   <pre><code>
   $ <b>node cli.js get Customer -q "name=My Test Compnay"</b>
   </code></pre>

*Note: Menu item `Firms` in the Web UI can be used by the partner admin to display and slice-n-dice the list in a visual manner.*

### Create a Firm

You need only to specify property `name` to create a `Customer` object:

<pre><code>
$ <b>node cli.js create Customer -b '{ "name": "My Test Compnay", "externalId": "cus_123456789" }'</b>
</code></pre>

Gavity Legal allows multiple `Customer`s with the same value for `name`, so please check the existing ones before issuing this command.

*Note: The same functionality is available via `New Firm` button in the Web UI under `Firms` page.*

You can check the presence of newly created `Customer` either by listing via `cli` or the Web UI.

### Invite a User to Join as Firm Admin

The following command invites a user to join the newly created Firm, identified by its id, by email address as `admin`. Note that it is invoking instance operation `inviteUser` on `Customer` entity.

<pre><code>
$ <b>node cli.js iop Customer -o inviteUser -i bb8c380d-19b9-4e11-b893-482fd3206eda -b '{"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@example.com", "role": "admin"}'</b>
</code></pre>

*Known Limitation: A user, i.e; an email address, can be member of only one Firm at a time. One implication of this is that you can not invite the partner admin email address to join a Firm.*

The inbox associated with the email address will receive a welcome message to join Gravity Legal. Follow the instructions and login using either the Google Authetication (if the email address supports that) or entering the email address and password in the welcome message. Once chosen, you must use the same method for subsequent logins.

*You can also invite a user using the Web UI.*

### Create a Client

Creating a `Client` object is straight forward. You need to specify the `Customer` id and property `firstName` in the request body. Value of other properties are optional.

<pre><code>
$ <b>node cli.js create Client \
-b '{ "customer": "bb8c380d-19b9-4e11-b893-482fd3206eda", \
"firstName": "John", "lastName": "Smith", \
"email": "john.smith@example.com"}'</b>
</code></pre>

* Select `New Client` in the Web UI in `Clients` page to create a new client.

### Create a Paylink and Add Amount to It

### Transfer from Trust to Operating Account

## `cli` Source Files

`cli.js` source is in just one file: `cli.js`. It makes use of npm module `dotenv` to read environments variables, `commanderjs` to parse commandline options and `node-fetch` to make HTTP calls. The code is fairly straightforward and should be helpful in writing partner system module that interacts with Gravity Legal.
