const environment = {};

environment.staging = {
    port: 2222,
    envName: 'staging',
    secretkey: 'agyhdg',
    maxchecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    },
};

environment.production = {
    port: 3333,
    envName: 'production',
    secretkey: 'sdfdsf',
    maxchecks: 5,
    twilio: {
        fromUser: '',
        accountSid: '',
        authToken: '',
    },
};

const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const exportToEnvironment = typeof environment[currentEnvironment] === 'object' ? environment[currentEnvironment] : {};

module.exports = exportToEnvironment;
