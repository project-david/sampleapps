# Gravity Legal `cli`

This is a command line tool written in Javascript to explore Gravity Legal APIs. It supports sub-commands like `get`, `create`, `update` etc. on Gravity Legal entities that send HTTP requests to the corresponding endpoints and perform specified operations. More about these entities and operations can be found in online [API documentation](http://sandbox.gravity-legal.com/apidocs).

Please contact Gravity Legal Admin at <admins@gravity-legal.com> to get a partner account in the Gravity Legal sandbox environment. You would need to have such an account to be able to run the `cli` tool.

*Standard Discalimer: The source code is made available on AS IS basis for understanding purposes only and is not be construed as a recommendation to use a particular architecture, programming language, or library.*

## Getting Familiar with the Tool

1. Make sure that you have a fairly recent version of Node (Node 8.10+ will do) on your local machine.

2. Clone the `sampleapps` Git repo, change to the base directory and install dependencies:
   <pre><code>
   $ <b>git clone https://github.com/project-david/sampleapps.git</b>
   $ <b>cd sampleapps/cli</b>
   $ <b>npm install</b>
   </code></pre>

3. The code relies on [`dotenv` npm module](https://www.npmjs.com/package/dotenv) to store and access environment variables from `.env` file. Login to your Gravity Legal sandbox partner admin account, click on the `Settings` menu item in the left navigation bar, generate a new API token by clicking on `New API Token` if none exists, and download the corresponding `.env` file. Place it in your `cli` directory.

4. Now run the tool. `help` lists the various commands supported by the tool and `help <cmd>` shows the options supported by the command. A typical `cli` session is shown below (actual output may vary as the tool evolves):
   
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

A few things to note:

1. Details of entities, their properties, relationships and operations are documented in the [API documentation](http://sandbox.gravity-legal.com/apidocs).
2. An Instance operation requires an entity anme and instance id to be specified and an entity operation requires only the entity name, besides the operation. A standalone operation requires only the operation name. The operation arguments are supplied in the body of the request.
3. Create, Update and Operations require arguments as body (value of option <b><code>-b</code></b>), which must be a JSON string.
4. All amounts specified as value of properties are in cents. This is different from what you see in the Web UI, as the Web UI always shows the amount as dollars.
5. Environment variable `SHOW_MESSAGES` allows turning on display of request and response headers and body.



## Getting Things Done

### Listing Firms

A Firm is represented by `Customer` entity within Gravity Legal.

We already saw in the previous section that the command <b><code>node cli.js get Customer</code></b> lists all the customers (of the partner).

Shown below are commands to get `Customer`s with different options. Commands to list objects for other entities are very similar.

1. Get a specific `Customer` instance by id:
   <pre><code>
   $ <b>node cli.js get Customer -i bb8c380d-19b9-4e11-b893-482fd3206eda</b>
   </code></pre>

2. Get `Customer`s by name:
   <pre><code>
   $ <b>node cli.js get Customer -q "name=My Test Compnay"</b>
   </code></pre>

*Note: Menu item `Firms` in the Web UI can be used by the partner admin to display and slice-n-dice the list visually.*

### Create a Firm

The only mandatory property to create a `Customer` object is `name`:

<pre><code>
$ <b>node cli.js create Customer -b '{ "name": "My Test Compnay", "externalId": "cus_123456789" }'</b>
{
  "result": {
    "id": "bb8c380d-19b9-4e11-b893-482fd3206eda",
    ...
  }
}
</code></pre>

Gavity Legal allows multiple `Customer`s with the same value for `name` or `externalId`, so please check the existing ones before issuing this command.

The above command also uses property `externalId` that could be the Id in the partner system. This Id can be used to retrieve the `Customer` object at a later point in time.

<pre><code>
$ <b>node cli.js get Customer -q "externalId=cus_123456789"</b>
{
  "result": {
    "records": [
      {
        "externalId": "cus_123456789",
        "id": "bb8c380d-19b9-4e11-b893-482fd3206eda",
        ...
      }
    ]
  }
}
</code></pre>

Note that the response messages are different for retriving a single object and a list of objects, even if the list has only one item.

*Note: The same functionality is available via **New Firm** button in the Web UI under **Firms** page.*

You can check the presence of newly created `Customer` object via the Web UI as well.

### Invite a User to Join as Firm Admin

The following command invites a user email address to join the newly created Firm, identified by its id as an `admin`. Note that the command is invoking instance operation `inviteUser` on `Customer` object with id `bb8c380d-19b9-4e11-b893-482fd3206eda` and request body `'{"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@example.com", "role": "admin"}'`.

<pre><code>
$ <b>node cli.js iop Customer -o inviteUser -i bb8c380d-19b9-4e11-b893-482fd3206eda \
-b '{"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@example.com", "role": "admin"}'</b>
{
  "result": {
    "id": "c142b48c-76f1-4f8e-a535-e323439be791",
    "firstName": "Jane",
    "lastName": "Doe",
    "status": "OUTSTANDING",
    "email": "jane.doe@example.com",
    "role": "admin"
  }
}
</code></pre>

The inbox associated with the email address will receive a welcome message to join Gravity Legal. Follow the instructions and login using either the Google Authetication (if the email address supports that) or entering the email address and password in the welcome message. Once chosen, you must use the same method for subsequent logins.

*Known Limitation: A user identified by an email address can be member of only one Firm at a time. One implication of this is that you can not invite the partner admin email address to join a Firm. With Google email addresses, you can use `username+subname@domain` to use as many different email addresses you want, all associated with the single Inbox of `username@domain`.*

*You can also invite a user using the Web UI.*

### Create a Client

Creating a `Client` object is straight forward. You need to specify the `Customer` id and property `firstName` in the request body. Value of other properties are optional.

<pre><code>
$ <b>node cli.js create Client -b '{ "customer": "bb8c380d-19b9-4e11-b893-482fd3206eda", \
"firstName": "John", "lastName": "Smith", "email": "john.smith@example.com"}'</b>
</code></pre>

*Select `New Client` on the `Clients` page to create a new client via the Web UI.*

### Create a Paylink

A `Paylink` is associated with a `Customer` and one of its `Client`. Optionally, a `Matter` may also be specified (not specified here).

<pre><code>
$ <b>node cli.js create Paylink -b '{ "customer": "e99eff21-64c8-43aa-97c7-5bc2530bcce5", \
"client": "2b2c3bea-e139-483e-bb36-4a3a00158dd4" }'</b>
{
  "result": {
    "url": "https://pay.dev.project-david.net/?paylink=9fb8942b-6180-44a7-93be-a9af5e956209",
    "id": "9fb8942b-6180-44a7-93be-a9af5e956209",
    "status": "unpaid",
    "outstanding": 0,
    "paid": 0
    ...
  }
}
</code></pre>

Let us add amount to be collected to this `Paylink` by invoking an instance operation on this `Paylink` object:

<pre><code>
$ <b>node cli.js iop Paylink -i 9fb8942b-6180-44a7-93be-a9af5e956209 -o addToPaylink \
-b '{ "trust": { "amount": 100000 }, "operating": { "amount": 20000 } }'</b>
{
  "result": {
    "status": "unpaid",
    "outstanding": 120000,
    "paid": 0,
    "url": "https://pay.dev.project-david.net/?paylink=9fb8942b-6180-44a7-93be-a9af5e956209",
    ...
  }
}
</code></pre>

You can visit the URL to make a payment either by Credit Card or Bank Transfer. Use the test card no. `4242 4242 4242 4242` to make a payment in the sandbox system. Any future date and any three digit value will do for expiry date and CVV, respectively.

### Transfer from Trust to Operating Account

Once the money has been paid into the trust account, operation `trustToOperatingTransfer` can be invoked to effect transfer:

<pre><code>
$ <b>node cli.js sop trustToOperatingTransfer -b '{ "customer": "e99eff21-64c8-43aa-97c7-5bc2530bcce5", "amount": 50000 }'</b>
{
  "result": {
    "success": true
  }
}
</code></pre>

## Using Curl

You can get the feel of the API by also using command line tool [`curl`](https://curl.haxx.se/). This requires specifying the traget URL and HTTP headers as `curl` options. The first step is to set the environment variables `ENV_URL`, `SYSTEM_TOKEN`, `APP_ID` and `ORG_ID` with values in the `.env` file.

Find below examples with `curl`. Use OS specific env. var. expansion expressions for non-Unix platforms.

These are also indicative of how to use any programming language to make Gravity Legal API calls.

Get all `Customer`s :

<pre><code>
curl -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" $ENV_URL/entities/Customer
</code></pre>

Get one `Customer` by `id`:

<pre><code>
curl -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" $ENV_URL/entities/Customer/bb8c380d-19b9-4e11-b893-482fd3206eda
</code></pre>

Get one `Customer` by `externalId`:

<pre><code>
curl -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" $ENV_URL/entities/Customer?externalId=cus_123456789
</code></pre>

Update `Customer.name` (note the use of `PATCH` method, header `Content-Type` and JSON request body):

<pre><code>
curl -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" -d '{"name": "New Test Company" }' $ENV_URL/entities/Customer/bb8c380d-19b9-4e11-b893-482fd3206eda
</code></pre>

Create `Client` for a `Customer` (note the use of `POST` method, header `Content-Type` and JSON request body):

<pre><code>
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" -d '{ "customer": "bb8c380d-19b9-4e11-b893-482fd3206eda", "firstName": "John", "lastName": "Smith", "email": "john.smith@example.com"}' $ENV_URL/entities/Client
</code></pre>

Create `Paylink` and add amount (note use of instance operation):
<pre><code>
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" -d '{ "customer": "bb8c380d-19b9-4e11-b893-482fd3206eda", "client": "2b2c3bea-e139-483e-bb36-4a3a00158dd4"}' $ENV_URL/entities/Paylink

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $SYSTEM_TOKEN" -H "X-PRAHARI-APPID: $APP_ID" -H "X-PRAHARI-ORGID: $ORG_ID" -d '{ "trust": { "amount": 100000 }, "operating": { "amount": 20000 } }' $ENV_URL/entities/Paylink/9fb8942b-6180-44a7-93be-a9af5e956209/addToPaylink
</code></pre>

## `cli` Source Files

`cli.js` source is in just one file: `cli.js`. It makes use of npm module `dotenv` to read environments variables, `commanderjs` to parse commandline options and `node-fetch` to make HTTP calls. The code is fairly straightforward and should be helpful in writing partner system module that interacts with Gravity Legal, either in Javascript or any other language.
