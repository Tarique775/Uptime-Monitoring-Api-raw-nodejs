const handlers = {};

handlers.sampleHandler = (requestobj, callback) => {
    console.log(requestobj);
    callback(200, {
        msg: 'connection ok',
    });
};

module.exports = handlers;
