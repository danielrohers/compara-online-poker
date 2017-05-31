const log = require('winston');
const _ = require('lodash');
const ApiService = require('./api');

const isNumberRoyalFlush = (number) => {
  const numbers = {
    T: true,
    J: true,
    Q: true,
    K: true,
    A: true,
  };
  return numbers[number] || false;
};

const getNextNumber = (number) => {
  const numbers = {
    2: '3',
    3: '4',
    4: '5',
    5: '6',
    6: '7',
    7: '8',
    8: '9',
    9: 'T',
    T: 'J',
    J: 'Q',
    Q: 'K',
    K: 'A',
    A: null,
  };
  return numbers[number] || null;
};

const getUniqSuits = cards => _.uniq(cards.map(card => card.suit));
const getUniqNumbers = cards => _.uniq(cards.map(card => card.number));

const isSequenceNumbers = (numbers) => {
  let result = true;
  let next = getNextNumber(numbers[0]);
  for (let i = 1; i < numbers.length; i += 1) {
    const current = numbers[i];
    if (next && next !== current) {
      result = false;
      break;
    }
    next = getNextNumber(current);
  }
  return result;
};

const isSameValues = (cards, value) => {
  const numbers = _.groupBy(cards, 'number');
  let result = false;
  for (const number in numbers) {
    if (numbers[number].length === value) result = true;
  }
  return result;
};

const isSameGroupValues = (cards, groups, value) => {
  const numbers = _.groupBy(cards, 'number');
  let countGroups = 0;
  for (const number in numbers) {
    if (numbers[number].length === value) countGroups += 1;
  }
  return countGroups === groups;
};

module.exports = {

  ROYAL_FLUSH: {
    name: 'Royal Flush',
    value: 10,
  },
  STRAIGHT_FLUSH: {
    name: 'Straight Flush',
    value: 9,
  },
  FOUR_KIND: {
    name: 'Four of a Kind',
    value: 8,
  },
  FULL_HOUSE: {
    name: 'Full House',
    value: 7,
  },
  FLUSH: {
    name: 'Flush',
    value: 6,
  },
  STRAIGHT: {
    name: 'Straight',
    value: 5,
  },
  THREE_KIND: {
    name: 'Three of a Kind',
    value: 4,
  },
  TWO_PAIRS: {
    name: 'Two Pairs',
    value: 3,
  },
  ONE_PAIR: {
    name: 'One Pair',
    value: 2,
  },
  NOTHING: {
    name: 'Nothing',
    value: 1,
  },

  getCards(token, cb) {
    const self = this;
    ApiService.getCards(token, (err, data) => {
      if (data) return cb(null, data);
      log.error(`getCards ${token} - ${err.message}`);
      if (!err.response) return self.getCards(token, cb);
      ApiService.getToken((err, data) => self.getCards(data || token, cb));
    });
  },

  isRoyalFlush(cards) {
    const totalSuitTypes = 1;
    const suits = getUniqSuits(cards);
    if (suits.length !== totalSuitTypes) return false;

    const totalNumbers = 5;
    const numbers = getUniqNumbers(cards);
    if (numbers.length !== totalNumbers) return false;

    const numbersRoyalFlysh = numbers.map(number => isNumberRoyalFlush(number));
    return _.countBy(numbersRoyalFlysh, Boolean).true === totalNumbers;
  },

  isStraightFlush(cards) {
    const totalSuitTypes = 1;
    const suits = getUniqSuits(cards);
    if (suits.length !== totalSuitTypes) return false;

    const totalNumbers = 5;
    const numbers = getUniqNumbers(cards);
    if (numbers.length !== totalNumbers) return false;

    return isSequenceNumbers(numbers);
  },

  isFourKind(cards) {
    return isSameValues(cards, 4);
  },

  isFullHouse(cards) {
    if (!isSameValues(cards, 3)) return false;
    return isSameGroupValues(cards, 1, 2);
  },

  isFlush(cards) {
    const totalSuits = 5;
    const suits = getUniqSuits(cards);
    return suits.length === totalSuits;
  },

  isStraight(cards) {
    const totalNumebers = 5;
    const numbers = getUniqNumbers(cards);
    if (numbers.length !== totalNumebers) return false;
    return isSequenceNumbers(numbers);
  },

  isTreeKind(cards) {
    return isSameValues(cards, 3);
  },

  isTwoPairs(cards) {
    return isSameGroupValues(cards, 2, 2);
  },

  isOnePair(cards) {
    return isSameValues(cards, 2);
  },

  getHand(cards) {
    if (this.isRoyalFlush(cards)) return this.ROYAL_FLUSH;
    else if (this.isStraightFlush(cards)) return this.STRAIGHT_FLUSH;
    else if (this.isFourKind(cards)) return this.FOUR_KIND;
    else if (this.isFullHouse(cards)) return this.FULL_HOUSE;
    else if (this.isFlush(cards)) return this.FLUSH;
    else if (this.isStraight(cards)) return this.STRAIGHT;
    else if (this.isTreeKind(cards)) return this.THREE_KIND;
    else if (this.isTwoPairs(cards)) return this.TWO_PAIRS;
    else if (this.isOnePair(cards)) return this.ONE_PAIR;
    return this.NOTHING;
  },

  getSuitValue(number) {
    const numbers = {
      T: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };
    return numbers[number] || Number(number);
  },

};
