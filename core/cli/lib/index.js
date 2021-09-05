'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const { sync: pathExists } = require('path-exists');
const pkg = require('../package.json');
const { notice: noticeLog, error: errorLog } = require('@cyan-cli/log');
const constant = require('./constant');

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (error) {
    errorLog(error.message);
  }
}

/**
 * 检查用户主目录是否存在
 */
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在'));
  }
}

/**
 * 检查 root 权限，如果是 root 用户进行降级处理
 */
function checkRoot() {
  const rootCheck = require('root-check');
  rootCheck();
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
