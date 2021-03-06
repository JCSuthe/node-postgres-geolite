'use strict';

const ConfigValidator = require('./configvalidator');
const db = require('./db');

module.exports = (validateConfig) => new Promise((resolve, reject) => {
  ConfigValidator.validate(validateConfig)
    .then((config) => {
      db(config)
        .then(resolve)
        .catch(reject);
    })
    .catch(reject);
});