'use strict';

const Package = require('@cyan-cli/package');
const { verbose: verboseLog } = require('@cyan-cli/log');
const path = require('path');

const SETTINGS = {
  init: '@cyan-cli/core', // TODO 记得改回来
};

const CACHE_DIR = 'dependencies';

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg;
  verboseLog('targetPath', targetPath);
  verboseLog('homePath', homePath);

  // 获取到命令真实使用的包名（arguments自己看MDN复习吧，command执行命令调用方法的时候会传入一些参数）
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = '0.0.2'; // TODO 记得改回来

  if (!targetPath) {
    // 没有缓存路径则生成缓存路径
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, 'node_modules');

    verboseLog('targetPath', targetPath);
    verboseLog('storeDir', storeDir);

    pkg = new Package({ targetPath, packageName, packageVersion, storeDir });

    if (await pkg.exists()) {
      await pkg.update(); // 更新 package
    } else {
      await pkg.install(); // 安装 package
    }
  } else {
    pkg = new Package({ targetPath, packageName, packageVersion });
  }

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    require(rootFile).apply(null, arguments);
  }
}

module.exports = exec;
