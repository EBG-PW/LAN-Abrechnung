const express = require('express');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
var path = require('path');
const bodyParser = require('body-parser');
const pm2ctl = require('pm2-ctl');
const ecosystem = require('../../ecosystem.config.js');
const PlugsServer_Process_Name = ecosystem.apps[2].name;

setInterval(function () {
    pm2ctl.SendEvent.ToProcess(PlugsServer_Process_Name, { event: 'KeepAliveNotify', data: { name: "WebServer" } })
}, 55*1000);

const middleware = require('./middleware');
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
    'script-src': [SELF, INLINE],
    'style-src': [SELF, INLINE],
    'img-src': [SELF, INLINE, 'https://twemoji.maxcdn.com/v/13.1.0/72x72/'],
    'worker-src': [NONE],
    'connect-src': [[SELF], `ws://${process.env.WebSocketURL}`, `wss://${process.env.WebSocketURL}`],
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

app.get('/Plugs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'Plugs.html'));
});


app.get('/Inventory', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'Inventory.html'));
})

app.get('/UserBestellungen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'www-public', 'UserBestellungen.html'));
});

app.use('/assets', express.static(path.join(__dirname, '..', 'www-public', 'assets')));
app.use('/api/v1/login/assets', express.static(path.join(__dirname, '..', 'www-public', 'assets'))); //For Login plugin
app.use('/api/v1/login/login/assets', express.static(path.join(__dirname, '..', 'www-public', 'assets'))); //For Login plugin
app.use('/api/v1/register/load/assets', express.static(path.join(__dirname, '..', 'www-public', 'assets'))); //For Register plugin

app.use('/api/v1', api);

app.use(middleware.notFound);
app.use(middleware.errorHandler);

module.exports = app;
