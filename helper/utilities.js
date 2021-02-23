const crypto = require('crypto');
const environment = require('./environment');

const utilities = {};

utilities.parseJson = (string) => {
    let output;
    try {
        output = JSON.parse(string);
    } catch {
        output = {};
    }
    return output;
};

utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environment.secretkey).update(str).digest('hex');
        return hash;
  }
    return false;
};

utilities.createrandom = (strlength) => {
    let length = strlength;
    length = typeof strlength === 'number' && strlength > 0 ? strlength : false;
    if (length) {
        const possibleChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let output = '';
        for (let i = 1; i <= length; i++) {
            const randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            output += randomChar;
    }
        return output;
  }

    return false;
};

module.exports = utilities;
