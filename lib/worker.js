const http = require('http');
const https = require('https');
const url = require('url');
const data = require('./data');
const { parseJson } = require('../helper/utilities');
const { sendTwilioSms } = require('../helper/notification');

const worker = {};

worker.getAllChecks = () => {
    data.list('checkData', (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {
            checks.forEach((check) => {
                data.read('checkData', check, (err2, orginalCheckData) => {
                    if (!err2 && orginalCheckData) {
                        worker.validateCheckData(parseJson(orginalCheckData));
                    } else {
                        console.log('Error could not read any single file');
                    }
                });
            });
        } else {
            console.log('Error could not check file');
        }
    });
};

worker.validateCheckData = (orginalCheckData) => {
    const orginalData = orginalCheckData;
    if (orginalCheckData && orginalCheckData.id) {
        orginalData.state = typeof orginalCheckData.state === 'string' && ['up', 'down'].indexOf(orginalCheckData.state) > -1 ? orginalCheckData.state : 'down';

        orginalData.lastChecked = typeof orginalCheckData.lastChecked === 'number' && orginalCheckData.lastChecked > 0 ? orginalCheckData.lastChecked : false;

        worker.performCheck(orginalData);
    } else {
        console.log('ERror data not found');
    }
};

worker.performCheck = (orginalCheckData) => {
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    let outComeSent = false;

    const parsedUrl = url.parse(`${orginalCheckData.protocol}://${orginalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    const requestDetailes = {
        protocol: `${orginalCheckData.protocol}:`,
        hostname: hostName,
        method: orginalCheckData.method.toUpperCase(),
        path,
        timeOut: orginalCheckData.timeOutSecond * 1000,
    };

    const protocolToUse = orginalCheckData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetailes, (res) => {
        const status = res.statusCode;

        checkOutCome.responseCode = status;
        if (!outComeSent) {
            worker.processCheckOutCome(orginalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        if (!outComeSent) {
            worker.processheCheckOutCome(orginalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeOut',
        };
        if (!outComeSent) {
            worker.processheCheckOutCome(orginalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    req.end();
};

worker.processCheckOutCome = (orginalCheckData, checkOutCome) => {
    const state = !checkOutCome.error && checkOutCome.responseCode && orginalCheckData.successCode.indexOf(checkOutCome.responseCode) ? 'up' : 'down';

    const alertWanted = !!(orginalCheckData.lastChecked && orginalCheckData.state !== state);

    const newCheckData = orginalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checkData', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                worker.alertTosendSms(newCheckData);
            } else {
                console.log(`Alert: your check for ${newCheckData.method} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`);
            }
        } else {
            console.log('there is no file to update');
        }
    });
};

worker.alertTosendSms = (newCheckData) => {
    const msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`user was alerted to a stutas change via sms: ${msg}`);
        } else {
            console.log("'There was a problem sending sms to one of the user!'");
        }
    });
};

worker.loop = () => {
    setInterval(() => {
        worker.getAllChecks();
    }, 8000);
};

worker.init = () => {
    worker.getAllChecks();
    worker.loop();
};

module.exports = worker;
