'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const pkg = require('../package.json');
const { notice: noticeLog, error: errorLog } = require('@cyan-cli/log');
const constant = require('./constant');

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (error) {
    errorLog(error.message);
  }
}

/**
 * 检查node版本
 */
function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`cyan-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`));
  }
}

/**
 * 检查版本
 */
function checkPkgVersion() {
  noticeLog('cli', pkg.version);
}
