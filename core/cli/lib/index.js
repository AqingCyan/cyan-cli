'use strict';

module.exports = core;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const { sync: pathExists } = require('path-exists');
const pkg = require('../package.json');
const log = require('@cyan-cli/log');
const constant = require('./constant');

let args, config;

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
  } catch (error) {
    const { error: errorLog } = log;
    errorLog(error.message);
  }
}

/**
 * 检查环境变量并注册
 * 读取的是用户目录下的 .env 文件
 */
function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');

  if (pathExists(dotenvPath)) {
    config = dotenv.config({ path: dotenvPath });
  }

  createDefaultConfig();
}

/**
 * 创建默认环境变量
 */
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };

  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

/**
 * 检查入参
 */
function checkInputArgs() {
  const minimist = require('minimist');
  args = minimist(process.argv.slice(2));
  checkArgs();
}

/**
 * 检查参数类型是否是 debug
 */
function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
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
  const { notice: noticeLog } = log;
  noticeLog('cli', pkg.version);
}
