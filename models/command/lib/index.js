'use strict';

const semver = require('semver');
const colors = require('colors');

const { error: errorLog } = require('@cyan-cli/log');
const constant = require('./constant');

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空！');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！');
    }
    if (argv.length < 1) {
      throw new Error('参数列表为空');
    }
    this._argv = argv;

    let runner = new Promise((resolve, reject) => {
      // 做的好处是（不懂百度）：先将then中的代码添加到微任务之中，等到常规代码执行完成之后在去依次执行这里面微任务里面的代码
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => {
        errorLog(err);
      });
    });
  }

  /**
   * 检查node版本
   */
  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

    if (!semver.gte(currentVersion, lowestNodeVersion)) {
      throw new Error(colors.red(`cyan-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`));
    }
  }

  /**
   * 初始化参数
   */
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  init() {
    throw new Error('init 必须实现!');
  }

  exec() {
    throw new Error('exec必须实现!');
  }
}

module.exports = Command;
