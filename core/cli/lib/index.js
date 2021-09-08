'use strict';

module.exports = core;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const commander = require('commander');
const { sync: pathExists } = require('path-exists');

const pkg = require('../package.json');
const log = require('@cyan-cli/log');
const constant = require('./constant');
const init = require('@cyan-cli/init');
const exec = require('@cyan-cli/exec');

const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    const { error: errorLog } = log;
    errorLog(error.message);
    if (process.env.LOG_LEVEL === 'verbose') {
      console.log(error);
    }
  }
}

/**
 * 注册命令
 */
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');

  /**
   * init 命令注册
   */
  program.command('init [projectName]').option('-f, --force', '是否强制初始化项目').action(exec);

  /**
   * 开启 debug 模式
   */
  program.on('option:debug', function () {
    if (program.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
  });

  /**
   * 指定全局的 targetPath，通过环境变量共享该值
   */
  program.on('option:targetPath', function () {
    if (program.targetPath) {
      process.env.CLI_TARGET_PATH = program.opts().targetPath;
    }
  });

  /**
   * 未知命令处理
   */
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red('未知的命令：' + obj[0]));
    if (availableCommands.length > 0) {
      console.log(colors.cyan('可用的命令：' + availableCommands.join(',')));
    }
  });

  // 没有输入命令
  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }

  program.parse(process.argv);
}

/**
 * 脚手架执行的预先检查
 */
async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
}

/**
 * 检查是否需要更新
 */
async function checkGlobalUpdate() {
  // 获取最新版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmSemverVersion } = require('@cyan-cli/get-npm-info');
  const lastVersions = await getNpmSemverVersion(currentVersion, npmName);

  // 判断提示是否更新
  if (lastVersions && semver.gt(lastVersions, currentVersion)) {
    const { warn } = log;
    const warnInfo = `请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersions} 更新命令：npm install -g ${npmName}`;
    warn('更新提示', colors.yellow(warnInfo));
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
    dotenv.config({ path: dotenvPath });
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
