const Promise = require('bluebird');
const log = require('winston');
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://services.comparaonline.com/dealer/deck',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

api.interceptors.request.use((config) => {
  log.info(`${config.method} ${config.url}`);
  return config;
}, error => Promise.reject(error));

module.exports = {

  getToken(cb) {
    api
      .post()
      .then(response => cb(null, response.data))
      .catch(cb);
  },

  getCards(token, cb) {
    api
      .get(`${token}/deal/5`)
      .then(response => cb(null, { token, cards: response.data }))
      .catch(cb);
  },

};
