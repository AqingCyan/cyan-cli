'use strict';

module.exports = core;

const pkg = require('../package.json');
const log = require('@cyan-cli/log');

function core() {
  checkPkgVersion();
}

function checkPkgVersion() {
  log.notice('cli', pkg.version);
}
