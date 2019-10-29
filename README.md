# Project David Sample Apps

## pdclient

This is a REPL (Read-Eval-Print-Loop) tool written in Javascript for Project David developer partners to explore its RESTful API. It uses the API to create, retrieve and updated `Customer`, `Client`, `Matter`, `Invoice` and `Paylink` entities. More about these entities can be found in _Project David Partner API Guide_.

Please contact Project David Admin at <admin@project-david.net> to get this guide and a partner account in the Project David sandbox environment.

The primary objective of the tool is to familiarize a developer with the Project David Partner API entities, their properties and relationships, authentication mechanism, and request/response messages. The source code is made available on AS IS basis for understanding purposes only and is not be construed as a recommendation to use a particular architecture, programming language, or library.

### Running The Tool

1. Make sure that you have a fairly recent version of Node (Node 8.10+ will do) on your local machine.
2. Clone the `sampleapps` Git repo, change to the base directory of the tool and install dependencies:
   ```
   git clone git@github.com:project-david/sampleapps.git
   cd sampleapps/pdclient/js
   npm install
   ```
3. The code relies on `dotenv` module to store and access environment variables from `.env` file. You would have got a file containing values specific to your Partner account from Project David admin with a name like `.env.<appId>` where `<appId>` is a unique identifier assigned to your Partner account. Place it unders `pdclient/js` directory, with the filename of `.env`.
4. Now run the tool. `help` lists the various commands supported by the tool and `help <cmd>` shows the options supported by the command. A typical `pdclient` session is shown below:
   <pre><code>
   $ <b>node main.js</b>
   pdclient> <b>help</b>
   Usage: pdclient> [options] [command]
   <i>... snip ...</i>
   list-customers [options]   lists Project David Customer entities
   <i>... snip ...</i>
   pdclient> <b>help list-customers</b>
   Usage: pdclient> list-customers [options]

   lists Project David Customer entities
   <i>... snip ...</i>
   </code></pre>

   The next command lists all the Customer entities:
   <pre><code>
   pdclient> <b>list-customers</b>
   { records: 
   [ { <i>... snip ...</i> },
     { <i>... snip ...</i> } ],
   totalCount: 2,
   pageNo: 1,
   pageSize: 25 }
   </code></pre>

   As you can see, the returned message supports pagination to handle large number of entities.

   You can also view the raw HTTP messages exchanged by issuing `show-headers on`, as done in the next `create-customer` command:
   <pre><code>
   pdclient> <b>show-headers on</b>
   'show-headers: true'
   pdclient> <b>create-customer -n "XYZ Inc" -e b762ed30-b287-41ab-9d52-a680ae11da37</b>
   > POST https://okm5wgjc5b.execute-api.us-west-2.amazonaws.com/dev/pd/v1/entities/Customer
   > Authorization: Bearer eyJhb...-zZBQ
   > X-PRAHARI-APPID: my-app1
   > X-PRAHARI-ORGID: 2841558a-b11e-4dc8-a67d-f4c3437e4bcd
   > Content-Type: application/json
   {
     "name": "XYZ Inc",
     "externalId": "b762ed30-b287-41ab-9d52-a680ae11da37",
     "appId": "my-app1"
   }

   < 200 OK
   < content-type=application/json; charset=utf-8
   < content-length=657
   ... snip ...
    {
        id: '039b3732-5109-4a59-87ac-06dbbfc70fdf',
        name: 'XYZ Inc',
        externalId: 'b762ed30-b287-41ab-9d52-a680ae11da37',
        ... snip ...
    }
   pdclient> <b>show-headers off</b>
   'show-headers: false'
   </code></pre>
   Use of external id (external to Project David, internal to partner software) allows the mapping between partner software assigned id to Project David assigned id to be stored within Project David.

   <pre><code>
   pdclient> <b>list-customers -e b762ed30-b287-41ab-9d52-a680ae11da37</b>
   { records: 
    [ 
        { 
            externalId: 'b762ed30-b287-41ab-9d52-a680ae11da37',
            id: '039b3732-5109-4a59-87ac-06dbbfc70fdf',
            name: 'XYZ Inc',
            <i>... snip ...</i>
        }
    ]
    <i>... snip ...</i>
   }
   </code></pre>

   Next, we will create a client and generate a Paylink for the client.
   <pre><code>
   pdclient> <b>help create-client</b>
   <i>... snip ...</i>
   # replace the -c option with a valid customer id in your session
   pdclient> <b>create-client -f John -l Doe -m "john.doe@gmail.com" -c 039b3732-5109-4a59-87ac-06dbbfc70fdf</b>
   { firstName: 'John',
     lastName: 'Doe',
     email: 'john.doe@gmail.com',
     externalId: null,
     id: 'a28ac5e1-2c47-46e6-bd2a-796b23ce9201',
   <i>... snip ...</i>
   # now create a Paylink with $200 for operating account and $100 for the trust account
   pdclient> <b>create-paylink -a 20000 -s 10000 -t a28ac5e1-2c47-46e6-bd2a-796b23ce9201 -c 039b3732-5109-4a59-87ac-06dbbfc70fdf</b>
   <i>... snip ...</i>
   # the output has the link that can be sent to the client for making payment via Credit Card, ACH or Check.
   pdclient> <b>.exit</b>
   </code></pre>

There are many more commands to create and list Project David entities (_Note: commands to update and remove are coming soon_). 