require('dotenv').config();
const app = require('./src/app');

app.listen(parseInt(process.env.PORT, 10), (listenSocket) => {

    if (listenSocket) {
        console.log(`${process.env.PORT}`);
    }

});