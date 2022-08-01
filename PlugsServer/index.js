require('dotenv').config();
const app = require('./src/app');
const { log } = require('../Web/lib/logger');

app.listen(parseInt(process.env.PORT, 10), (listenSocket) => {

    if (listenSocket) {
        log.info(`Listening: localhost:${process.env.PORT}`);
    }

});