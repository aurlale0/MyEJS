var databaseConfig = require('dotenv').config();

module.exports = (function () {
    return {
        local: {
            host: process.env.DB_HOST,
            port: process.env.SERVER_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        },
        product: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        },
        develope: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        }
    }
})();