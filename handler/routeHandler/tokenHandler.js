const data = require('../../lib/data');
const { hash, parseJson, createrandom } = require('../../helper/utilities');

const handlers = {};

handlers.tokenHandler = (requestobj, callback) => {
    const acceptedrequest = ['get', 'post', 'put', 'delete'];
    if (acceptedrequest.indexOf(requestobj.method) > -1) {
        handlers.tokens[requestobj.method](requestobj, callback);
    } else {
        callback(405);
    }
};

handlers.tokens = {};

handlers.tokens.post = (requestobj, callback) => {
    const phone = typeof requestobj.body.phone === 'string' && requestobj.body.phone.trim().length === 11 ? requestobj.body.phone : false;
    const password = typeof requestobj.body.password === 'string' && requestobj.body.password.trim().length > 0 ? requestobj.body.password : false;

    if (phone && password) {
        data.read('userData', phone, (err, userData) => {
            const hashpassword = hash(password);
            if (hashpassword === parseJson(userData).password) {
                const tokenId = createrandom(20);
                const expires = Date.now() + 1460 * 60 * 1000;
                const tokenObj = {
                    phone,
                    id: tokenId,
                    expires,
                };

                data.create('tokenData', tokenId, tokenObj, (err1) => {
                    if (!err1 && tokenObj) {
                        callback(200, tokenObj);
                    } else {
                        callback(500, {
                            error: 'server side error',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is not valid!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handlers.tokens.get = (requestobj, callback) => {
    const id = typeof requestobj.queryString.id === 'string' && requestobj.queryString.id.trim().length === 20 ? requestobj.queryString.id : false;

    if (id) {
        data.read('tokenData', id, (err1, u) => {
            const token = { ...parseJson(u) };
            if (!err1 && token) {
                // delete user.password;
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token was not found!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token was not found!',
        });
    }
};

handlers.tokens.put = (requestobj, callback) => {
    const id = typeof requestobj.body.id === 'string' && requestobj.body.id.trim().length === 20 ? requestobj.body.id : false;
    const extend = !!(typeof requestobj.body.extend === 'boolean' && requestobj.body.extend === true);

    if (id && extend) {
        data.read('tokenData', id, (err1, tokenData) => {
            const tokensObject = parseJson(tokenData);
            if (tokensObject.expires > Date.now()) {
                tokensObject.expires = Date.now() + 1460 * 60 * 1000;

                data.update('tokenData', id, tokensObject, (err2) => {
                    if (!err2) {
                        callback(200, tokensObject);
                    } else {
                        callback(500, {
                            error: 'server side error!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token already expired!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request',
        });
    }
};

handlers.tokens.delete = (requestobj, callback) => {
    const id = typeof requestobj.queryString.id === 'string' && requestobj.queryString.id.trim().length === 20 ? requestobj.queryString.id : false;

    if (id) {
        data.read('tokenData', id, (err1, us) => {
            const usData = { ...parseJson(us) };
            if (!err1 && usData) {
                data.delete('tokenData', id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            msg: 'ok',
                        });
                    } else {
                        callback(500, {
                            error: 'server side error!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a server side error!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

handlers.tokens.veryfiy = (id, phone, callback) => {
    data.read('tokenData', id, (err1, tokenData) => {
        if (!err1 && tokenData) {
            if (parseJson(tokenData).phone === phone && parseJson(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handlers;
