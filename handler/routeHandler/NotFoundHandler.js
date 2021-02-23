const handlers = {};

handlers.NotFoundHandler = (requestobj, callback) => {
    // console.log(requestProperties);
    callback(404, {
        msg: 'Not Found',
    });
};

module.exports = handlers;
