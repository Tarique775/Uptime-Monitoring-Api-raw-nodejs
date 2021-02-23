const data = require('../../lib/data');
const { hash, parseJson } = require('../../helper/utilities');
const tokendata = require('./tokenHandler');

const handlers = {};

handlers.userHandler = (requestobj, callback) => {
    const acceptedrequest = ['get', 'post', 'put', 'delete'];
    if (acceptedrequest.indexOf(requestobj.method) > -1) {
        handlers.users[requestobj.method](requestobj, callback);
    } else {
        callback(405);
    }
};
handlers.users = {};

handlers.users.post = (requestobj, callback) => {
    const firstName = typeof requestobj.body.firstName === 'string' && requestobj.body.firstName.trim().length > 0 ? requestobj.body.firstName : false;

    const lastName = typeof requestobj.body.lastName === 'string' && requestobj.body.lastName.trim().length > 0 ? requestobj.body.lastName : false;

    const phone = typeof requestobj.body.phone === 'string' && requestobj.body.phone.trim().length === 11 ? requestobj.body.phone : false;

    const password = typeof requestobj.body.password === 'string' && requestobj.body.password.trim().length > 0 ? requestobj.body.password : false;

    const tosAgreement = !!(typeof requestobj.body.tosAgreement === 'boolean' && requestobj.body.tosAgreement === true);

    if (firstName && lastName && phone && password && tosAgreement) {
        data.read('userData', phone, (err1) => {
            if (err1) {
                const userObj = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                data.create('userData', phone, userObj, (err2) => {
                    if (!err2) {
                        callback(200, userObj);
                    } else {
                        callback(500, {
                            error: 'server side error!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'There is problem in your request!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'client side error!',
        });
    }
};

handlers.users.get = (requestobj, callback) => {
    const phone = typeof requestobj.queryString.phone === 'string' && requestobj.queryString.phone.trim().length === 11 ? requestobj.queryString.phone : false;

    if (phone) {
        const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

        tokendata.tokens.veryfiy(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('userData', phone, (err1, u) => {
                    const user = { ...parseJson(u) };
                    if (!err1 && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(500, {
                            error: 'server side erroe!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'client side error!',
        });
    }
};

handlers.users.put = (requestobj, callback) => {
    const firstName = typeof requestobj.body.firstName === 'string' && requestobj.body.firstName.trim().length > 0 ? requestobj.body.firstName : false;

    const lastName = typeof requestobj.body.lastName === 'string' && requestobj.body.lastName.trim().length > 0 ? requestobj.body.lastName : false;

    const phone = typeof requestobj.body.phone === 'string' && requestobj.body.phone.trim().length === 11 ? requestobj.body.phone : false;

    const password = typeof requestobj.body.password === 'string' && requestobj.body.password.trim().length > 0 ? requestobj.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

            tokendata.tokens.veryfiy(token, phone, (tokenId) => {
                if (tokenId) {
                    data.read('userData', phone, (err1, uData) => {
                        const userData = { ...parseJson(uData) };
                        if (!err1 && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }

                            data.update('userData', phone, userData, (err2) => {
                                if (!err2 && userData) {
                                    callback(200, userData);
                                } else {
                                    callback(500, {
                                        error: 'server side error!',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'There was a problem in your request!',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication problem!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'client side error!',
            });
        }
    } else {
        callback(400, {
            error: 'client side problem!',
        });
    }
};

handlers.users.delete = (requestobj, callback) => {
    const phone = typeof requestobj.queryString.phone === 'string' && requestobj.queryString.phone.trim().length === 11 ? requestobj.queryString.phone : false;

    if (phone) {
        const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

        tokendata.tokens.veryfiy(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('userData', phone, (err1, us) => {
                    const usData = { ...parseJson(us) };
                    if (!err1 && usData) {
                        data.delete('userData', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    msg: 'User was successfully deleted!',
                                });
                            } else {
                                callback(500, {
                                    error: 'server side error!',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'There was a problem in your request!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'client side error!',
        });
    }
};

module.exports = handlers;
