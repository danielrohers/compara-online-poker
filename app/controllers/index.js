const async = require('async');
const UserService = require('../services/user');
const CardService = require('../services/card');

const getUser = (users = [], name, cb) => {
  const user = users.filter(user => user.name === name)[0];
  if (user) return cb(null, user);
  UserService.save(name, cb);
};

const populateCards = (user, cb) => {
  CardService.getCards(user.token, (err, data) => {
    if (err) return cb(err);
    const { token, cards } = data;
    user.token = token;
    user.cards = cards;
    cb(null, user);
  });
};

const getUsers = (users, cb) => {
  async.concatSeries(['you', 'other'], (name, cb) => {
    async.waterfall([
      async.apply(getUser, users, name),
      async.apply(populateCards),
    ], cb);
  }, cb);
};

const getWinner = (users, cb) => {
  UserService.getWinner(users, (err, winner) => {
    cb(null, {
      users,
      winner,
    });
  });
};

module.exports = {

  renderIndex: (req, res, next) => {
    async.waterfall([
      async.apply(getUsers, req.session.users),
      async.apply(getWinner),
    ], (err, result) => {
      if (err) return next(err);
      const { winner, users } = result;
      req.session.users = users;
      res.render('index', { users, winner });
    });
  },

};
