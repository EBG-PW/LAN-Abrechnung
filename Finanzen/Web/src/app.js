const express = require('express');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
var path = require('path');
const bodyParser = require('body-parser');


require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();
app.set('trust proxy', 1); //If Behind PROXY

//app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(expressCspHeader({
  directives: {
      'default-src': [SELF],
      'script-src': [SELF, INLINE, 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'],
      'style-src': [SELF, INLINE],
      'img-src': [SELF, INLINE],
      'worker-src': [NONE],
      'block-all-mixed-content': true
  }
}));
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/html/index.html'));
});
app.get('/lawstuff', (req, res) => {
  res.sendFile(path.join(__dirname + '/html/lawstuff.html'));
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
