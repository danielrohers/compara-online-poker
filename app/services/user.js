const _ = require('lodash');
const log = require('winston');
const ApiService = require('./api');
const CardService = require('./card');

module.exports = {

  save(name, cb) {
    const self = this;
    ApiService.getToken((err, token) => {
      if (token) return cb(null, { token, name });
      log.error(`getToken - ${err.message}`);
      self.save(cb);
    });
  },

  getWinner(users, cb) {
    users.forEach((user) => {
      user.hand = CardService.getHand(user.cards);
    });

    let winner;
    const userOne = users[0];
    const userTwo = users[1];

    if (userOne.hand.value === userTwo.hand.value) {
      const getCards = cards => cards.map(card => card.number);
      const cardsOne = getCards(userOne.cards);
      const cardsTwo = getCards(userTwo.cards);

      let currentValue = 0;
      for (let i = 0; i < 5; i += 1) {
        const cardUserOne = CardService.getSuitValue(cardsOne[i]);
        const cardUserTwo = CardService.getSuitValue(cardsTwo[i]);
        if (cardUserOne > currentValue && cardUserOne > cardUserTwo) {
          currentValue = cardUserOne;
          winner = userOne;
        } else if (cardUserTwo > currentValue && cardUserTwo > cardUserOne) {
          currentValue = cardUserTwo;
          winner = userTwo;
        }
      }
    } else {
      winner = _.orderBy(users, ['hand.value'], ['desc'])[0];
    }

    cb(null, winner);
  },

};
