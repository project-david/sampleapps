const http = require('http');
const crypto = require('crypto');

function verifyHmacSignature(hmacSignature, data, secretKey) {
    const hmac = crypto.createHmac('sha512', secretKey);
    hmac.update(data);
    const computedHMACSignature = hmac.digest('base64');
    return computedHMACSignature === hmacSignature;
}

const port = process.env.PORT || 6000;
const secretKey = process.env.SECRET_KEY || 'MySecret';
//create a server object:
http.createServer((req, res) => {
    console.log('Message Received::');
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);

    // Extract signature
    let hmacSignature;
    Object.keys(req.headers).forEach((key) => {
        if (key.toUpperCase() === 'X-PRAHARI-SIGNATURE') {
            hmacSignature = req.headers[key];
        }
    });

    // Read request body
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        console.log('Body:', body);
        const result = verifyHmacSignature(hmacSignature, body, secretKey);
        console.log('Signature verification result:', result);
        res.end(); //end the response
    });
}).listen(port, (err) => {
    if (err) {
        return console.log(`Cannot listen on port ${port}:`, err);
    }
    console.log(`Server is listening on ${port} ...`)
});