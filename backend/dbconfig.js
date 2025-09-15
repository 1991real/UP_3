require('dotenv').config();

const config = {
    "user": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "server": process.env.DB_SERVER,
    "database": process.env.DB_DATABASE,
    connectionTimeout: 30000, // Increase timeout to 30 seconds
    requestTimeout: 30000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
     options: {
                encrypt: false,
                trustServerCertificate: true
            }
};
module.exports = config;