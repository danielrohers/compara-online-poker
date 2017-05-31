const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const log = require('winston');
const session = require('express-session');

const env = require('./config/env');

const app = express();

app.set('env', env.node_env);

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sess = {
  secret: env.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {},
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));

require('./config/routes')(app);

app.set('port', env.port);
app.listen(app.get('port'), () => {
  log.info(`Express server worker listening on port ${app.get('port')}`);
});

module.exports = app;
