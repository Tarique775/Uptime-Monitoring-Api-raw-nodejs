const http = require('http');
const { handleReqRes } = require('../helper/handleReqRes');
const environment = require('../helper/environment');

const server = {};

server.create = () => {
    const serverCreate = http.createServer(handleReqRes);
    serverCreate.listen(environment.port, () => {
        console.log(`listen on port ${environment.port}`);
    });
};

server.init = () => {
    server.create();
};

module.exports = server;
