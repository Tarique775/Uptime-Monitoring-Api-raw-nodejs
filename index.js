// const http = require('http');
// const { handleReqRes } = require('./helper/handleReqRes');
// const environment = require('./helper/environment');
// const { sendTwilioSms } = require('./helper/notification');

// sendTwilioSms('01846619681', 'hey Tarique', (err) => {
//     console.log('error war', err);
// });
// const data = require('./lib/data');

// data.create('test', 'myfile', { name: 'rana', country: 'usa' }, (err) => {
//     console.log('error was:', err);
// });

// data.read('test', 'myfile', (err, data) => {
//     console.log(err, data);
// });

// data.update('test', 'myfile', { name: 'karim', country: 'uk' }, (err) => {
//     console.log(err);
// });

// data.read('test', 'myfile', (err, data) => {
//     console.log(err, data);
// });

// data.delete('test', 'myfile', (err) => {
//     console.log(err);
// });
const server = require('./lib/server');
const worker = require('./lib/worker');

const app = {};

app.create = () => {
    server.init();
    worker.init();
};

app.create();

module.exports = app;
