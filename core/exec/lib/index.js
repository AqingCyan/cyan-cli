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
       * 若想在 node 子进程执行如下，用 child_process.spawn 执行，需要把上面的语句转化成 code
       * inherit 有妙用，看 http://nodejs.cn/api/child_process.html
       * args 需要给它瘦身处理一下，只捡入命令执行需要的参数：
       * 因为 child_process 中的 spawn 接受的参数类型是字符串而 argument 是数组不能直接传递，
       * 如果直接使用 JSON.stringify 转换为字符串会因为 arguments 中的循环引用造成报错，所以才会对参数进行处理后使用
       */
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null); // 纯粹的对象，没有原型链，内存占用小
      Object.keys(cmd).forEach((key) => {
        if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;

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
