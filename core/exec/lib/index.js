'use strict';

const Package = require('@cyan-cli/package');
const { verbose: verboseLog } = require('@cyan-cli/log');

const SETTINGS = {
  init: '@cyan-cli/init',
};

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;

  verboseLog('targetPath', targetPath);
  verboseLog('homePath', homePath);

  // 获取到命令真实使用的包名（arguments自己看MDN复习吧，command执行命令调用方法的时候会传入一些参数）
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  const pkg = new Package({ targetPath, packageName, packageVersion });
  console.log(pkg);
}

module.exports = exec;
