const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../route');
const { NotFoundHandler } = require('../handler/routeHandler/NotFoundHandler');
const { parseJson } = require('./utilities');

const handler = {};

handler.handleReqRes = (req, res) => {
    const parseUrl = url.parse(req.url, true);
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const queryString = parseUrl.query;
    const headerobj = req.headers;
    const method = req.method.toLowerCase();

    const decoder = new StringDecoder('utf-8');

    let realData = '';

    const requestobj = {
        parseUrl,
        path,
        trimmedPath,
        queryString,
        headerobj,
        method,
    };

    const chossenHandler = routes[trimmedPath] ? routes[trimmedPath] : NotFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        // console.log(realData);
        requestobj.body = parseJson(realData);
        chossenHandler(requestobj, (statusCode, payload) => {
            const statusCodes = typeof statusCode === 'number' ? statusCode : 500;
            const payloads = typeof payload === 'object' ? payload : {};

            const stringPayload = JSON.stringify(payloads);

            res.setHeader('Content-Type', 'application/JSON');
            res.writeHead(statusCodes);
            res.end(stringPayload);
        });
        // res.end('hello');
    });

  // res.end('hello');
};

module.exports = handler;
