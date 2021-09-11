'use strict';

const path = require('path');
const cp = require('child_process');

const Package = require('@cyan-cli/package');
const { verbose: verboseLog, error: errorLog } = require('@cyan-cli/log');

const SETTINGS = {
  init: '@cyan-cli/init',
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
  const packageVersion = 'latest';

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
    try {
      /**
       * 在当前进程执行：require(rootFile).call(null, Array.from(arguments));
       * 在node子进程执行如下，用 child_process.spawn 执行，需要把上面👆的语句转化成 code
       * inherit 有妙用，看 http://nodejs.cn/api/child_process.html
       */
      const code = 'console.log(123)';
      const child = cp.spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      child.on('error', (error) => {
        errorLog(error);
        process.exit(1);
      });

      child.on('exit', (code) => {
        verboseLog('命令执行成功: ', code);
        process.exit(code);
      });
    } catch (error) {
      errorLog(error);
    }
  }
}

module.exports = exec;
