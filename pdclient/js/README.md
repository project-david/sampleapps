Sample Apps
===========
pdclient
--------
A REPL tool to explore Project David API for partners.

Steps to try this out:
```
git clone git@github.com:project-david/sampleapps.git
cd sampleapps/pdclient/js
npm install
cp .env.local-dev .env
# replace .env params with appropriate value
node main.js
pdclient> help
... snip ...
pclient> help <cmd>
... snip ...
pdclient> <cmd> <options>
... snip ...
pdclient> .exit
```