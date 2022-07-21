const express = require('express');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
var path = require('path');
const bodyParser = require('body-parser');

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
      'script-src': [SELF, INLINE, 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js', 'https://unpkg.com/new-i18n@3.0.0-5/lib/index.js'],
      'style-src': [SELF, INLINE],
      'img-src': [SELF, INLINE],
      'worker-src': [NONE],
      'block-all-mixed-content': true
  }
}));
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'index.html'));
});

app.get('/Bestellungen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'Bestellungen.html'));
});

app.get('/Shopping', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'Shopping.html'));
});


app.get('/Strom', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'Strom.html'));
});

app.get('/Users', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'Users.html'));
});

app.get('/UserBestellungen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'UserBestellungen.html'));
});

app.use('/assets', express.static(path.join(__dirname, '..', 'www-public', 'assets')));

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
