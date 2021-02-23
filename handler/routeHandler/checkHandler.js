const data = require('../../lib/data');
const { parseJson, createrandom } = require('../../helper/utilities');
const { maxchecks } = require('../../helper/environment');
const tokenHandle = require('./tokenHandler');

const handlers = {};

handlers.checkHandler = (requestobj, callback) => {
    const acceptedrequest = ['get', 'post', 'put', 'delete'];
    if (acceptedrequest.indexOf(requestobj.method) > -1) {
        handlers.checks[requestobj.method](requestobj, callback);
    } else {
        callback(405);
    }
};

handlers.checks = {};

handlers.checks.post = (requestobj, callback) => {
    const protocol = typeof requestobj.body.protocol === 'string' && ['http', 'https'].indexOf(requestobj.body.protocol) > -1 ? requestobj.body.protocol : false;

    const url = typeof requestobj.body.url === 'string' && requestobj.body.url.trim().length > 0 ? requestobj.body.url : false;

    const method = typeof requestobj.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestobj.body.method) > -1 ? requestobj.body.method : false;

    const successCode = typeof requestobj.body.successCode === 'object' && requestobj.body.successCode instanceof Array ? requestobj.body.successCode : false;

    const timeOutSecond = typeof requestobj.body.timeOutSecond === 'number' && requestobj.body.timeOutSecond % 1 === 0 && requestobj.body.timeOutSecond >= 1 && requestobj.body.timeOutSecond <= 5 ? requestobj.body.timeOutSecond : false;

    if (protocol && url && method && successCode && timeOutSecond) {
        const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

        data.read('tokenData', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJson(tokenData).phone;
                data.read('userData', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandle.tokens.veryfiy(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObj = parseJson(userData);
                                const userChecks = typeof userObj.checks === 'object' && userObj.checks instanceof Array ? userObj.checks : [];

                                if (userChecks.length < maxchecks) {
                                    const checkId = createrandom(20);
                                    const checkObj = {
                                        userPhone,
                                        id: checkId,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeOutSecond,
                                    };

                                    data.create('checkData', checkId, checkObj, (err3) => {
                                        if (!err3) {
                                            userObj.checks = userChecks;
                                            userObj.checks.push(checkId);

                                            data.update('userData', userPhone, userObj, (err4) => {
                                                if (!err4) {
                                                    callback(200, checkObj);
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
                                    callback(401, {
                                        error: 'Userhas already reached max check limit!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User not found!',
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
            error: 'You have a problem in your request',
        });
    }
};

handlers.checks.get = (requestobj, callback) => {
    const id = typeof requestobj.queryString.id === 'string' && requestobj.queryString.id.trim().length === 20 ? requestobj.queryString.id : false;

    if (id) {
        data.read('checkData', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

                tokenHandle.tokens.veryfiy(token, parseJson(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, parseJson(checkData));
                    } else {
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handlers.checks.put = (requestobj, callback) => {
    const id = typeof requestobj.body.id === 'string' && requestobj.body.id.trim().length === 20 ? requestobj.body.id : false;

    const protocol = typeof requestobj.body.protocol === 'string' && ['http', 'https'].indexOf(requestobj.body.protocol) > -1 ? requestobj.body.protocol : false;

    const url = typeof requestobj.body.url === 'string' && requestobj.body.url.trim().length > 0 ? requestobj.body.url : false;

    const method = typeof requestobj.body.method === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestobj.body.method) > -1 ? requestobj.body.method : false;

    const successCode = typeof requestobj.body.successCode === 'object' && requestobj.body.successCode instanceof Array ? requestobj.body.successCode : false;

    const timeOutSecond = typeof requestobj.body.timeOutSecond === 'number' && requestobj.body.timeOutSecond % 1 === 0 && requestobj.body.timeOutSecond >= 1 && requestobj.body.timeOutSecond <= 5 ? requestobj.body.timeOutSecond : false;

    if (id) {
        if (protocol || url || method || successCode || timeOutSecond) {
            data.read('checkData', id, (err1, checkData) => {
                const checkObject = parseJson(checkData);
                if (!err1 && checkData) {
                    const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

                    tokenHandle.tokens.veryfiy(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCode) {
                                checkObject.successCode = successCode;
                            }
                            if (timeOutSecond) {
                                checkObject.timeOutSecond = timeOutSecond;
                            }

                            data.update('checkdata', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200, checkObject);
                                } else {
                                    callback(500, {
                                        error: 'server side error!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication error!',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'There was a problem in the server side!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You must provide at least one field to update!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handlers.checks.delete = (requestobj, callback) => {
    const id = typeof requestobj.queryString.id === 'string' && requestobj.queryString.id.trim().length === 20 ? requestobj.queryString.id : false;

    if (id) {
        data.read('checkData', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const token = typeof requestobj.headerobj.token === 'string' ? requestobj.headerobj.token : false;

                tokenHandle.tokens.veryfiy(token, parseJson(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        data.delete('checkData', id, (err2) => {
                            if (!err2) {
                                data.read('userData', parseJson(checkData).userPhone, (err3, userData) => {
                                    const userObject = parseJson(userData);
                                    if (!err3 && userData) {
                                        const userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                        const checkPosition = userChecks.indexOf(id);

                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;

                                            data.update('userData', userObject.phone, userObject, (err4) => {
                                                if (!err4) {
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
                                                error: 'The check id that you are trying to remove is not found in user!',
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'there was a server side problem!',
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    err: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};
module.exports = handlers;
