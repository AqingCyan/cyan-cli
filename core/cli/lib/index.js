'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors');
const log = require('@cyan-cli/log');
const constant = require('./const');
const pkg = require('../package.json');

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
  } catch (e) {
    log.error(e);
  }
}

// 检查root权限，做自动降级处理
function checkRoot() {
  const rootCheck = require('root-check');
  rootCheck();
}

// 检查node版本
function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gt(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`cyan-cli 需要安装 v${lowestNodeVersion} 以上版本的node.js`));
  }
}

// 检查cli版本
function checkPkgVersion() {
  log.notice('cli', pkg.version);
}
